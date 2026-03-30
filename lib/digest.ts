import { v4 as uuidv4 } from "uuid";
import type { NewsDigest, NewsCategory, DigestPeriod } from "./types";
import { searchNewsForCategory } from "./news";
import { aggregateNewsStories } from "./claude";
import { saveDigest, getDigest } from "./storage";
import { getTodayInUserTZ } from "./timezone";

export async function generateDigest(
  categories: NewsCategory[],
  period: DigestPeriod,
  force = false
): Promise<NewsDigest> {
  const today = getTodayInUserTZ();

  // Check if digest already exists for this period
  if (!force) {
    const existing = await getDigest(today, period);
    if (existing) return existing;
  }

  // Use AI web search to discover stories for each category
  const allArticles = await Promise.all(
    categories.map((cat) => searchNewsForCategory(cat, 3).catch(() => []))
  );

  // Aggregate stories per category using AI
  const storiesPerCategory = await Promise.all(
    categories.map(async (cat, i) => {
      const catArticles = allArticles[i] ?? [];
      if (catArticles.length === 0) return [];
      return aggregateNewsStories(catArticles, cat);
    })
  );

  // Take 1 story per category, up to 10 total
  const topStories = storiesPerCategory
    .map((stories) => stories[0])
    .filter(Boolean)
    .slice(0, 10);

  const digest: NewsDigest = {
    id: uuidv4(),
    date: today,
    period,
    generatedAt: new Date().toISOString(),
    categories,
    stories: topStories,
  };

  await saveDigest(digest);
  return digest;
}
