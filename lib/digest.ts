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
  console.log(`[digest] Generating ${period} digest for ${today} (force=${force})`);

  // Check if digest already exists for this period
  if (!force) {
    const existing = await getDigest(today, period);
    if (existing && existing.stories.length > 0) {
      console.log(`[digest] Found existing ${period} digest for ${today}, returning cached`);
      return existing;
    }
    if (existing) {
      console.log(`[digest] Found existing ${period} digest for ${today} but it has 0 stories — regenerating`);
    }
  }

  // Use AI web search to discover top 10 stories across all topics
  console.log("[digest] Searching for top stories via web search...");
  const rawArticles = await searchTopStories();
  console.log(`[digest] Found ${rawArticles.length} raw articles`);

  if (rawArticles.length === 0) {
    throw new Error("Web search returned no articles — cannot generate digest");
  }

  // Aggregate into 10 distinct stories
  console.log("[digest] Aggregating articles into stories...");
  const stories = await aggregateNewsStories(rawArticles);
  console.log(`[digest] Aggregated into ${stories.length} stories`);

  if (stories.length === 0) {
    throw new Error("Aggregation produced no stories from the raw articles");
  }

  const digest: NewsDigest = {
    id: uuidv4(),
    date: today,
    period,
    generatedAt: new Date().toISOString(),
    stories: stories.slice(0, 10),
  };

  console.log("[digest] Saving digest to storage...");
  await saveDigest(digest);
  console.log(`[digest] Digest saved: id=${digest.id}, stories=${digest.stories.length}`);
  return digest;
}
