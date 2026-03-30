import { v4 as uuidv4 } from "uuid";
import type { NewsDigest, DigestPeriod } from "./types";
import { searchTopStories } from "./news";
import { aggregateNewsStories } from "./claude";
import { saveDigest, getDigest } from "./storage";
import { getTodayInUserTZ } from "./timezone";

export async function generateDigest(
  period: DigestPeriod,
  force = false
): Promise<NewsDigest> {
  const today = getTodayInUserTZ();

  // Check if digest already exists for this period
  if (!force) {
    const existing = await getDigest(today, period);
    if (existing) return existing;
  }

  // Use AI web search to discover top 10 stories across all topics
  const rawArticles = await searchTopStories();

  // Aggregate into 10 distinct stories
  const stories = await aggregateNewsStories(rawArticles);

  const digest: NewsDigest = {
    id: uuidv4(),
    date: today,
    period,
    generatedAt: new Date().toISOString(),
    stories: stories.slice(0, 10),
  };

  await saveDigest(digest);
  return digest;
}
