import type { RawArticle, NewsCategory } from "./types";

const GNEWS_API_BASE = "https://gnews.io/api/v4";

// Map our categories to GNews top-headlines topics
const CATEGORY_MAP: Partial<Record<NewsCategory, string>> = {
  general: "general",
  technology: "technology",
  business: "business",
  science: "science",
  health: "health",
  sports: "sports",
  entertainment: "entertainment",
  world: "world",
  nation: "nation",
};

// Categories that need keyword-based searching via the search endpoint
const KEYWORD_MAP: Partial<Record<NewsCategory, string>> = {
  politics: "politics OR government OR congress OR senate OR election",
  environment: "climate OR environment OR sustainability OR renewable energy",
};

// Exclusion terms per category to filter out unwanted topics.
// GNews supports NOT operator in queries.
const CATEGORY_EXCLUSIONS: Partial<Record<NewsCategory, string>> = {
  technology:
    'NOT "video game" NOT "video games" NOT gaming NOT PlayStation NOT Xbox NOT Nintendo NOT "game release"',
  entertainment:
    'NOT "video game" NOT "video games" NOT gaming NOT esports',
};

interface GNewsArticle {
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  image: string | null;
  publishedAt: string;
  source: {
    id: string | null;
    name: string;
    url: string;
  };
}

function toRawArticle(article: GNewsArticle): RawArticle {
  return {
    title: article.title,
    description: article.description,
    content: article.content,
    url: article.url,
    urlToImage: article.image,
    publishedAt: article.publishedAt,
    source: {
      id: article.source.id,
      name: article.source.name,
    },
  };
}

async function fetchTopHeadlines(
  category: NewsCategory,
  pageSize = 10
): Promise<RawArticle[]> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) throw new Error("GNEWS_API_KEY is not set");

  const gnewsTopic = CATEGORY_MAP[category];
  const keyword = KEYWORD_MAP[category];
  const exclusions = CATEGORY_EXCLUSIONS[category] || "";

  let url: string;

  if (gnewsTopic) {
    // Use top-headlines endpoint for supported categories
    const params = new URLSearchParams({
      category: gnewsTopic,
      lang: "en",
      country: "us",
      max: String(pageSize),
      apikey: apiKey,
    });
    // Add exclusion query if this category has one
    if (exclusions) {
      params.set("q", exclusions);
    }
    url = `${GNEWS_API_BASE}/top-headlines?${params.toString()}`;
  } else if (keyword) {
    // Use search endpoint with keyword search for categories not in GNews topics
    const fullQuery = exclusions ? `${keyword} ${exclusions}` : keyword;
    const params = new URLSearchParams({
      q: fullQuery,
      lang: "en",
      country: "us",
      max: String(pageSize),
      sortby: "publishedAt",
      apikey: apiKey,
    });
    url = `${GNEWS_API_BASE}/search?${params.toString()}`;
  } else {
    const params = new URLSearchParams({
      lang: "en",
      country: "us",
      max: String(pageSize),
      apikey: apiKey,
    });
    url = `${GNEWS_API_BASE}/top-headlines?${params.toString()}`;
  }

  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GNews API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return ((data.articles as GNewsArticle[]) || []).map(toRawArticle);
}

async function fetchDiverseArticles(
  category: NewsCategory,
  topicKeyword: string,
  pageSize = 8
): Promise<RawArticle[]> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) return [];

  const exclusions = CATEGORY_EXCLUSIONS[category] || "";
  const fullQuery = exclusions
    ? `${topicKeyword} ${exclusions}`
    : topicKeyword;

  const params = new URLSearchParams({
    q: fullQuery,
    lang: "en",
    country: "us",
    max: String(pageSize),
    sortby: "publishedAt",
    apikey: apiKey,
  });

  try {
    const res = await fetch(
      `${GNEWS_API_BASE}/search?${params.toString()}`,
      { next: { revalidate: 0 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return ((data.articles as GNewsArticle[]) || []).map(toRawArticle);
  } catch {
    return [];
  }
}

export type { RawArticle };
export { fetchTopHeadlines, fetchDiverseArticles };
