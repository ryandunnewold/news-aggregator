import Anthropic from "@anthropic-ai/sdk";
import type { RawArticle } from "./types";
import { getRecentFeedback } from "./storage";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SUBMIT_ARTICLES_TOOL: Anthropic.Tool = {
  name: "submit_articles",
  description:
    "Submit the collected news articles as structured data. Call this tool once with all articles.",
  input_schema: {
    type: "object" as const,
    properties: {
      articles: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string", description: "Article headline" },
            description: {
              type: "string",
              description: "2-3 sentence summary of the article",
            },
            content: {
              type: "string",
              description:
                "Detailed 4-6 sentence description with specific facts, names, numbers, and quotes",
            },
            url: { type: "string", description: "URL of the source article" },
            urlToImage: {
              type: ["string", "null"],
              description: "URL of an image if available, or null",
            },
            publishedAt: {
              type: "string",
              description: "ISO date string of when published",
            },
            source: {
              type: "object",
              properties: {
                id: { type: ["string", "null"] },
                name: {
                  type: "string",
                  description: "Name of the news source",
                },
              },
              required: ["id", "name"],
            },
          },
          required: [
            "title",
            "description",
            "content",
            "url",
            "urlToImage",
            "publishedAt",
            "source",
          ],
        },
      },
    },
    required: ["articles"],
  },
};

/**
 * Uses Claude with web search to discover the top 10 news stories happening right now.
 * Searches broadly across all topics — no fixed categories.
 * Incorporates user feedback to avoid topics they've marked as not interesting.
 */
export async function searchTopStories(): Promise<RawArticle[]> {
  console.log("[news] searchTopStories called");

  // Load recent feedback to avoid topics the user doesn't care about
  const feedback = await getRecentFeedback(30);
  const rejectedTopics = feedback.map((f) => f.headline).slice(0, 20);
  console.log(`[news] Loaded ${feedback.length} feedback entries, ${rejectedTopics.length} rejected topics`);

  let avoidClause = "";
  if (rejectedTopics.length > 0) {
    avoidClause = `\n\nIMPORTANT — The reader has previously marked these stories/topics as NOT interesting. Avoid similar topics:
${rejectedTopics.map((t) => `- "${t}"`).join("\n")}
Steer away from these subjects unless there is a truly major breaking development.`;
  }

  console.log("[news] Sending web search request to Claude Sonnet...");
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 16384,
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 10,
      },
      SUBMIT_ARTICLES_TOOL,
    ],
    tool_choice: { type: "any" },
    messages: [
      {
        role: "user",
        content: `Search the web for today's most important and newsworthy stories. Find the top 10 stories that matter most right now across any topic — politics, business, technology, science, health, world affairs, culture, sports, environment, or anything else that's genuinely significant.

Do NOT limit yourself to one story per topic. If 3 of the top 10 stories are about politics, that's fine. Pick the 10 most important stories overall.

Exclude video game and gaming news unless it has major business or cultural significance.

For each story, search for multiple sources covering it so we get diverse perspectives.${avoidClause}

After searching, call the submit_articles tool with all the articles you found.

IMPORTANT:
- Find REAL, currently active news stories with REAL URLs from actual news sources
- For each of the 10 major stories, include 2-3 articles from different sources covering the same story
- That means 20-30 articles total, grouped by story
- Include diverse sources: mainstream, wire services, and specialty outlets
- Every URL must be a real, working link you found via web search`,
      },
    ],
  });

  // Log response metadata
  const contentTypes = response.content.map((block) => block.type);
  console.log(`[news] Claude response received: stop_reason=${response.stop_reason}, content_blocks=${response.content.length} (types: ${contentTypes.join(", ")}), usage: input=${response.usage.input_tokens} output=${response.usage.output_tokens}`);

  // Extract structured output from the submit_articles tool call
  const toolUseBlock = response.content.find(
    (block) => block.type === "tool_use" && block.name === "submit_articles"
  );

  if (!toolUseBlock || toolUseBlock.type !== "tool_use") {
    console.error(
      "[news] No submit_articles tool call found in response. Stop reason:",
      response.stop_reason,
      "Content block types:",
      contentTypes
    );
    return [];
  }

  const input = toolUseBlock.input as { articles: RawArticle[] };
  console.log(`[news] Parsed ${input.articles.length} articles from ${new Set(input.articles.map((a) => a.source.name)).size} unique sources`);
  return input.articles;
}

export type { RawArticle };
