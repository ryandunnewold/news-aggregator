import Anthropic from "@anthropic-ai/sdk";
import type { RawArticle } from "./types";
import { getRecentFeedback } from "./storage";
import { braveNewsSearch } from "./brave";
import { getTodayInUserTZ, USER_TIMEZONE } from "./timezone";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface SearchQuery {
  topic: string;
  query: string;
}

/**
 * Uses Claude to determine the best search queries for today's top news,
 * then executes those queries via Brave Search API,
 * and returns the results as RawArticle[].
 */
export async function searchTopStories(): Promise<RawArticle[]> {
  console.log("[news] searchTopStories called");
  const today = getTodayInUserTZ();

  // Load recent feedback to avoid topics the user doesn't care about
  const feedback = await getRecentFeedback(30);
  const rejectedTopics = feedback.map((f) => f.headline).slice(0, 20);
  console.log(`[news] Loaded ${feedback.length} feedback entries, ${rejectedTopics.length} rejected topics`);

  let avoidClause = "";
  if (rejectedTopics.length > 0) {
    avoidClause = `\n\nIMPORTANT — The reader has previously marked these stories/topics as NOT interesting. Avoid generating queries for similar topics:
${rejectedTopics.map((t) => `- "${t}"`).join("\n")}
Steer away from these subjects unless there is a truly major breaking development.`;
  }

  // Step 1: Ask Claude to generate search queries for today's top stories
  console.log("[news] Asking Claude to generate search queries...");
  const queries = await generateSearchQueries(today, avoidClause);
  console.log(`[news] Claude generated ${queries.length} search queries`);

  // Step 2: Execute each query via Brave Search API
  console.log("[news] Executing Brave searches...");
  const allArticles: RawArticle[] = [];
  const seenUrls = new Set<string>();

  for (const { topic, query } of queries) {
    try {
      const results = await braveNewsSearch(query, 5);
      console.log(
        `[news] Brave returned ${results.length} results for "${topic}"`
      );

      for (const result of results) {
        if (seenUrls.has(result.url)) continue;
        seenUrls.add(result.url);

        allArticles.push({
          title: result.title,
          description: result.description,
          content: result.description, // Brave provides description/snippet
          url: result.url,
          urlToImage: result.thumbnail?.src ?? null,
          publishedAt: result.publishedAt ?? new Date().toISOString(),
          source: {
            id: null,
            name: extractSourceName(result.url),
          },
        });
      }
    } catch (e) {
      console.error(`[news] Brave search failed for "${topic}":`, e);
      // Continue with other queries
    }
  }

  console.log(
    `[news] Collected ${allArticles.length} unique articles from Brave Search`
  );
  return allArticles;
}

/**
 * Uses Claude to generate search queries for discovering today's top news stories.
 */
async function generateSearchQueries(
  today: string,
  avoidClause: string
): Promise<SearchQuery[]> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are a news editor planning a digest for ${today} in ${USER_TIMEZONE}. Generate search queries to find the top 10 most important and newsworthy stories happening right now.

Think about what's likely making headlines today across politics, business, technology, science, health, world affairs, culture, sports, environment, or any other significant topic.

Do NOT limit yourself to one story per topic. If 3 of the top stories are about politics, that's fine. Pick the 10 most important stories overall.

Exclude video game and gaming news unless it has major business or cultural significance.${avoidClause}

Only include stories with a real current development on ${today} or in the last 24 hours. Do not include evergreen explainers, trend pieces, anniversary coverage, previews, or older stories that are merely still being discussed unless there is a concrete new development right now.

For each story, provide a focused search query that will find latest/current news coverage about that specific development.

Return a JSON array with exactly 10 objects, each with:
{
  "topic": "Brief topic label (e.g., 'Ukraine peace negotiations')",
  "query": "Search query optimized for finding news articles (e.g., 'Ukraine Russia peace talks latest news today')"
}

IMPORTANT:
- Make queries specific enough to find relevant articles
- Bias toward major breaking developments and same-day updates
- Include time-relevant terms like "today", "latest", "breaking", "${today}", and "2026" where appropriate
- Avoid wording that would pull in general background or loosely recent coverage
- Cover diverse topics — not all politics or all tech
- Return ONLY the JSON array, no other text`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") return [];

  try {
    const text = content.text.trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("[news] No JSON array found in query generation response");
      return [];
    }
    return JSON.parse(jsonMatch[0]) as SearchQuery[];
  } catch (e) {
    console.error("[news] Failed to parse search queries:", e);
    return [];
  }
}

/**
 * Extracts a readable source name from a URL hostname.
 */
function extractSourceName(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    // Remove www. prefix and .com/.org/etc suffix for cleaner names
    return hostname
      .replace(/^www\./, "")
      .replace(/\.(com|org|net|co\.uk|io)$/, "")
      .split(".")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  } catch {
    return "Unknown";
  }
}

export type { RawArticle };
