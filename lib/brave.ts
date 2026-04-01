/**
 * Brave Web Search API client.
 * Used to execute news search queries and return structured results.
 */

export interface BraveSearchResult {
  title: string;
  url: string;
  description: string;
  age?: string;
  page_age?: string;
  publishedAt?: string;
  thumbnail?: { src: string };
}

export interface BraveNewsResult {
  title: string;
  url: string;
  description: string;
  age?: string;
  thumbnail?: { src: string };
  meta_url?: { hostname: string };
}

interface BraveWebSearchResponse {
  web?: { results: BraveSearchResult[] };
  news?: { results: BraveNewsResult[] };
}

/**
 * Search Brave for news articles matching a query.
 * Uses the news search endpoint for fresher results.
 */
export async function braveNewsSearch(
  query: string,
  count = 10
): Promise<BraveSearchResult[]> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) {
    throw new Error("BRAVE_SEARCH_API_KEY environment variable is required");
  }

  const params = new URLSearchParams({
    q: query,
    count: String(count),
    text_decorations: "false",
    search_lang: "en",
    country: "us",
    freshness: "pd", // past day
  });

  const response = await fetch(
    `https://api.search.brave.com/res/v1/web/search?${params}`,
    {
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": apiKey,
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    console.error(`[brave] Search failed (${response.status}):`, text);
    throw new Error(`Brave Search API error: ${response.status}`);
  }

  const data = (await response.json()) as BraveWebSearchResponse;

  // Combine news and web results, preferring news and fresher coverage.
  const results: BraveSearchResult[] = [];

  if (data.news?.results) {
    for (const r of data.news.results) {
      results.push({
        title: r.title,
        url: r.url,
        description: r.description,
        age: r.age,
        publishedAt: parseBravePublishedAt(r.age),
        thumbnail: r.thumbnail,
      });
    }
  }

  if (data.web?.results) {
    for (const r of data.web.results) {
      // Avoid duplicates by URL
      if (!results.some((existing) => existing.url === r.url)) {
        results.push({
          ...r,
          publishedAt: parseBravePublishedAt(r.age ?? r.page_age),
        });
      }
    }
  }

  return results
    .sort(compareByFreshness)
    .slice(0, count);
}

function compareByFreshness(a: BraveSearchResult, b: BraveSearchResult): number {
  const aTime = getFreshnessTimestamp(a);
  const bTime = getFreshnessTimestamp(b);
  return bTime - aTime;
}

function getFreshnessTimestamp(result: BraveSearchResult): number {
  if (!result.publishedAt) return 0;

  const timestamp = Date.parse(result.publishedAt);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function parseBravePublishedAt(value?: string): string | undefined {
  if (!value) return undefined;

  const parsedAbsolute = Date.parse(value);
  if (!Number.isNaN(parsedAbsolute)) {
    return new Date(parsedAbsolute).toISOString();
  }

  const relativeMatch = value
    .trim()
    .toLowerCase()
    .match(/^(\d+)\s+(minute|minutes|hour|hours|day|days)\s+ago$/);

  if (!relativeMatch) return undefined;

  const amount = Number.parseInt(relativeMatch[1], 10);
  const unit = relativeMatch[2];

  if (Number.isNaN(amount)) return undefined;

  const publishedAt = new Date();
  if (unit.startsWith("minute")) {
    publishedAt.setMinutes(publishedAt.getMinutes() - amount);
  } else if (unit.startsWith("hour")) {
    publishedAt.setHours(publishedAt.getHours() - amount);
  } else if (unit.startsWith("day")) {
    publishedAt.setDate(publishedAt.getDate() - amount);
  }

  return publishedAt.toISOString();
}
