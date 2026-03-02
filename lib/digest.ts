import { v4 as uuidv4 } from "uuid";
import type { NewsDigest, NewsCategory, DigestPeriod } from "./types";
import { fetchTopHeadlines } from "./news";
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

  // Fetch articles for each category (limit to avoid rate limits)
  const allArticles = await Promise.all(
    categories.map((cat) => fetchTopHeadlines(cat, 8).catch(() => []))
  );

  // Aggregate stories per category
  const storiesPerCategory = await Promise.all(
    categories.map(async (cat, i) => {
      const catArticles = allArticles[i] ?? [];
      if (catArticles.length === 0) return [];
      return aggregateNewsStories(catArticles, cat);
    })
  );

  const allStories = storiesPerCategory.flat();

  // Limit to top 10 stories
  const topStories = allStories.slice(0, 10);

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
