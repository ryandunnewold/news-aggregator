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
  console.log(`[digest] Starting generation for ${period} on ${today} (force=${force})`);

  // Check if digest already exists for this period
  if (!force) {
    const existing = await getDigest(today, period);
    if (existing && existing.stories.length > 0) {
      console.log(`[digest] Found existing ${period} digest for ${today} with ${existing.stories.length} stories — returning cached`);
      return existing;
    }
    if (existing) {
      console.log(`[digest] Found existing ${period} digest for ${today} but it has 0 stories — regenerating`);
    } else {
      console.log(`[digest] No existing digest for ${today}/${period}, proceeding with generation`);
    }
  }

  // Use AI web search to discover top 10 stories across all topics
  console.log("[digest] Starting web search for top stories...");
  const searchStart = Date.now();
  const rawArticles = await searchTopStories();
  console.log(`[digest] Web search returned ${rawArticles.length} raw articles in ${((Date.now() - searchStart) / 1000).toFixed(1)}s`);

  if (rawArticles.length === 0) {
    throw new Error("Web search returned no articles — cannot generate digest");
  }

  // Aggregate into 10 distinct stories
  console.log("[digest] Starting story aggregation...");
  const aggregateStart = Date.now();
  const stories = await aggregateNewsStories(rawArticles);
  console.log(`[digest] Aggregation produced ${stories.length} stories in ${((Date.now() - aggregateStart) / 1000).toFixed(1)}s`);

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

  console.log(`[digest] Saving digest ${digest.id} with ${digest.stories.length} stories`);
  await saveDigest(digest);
  const totalElapsed = ((Date.now() - searchStart) / 1000).toFixed(1);
  console.log(`[digest] Digest ${digest.id} saved successfully. Total generation time: ${totalElapsed}s`);
  return digest;
}
