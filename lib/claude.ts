import Anthropic from "@anthropic-ai/sdk";
import type { RawArticle, AggregatedStory } from "./types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SUBMIT_STORIES_TOOL: Anthropic.Tool = {
  name: "submit_stories",
  description:
    "Submit the aggregated news stories as structured data. Call this tool once with all stories.",
  input_schema: {
    type: "object" as const,
    properties: {
      stories: {
        type: "array",
        items: {
          type: "object",
          properties: {
            headline: {
              type: "string",
              description: "Neutral, factual headline (no editorial slant)",
            },
            summary: {
              type: "string",
              description:
                "Detailed 4-6 sentence summary covering who, what, when, where, why, and how",
            },
            keyFacts: {
              type: "array",
              items: { type: "string" },
              description: "Up to 8 specific, detailed facts",
            },
            perspectives: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: {
                    type: "string",
                    description:
                      "Label for this perspective (e.g., 'Conservative view', 'Progressive view')",
                  },
                  description: {
                    type: "string",
                    description:
                      "2-3 sentences describing this angle with specific details",
                  },
                  sourceUrl: {
                    type: "string",
                    description: "URL from the article representing this perspective",
                  },
                  sourceName: { type: "string" },
                },
                required: ["label", "description", "sourceUrl", "sourceName"],
              },
            },
            sources: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  url: { type: "string" },
                },
                required: ["name", "url"],
              },
            },
            imageUrl: {
              type: "string",
              description: "Best image URL from the articles if available",
            },
          },
          required: [
            "headline",
            "summary",
            "keyFacts",
            "perspectives",
            "sources",
          ],
        },
      },
    },
    required: ["stories"],
  },
};

/**
 * Groups raw articles into story clusters by topic and aggregates each
 * into a balanced, factual report with diverse perspectives.
 * Returns exactly 10 stories (or fewer if not enough source material).
 */
export async function aggregateNewsStories(
  articles: RawArticle[]
): Promise<AggregatedStory[]> {
  console.log(`[claude] aggregateNewsStories called with ${articles.length} articles`);
  if (articles.length === 0) {
    console.warn("[claude] No articles to aggregate — returning empty");
    return [];
  }

  // Format articles for the prompt, including content when available
  const articlesText = articles
    .slice(0, 50) // Cap to avoid token limits
    .map(
      (a, i) =>
        `[${i + 1}] SOURCE: ${a.source.name}
URL: ${a.url}
TITLE: ${a.title}
DESCRIPTION: ${a.description ?? "N/A"}
CONTENT: ${a.content ?? "N/A"}
PUBLISHED: ${a.publishedAt}
---`
    )
    .join("\n");

  const prompt = `You are a neutral, factual news aggregator. Your job is to analyze news articles from diverse sources and create detailed, balanced summaries that give the reader all the substantive information so they don't need to click through to the original articles.

Below are news articles from various sources covering today's top stories. These sources represent different political and editorial perspectives.

ARTICLES:
${articlesText}

Your task:
1. Group these articles into distinct news stories (articles about the same event/topic belong together)
2. Rank stories by importance and significance
3. Return exactly 10 stories (or fewer if there aren't enough distinct stories)
4. Each story should be a single topic — do NOT combine unrelated stories

Call the submit_stories tool with the aggregated stories.

IMPORTANT GUIDELINES:
- Be COMPREHENSIVE. The reader should not need to click through to the original articles. Extract every substantive detail: specific names, numbers, dollar amounts, percentages, dates, rankings, lists, quotes, and outcomes.
- If an article mentions a list (e.g., "5 things", "top 10", "key players"), include ALL items from that list in the summary or key facts.
- If an article mentions specific people, companies, amounts, or statistics, include them by name/number.
- Be strictly factual. No opinion, no editorializing, no loaded language.
- Include at least 2-3 different perspectives per major story when multiple sources cover it.
- Key facts should be specific and detailed — not vague summaries. Include exact figures, full names, specific dates, and concrete outcomes.
- If a story only has one source, note that in perspectives.
- Perspectives should represent genuinely different viewpoints, not just different wordings of the same position.
- Do not fabricate information. Only use what's in the provided articles.`;

  console.log(`[claude] Sending ${Math.min(articles.length, 50)} articles to Claude for aggregation...`);
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 16384,
    tools: [SUBMIT_STORIES_TOOL],
    tool_choice: { type: "tool", name: "submit_stories" },
    messages: [{ role: "user", content: prompt }],
  });

  console.log(`[claude] Aggregation response: stop_reason=${message.stop_reason}, usage: input=${message.usage.input_tokens} output=${message.usage.output_tokens}`);

  const toolUseBlock = message.content.find(
    (block) => block.type === "tool_use" && block.name === "submit_stories"
  );

  if (!toolUseBlock || toolUseBlock.type !== "tool_use") {
    console.error(
      "[aggregate] No submit_stories tool call found in response. Stop reason:",
      message.stop_reason
    );
    return [];
  }

  const input = toolUseBlock.input as { stories: AggregatedStory[] };
  console.log(`[claude] Aggregated into ${input.stories.length} stories: ${input.stories.map((s) => s.headline).join(" | ")}`);
  return input.stories;
}

/**
 * Given a list of story headlines/summaries, fetches diverse perspectives
 * from different political/editorial angles using search terms.
 */
export async function generateDigestIntro(
  period: "morning" | "evening",
  storyCount: number
): Promise<string> {
  const periodLabels = {
    morning: "morning",
    evening: "afternoon",
  };

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `Write a brief, neutral 1-2 sentence introduction for a ${periodLabels[period]} news digest. It covers ${storyCount} top stories from today. Be concise, professional, and non-partisan. No greetings or sign-offs.`,
      },
    ],
  });

  const content = message.content[0];
  return content.type === "text" ? content.text : "";
}
