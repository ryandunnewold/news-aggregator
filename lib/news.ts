import Anthropic from "@anthropic-ai/sdk";
import type { RawArticle } from "./types";
import { getRecentFeedback } from "./storage";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SUBMIT_TOPICS_TOOL: Anthropic.Tool = {
  name: "submit_topics",
  description:
    "Submit the list of top news topics. Call this tool once with all topics.",
  input_schema: {
    type: "object" as const,
    properties: {
      topics: {
        type: "array",
        items: { type: "string" },
        description: "Array of 10 specific, searchable news topic descriptions",
      },
    },
    required: ["topics"],
  },
};

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
 * Uses Claude to identify the top 10 news topics happening right now.
 * A quick call with a single web search to ground in current events.
 */
async function discoverTopics(avoidClause: string): Promise<string[]> {
  console.log("[news] Discovering top 10 news topics...");
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 2,
      },
      SUBMIT_TOPICS_TOOL,
    ],
    tool_choice: { type: "any" },
    messages: [
      {
        role: "user",
        content: `Search the web and identify the top 10 most important and newsworthy stories happening right now. Consider all topics — politics, business, technology, science, health, world affairs, culture, sports, environment, or anything else that's genuinely significant.

Do NOT limit yourself to one story per topic. If 3 of the top 10 stories are about politics, that's fine. Pick the 10 most important stories overall.

Exclude video game and gaming news unless it has major business or cultural significance.${avoidClause}

After searching, call the submit_topics tool with exactly 10 topic strings. Each topic should be a specific, searchable news story description (e.g., "US Senate votes on infrastructure bill", "Tesla Q1 earnings report", "Earthquake in Turkey").`,
      },
    ],
  });

  const toolUseBlock = response.content.find(
    (block) => block.type === "tool_use" && block.name === "submit_topics"
  );

  if (!toolUseBlock || toolUseBlock.type !== "tool_use") {
    console.error("[news] No submit_topics tool call found in topic discovery response");
    return [];
  }

  const input = toolUseBlock.input as { topics: string[] };
  console.log(`[news] Discovered ${input.topics.length} topics`);
  return input.topics;
}

/**
 * Searches for 2-3 articles on a specific news topic using web search.
 * Each call is fast since it only needs to find articles for one topic.
 */
async function searchTopicArticles(topic: string): Promise<RawArticle[]> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 2,
      },
      SUBMIT_ARTICLES_TOOL,
    ],
    tool_choice: { type: "any" },
    messages: [
      {
        role: "user",
        content: `Search the web for news articles about this specific story: "${topic}"

Find 2-3 articles from different news sources covering this story. Include diverse sources: mainstream, wire services, and specialty outlets.

After searching, call the submit_articles tool with the articles you found.

IMPORTANT:
- Every URL must be a real, working link you found via web search
- Include 2-3 articles from different sources`,
      },
    ],
  });

  const toolUseBlock = response.content.find(
    (block) => block.type === "tool_use" && block.name === "submit_articles"
  );

  if (!toolUseBlock || toolUseBlock.type !== "tool_use") {
    console.warn(`[news] No submit_articles tool call for topic "${topic}"`);
    return [];
  }

  const input = toolUseBlock.input as { articles: RawArticle[] };
  return input.articles;
}

/**
 * Uses Claude with web search to discover the top 10 news stories happening right now.
 * First discovers topics, then searches for articles on each topic sequentially.
 * This approach keeps each web search call short, avoiding Vercel timeouts.
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

  // Step 1: Discover the top 10 topics
  const searchStart = Date.now();
  const topics = await discoverTopics(avoidClause);
  if (topics.length === 0) {
    console.error("[news] Topic discovery returned no topics");
    return [];
  }
  console.log(`[news] Found ${topics.length} topics in ${((Date.now() - searchStart) / 1000).toFixed(1)}s, searching for articles...`);

  // Step 2: Search for articles on each topic sequentially
  const allArticles: RawArticle[] = [];
  for (const topic of topics) {
    console.log(`[news] Searching articles for: ${topic}`);
    const articles = await searchTopicArticles(topic);
    console.log(`[news]   Found ${articles.length} articles`);
    allArticles.push(...articles);
  }

  console.log(`[news] Total articles found: ${allArticles.length} from ${new Set(allArticles.map((a) => a.source.name)).size} unique sources`);
  return allArticles;
}

export type { RawArticle };
