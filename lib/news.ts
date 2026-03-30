import Anthropic from "@anthropic-ai/sdk";
import type { RawArticle } from "./types";
import { getRecentFeedback } from "./storage";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Uses Claude with web search to discover the top 10 news stories happening right now.
 * Searches broadly across all topics — no fixed categories.
 * Incorporates user feedback to avoid topics they've marked as not interesting.
 */
export async function searchTopStories(): Promise<RawArticle[]> {
  // Load recent feedback to avoid topics the user doesn't care about
  const feedback = await getRecentFeedback(30);
  const rejectedTopics = feedback.map((f) => f.headline).slice(0, 20);

  let avoidClause = "";
  if (rejectedTopics.length > 0) {
    avoidClause = `\n\nIMPORTANT — The reader has previously marked these stories/topics as NOT interesting. Avoid similar topics:
${rejectedTopics.map((t) => `- "${t}"`).join("\n")}
Steer away from these subjects unless there is a truly major breaking development.`;
  }

  console.log("[news] Calling Claude with web_search tool...");
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 8192,
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 10,
      },
    ],
    messages: [
      {
        role: "user",
        content: `Search the web for today's most important and newsworthy stories. Find the top 10 stories that matter most right now across any topic — politics, business, technology, science, health, world affairs, culture, sports, environment, or anything else that's genuinely significant.

Do NOT limit yourself to one story per topic. If 3 of the top 10 stories are about politics, that's fine. Pick the 10 most important stories overall.

Exclude video game and gaming news unless it has major business or cultural significance.

For each story, search for multiple sources covering it so we get diverse perspectives.${avoidClause}

Return a JSON array of articles. Each article must have this exact schema:
{
  "title": "Article headline",
  "description": "2-3 sentence summary of the article",
  "content": "Detailed 4-6 sentence description with specific facts, names, numbers, and quotes from the article",
  "url": "URL of the source article",
  "urlToImage": "URL of an image if available, or null",
  "publishedAt": "ISO date string of when published",
  "source": {
    "id": null,
    "name": "Name of the news source"
  }
}

IMPORTANT:
- Find REAL, currently active news stories with REAL URLs from actual news sources
- For each of the 10 major stories, include 2-3 articles from different sources covering the same story
- That means 20-30 articles total, grouped by story
- Include diverse sources: mainstream, wire services, and specialty outlets
- Every URL must be a real, working link you found via web search
- Return ONLY the JSON array, no other text`,
      },
    ],
  });

  console.log(
    `[news] Response received: stop_reason=${response.stop_reason}, blocks=${response.content.length}`
  );

  // Extract the text response (after web search tool use)
  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    console.error(
      "[news] No text block in response. Block types:",
      response.content.map((b) => b.type)
    );
    throw new Error(
      `Claude response contained no text block. Block types: ${response.content.map((b) => b.type).join(", ")}`
    );
  }

  try {
    const text = textBlock.text.trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("[news] No JSON array found in response text:", text.slice(0, 500));
      throw new Error("Claude response did not contain a JSON array");
    }
    const articles = JSON.parse(jsonMatch[0]) as RawArticle[];
    console.log(`[news] Parsed ${articles.length} articles from response`);
    return articles;
  } catch (e) {
    console.error("[news] Failed to parse web search results:", e);
    throw e;
  }
}

export type { RawArticle };
