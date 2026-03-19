import type { RawArticle, NewsCategory } from "./types";

const NEWS_API_BASE = "https://newsapi.org/v2";

// Map our categories to NewsAPI top-headlines categories
const CATEGORY_MAP: Partial<Record<NewsCategory, string>> = {
  general: "general",
  technology: "technology",
  business: "business",
  science: "science",
  health: "health",
  sports: "sports",
  entertainment: "entertainment",
};

// Categories that need keyword-based searching via the everything endpoint
const KEYWORD_MAP: Partial<Record<NewsCategory, string>> = {
  politics: "politics OR government OR congress OR senate OR election",
  world: "international OR global OR foreign policy",
  nation: "domestic policy OR national OR federal OR legislation",
  environment: "climate OR environment OR sustainability OR renewable energy",
};

// Known sources with political lean for diverse sourcing
const DIVERSE_SOURCES_BY_CATEGORY: Record<string, string[]> = {
  politics: [
    "the-wall-street-journal",
    "the-washington-post",
    "fox-news",
    "msnbc",
    "abc-news",
    "cbs-news",
    "nbc-news",
    "reuters",
    "associated-press",
    "the-hill",
    "politico",
    "axios",
  ],
  general: [
    "reuters",
    "associated-press",
    "bbc-news",
    "the-guardian",
    "the-new-york-times",
    "fox-news",
    "cnn",
    "bloomberg",
    "the-atlantic",
    "axios",
  ],
  technology: [
    "techcrunch",
    "wired",
    "the-verge",
    "ars-technica",
    "hacker-news",
    "engadget",
    "recode",
  ],
  business: [
    "bloomberg",
    "the-wall-street-journal",
    "financial-times",
    "the-economist",
    "business-insider",
    "fortune",
    "cnbc",
  ],
  world: [
    "reuters",
    "associated-press",
    "bbc-news",
    "al-jazeera-english",
    "the-guardian",
    "the-new-york-times",
  ],
  nation: [
    "reuters",
    "associated-press",
    "the-washington-post",
    "the-new-york-times",
    "politico",
    "the-hill",
    "axios",
  ],
  environment: [
    "reuters",
    "associated-press",
    "bbc-news",
    "the-guardian",
    "the-new-york-times",
    "national-geographic",
  ],
  default: ["reuters", "associated-press", "bbc-news", "cnn", "fox-news"],
};

// Exclusion patterns per category — articles matching these are filtered out after fetch
const CATEGORY_EXCLUSION_PATTERNS: Partial<Record<NewsCategory, RegExp>> = {
  technology:
    /\b(video\s*game|video\s*games|gaming|playstation|xbox|nintendo|game\s*release|esports|e-sports|twitch|steam\s*sale)\b/i,
  entertainment:
    /\b(video\s*game|video\s*games|gaming|esports|e-sports|twitch)\b/i,
};

function getSources(category: NewsCategory): string {
  const sources =
    DIVERSE_SOURCES_BY_CATEGORY[category] ||
    DIVERSE_SOURCES_BY_CATEGORY.default;
  return sources.slice(0, 20).join(",");
}

function filterExcludedArticles(
  articles: RawArticle[],
  category: NewsCategory
): RawArticle[] {
  const pattern = CATEGORY_EXCLUSION_PATTERNS[category];
  if (!pattern) return articles;

  return articles.filter((article) => {
    const text = `${article.title || ""} ${article.description || ""}`;
    return !pattern.test(text);
  });
}

async function fetchTopHeadlines(
  category: NewsCategory,
  pageSize = 10
): Promise<RawArticle[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) throw new Error("NEWS_API_KEY is not set");

  const newsApiCategory = CATEGORY_MAP[category];
  const keyword = KEYWORD_MAP[category];

  let url: string;

  if (newsApiCategory) {
    // Use category endpoint for supported categories
    url = `${NEWS_API_BASE}/top-headlines?category=${newsApiCategory}&language=en&pageSize=${pageSize}&apiKey=${apiKey}`;
  } else if (keyword) {
    // Use everything endpoint with keyword search + diverse sources
    const sources = getSources(category);
    url = `${NEWS_API_BASE}/everything?q=${encodeURIComponent(keyword)}&language=en&sortBy=publishedAt&pageSize=${pageSize}&sources=${sources}&apiKey=${apiKey}`;
  } else {
    url = `${NEWS_API_BASE}/top-headlines?language=en&pageSize=${pageSize}&apiKey=${apiKey}`;
  }

  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`NewsAPI error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const articles = (data.articles as RawArticle[]) || [];
  return filterExcludedArticles(articles, category);
}

async function fetchDiverseArticles(
  category: NewsCategory,
  topicKeyword: string,
  pageSize = 8
): Promise<RawArticle[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) return [];

  const sources = getSources(category);
  const url = `${NEWS_API_BASE}/everything?q=${encodeURIComponent(topicKeyword)}&language=en&sortBy=publishedAt&pageSize=${pageSize}&sources=${sources}&apiKey=${apiKey}`;

  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return [];
    const data = await res.json();
    const articles = (data.articles as RawArticle[]) || [];
    return filterExcludedArticles(articles, category);
  } catch {
    return [];
  }
}

export type { RawArticle };
export { fetchTopHeadlines, fetchDiverseArticles };
