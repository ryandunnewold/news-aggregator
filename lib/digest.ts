import { v4 as uuidv4 } from "uuid";
import type { NewsDigest, DigestPeriod } from "./types";
import { searchTopStories } from "./news";
import { aggregateNewsStories } from "./claude";
import {
  saveDigest,
  getDigest,
  saveRawArticles,
  getRawArticles,
  deleteRawArticles,
} from "./storage";
import { getTodayInUserTZ } from "./timezone";

/**
 * Phase 1: Search for articles and persist them to KV.
 * Returns the number of articles found, or -1 if raw articles already exist.
 */
export async function searchPhase(period: DigestPeriod): Promise<number> {
  const today = getTodayInUserTZ();

  // Check if raw articles already exist (from a previous search that succeeded
  // but whose aggregation failed)
  const existing = await getRawArticles(today, period);
  if (existing) {
    console.log(
      `[digest] Raw articles already exist for ${today}/${period} (${existing.length} articles), skipping search`
    );
    return -1;
  }

  console.log(`[digest] Starting search phase for ${period} on ${today}`);
  const searchStart = Date.now();
  const rawArticles = await searchTopStories();
  console.log(`[digest] Web search returned ${rawArticles.length} raw articles in ${((Date.now() - searchStart) / 1000).toFixed(1)}s`);

  if (rawArticles.length === 0) {
    console.warn("[digest] Search returned 0 articles, skipping save");
    return 0;
  }

  await saveRawArticles(today, period, rawArticles);
  console.log(
    `[digest] Saved ${rawArticles.length} raw articles for ${today}/${period}`
  );
  return rawArticles.length;
}

/**
 * Phase 2: Read raw articles from KV, aggregate into a digest, and save.
 * Returns the completed digest, or null if no raw articles were found.
 */
export async function aggregatePhase(
  period: DigestPeriod,
  force = false
): Promise<NewsDigest | null> {
  const today = getTodayInUserTZ();

  // Check if digest already exists
  if (!force) {
    const existingDigest = await getDigest(today, period);
    if (existingDigest && existingDigest.stories.length > 0) {
      console.log(`[digest] Digest already exists for ${today}/${period} with ${existingDigest.stories.length} stories`);
      return existingDigest;
    }
    if (existingDigest) {
      console.log(`[digest] Found existing digest for ${today}/${period} but it has 0 stories — regenerating`);
    }
  }

  const rawArticles = await getRawArticles(today, period);
  if (!rawArticles || rawArticles.length === 0) {
    console.error(`[digest] No raw articles found for ${today}/${period}`);
    return null;
  }

  console.log(`[digest] Starting aggregation phase for ${period} with ${rawArticles.length} articles`);
  const aggregateStart = Date.now();
  const stories = await aggregateNewsStories(rawArticles);
  console.log(`[digest] Aggregation produced ${stories.length} stories in ${((Date.now() - aggregateStart) / 1000).toFixed(1)}s`);

  const digest: NewsDigest = {
    id: uuidv4(),
    date: today,
    period,
    generatedAt: new Date().toISOString(),
    stories: stories.slice(0, 10),
  };

  await saveDigest(digest);
  await deleteRawArticles(today, period);
  console.log(
    `[digest] Digest saved for ${today}/${period} with ${digest.stories.length} stories`
  );
  return digest;
}

/**
 * Full single-shot generation (used for local dev / manual triggers).
 * Runs both phases in sequence within a single function invocation.
 */
export async function generateDigest(
  period: DigestPeriod,
  force = false
): Promise<NewsDigest> {
  const today = getTodayInUserTZ();
  console.log(`[digest] Starting generation for ${period} on ${today} (force=${force})`);

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

  // Run search phase
  const articleCount = await searchPhase(period);
  if (articleCount === 0) {
    throw new Error("Search returned no articles");
  }

  // Run aggregation phase
  const digest = await aggregatePhase(period, force);
  if (!digest) {
    throw new Error("Aggregation failed — no raw articles found");
  }

  return digest;
}
