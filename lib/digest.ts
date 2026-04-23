import { v4 as uuidv4 } from "uuid";
import type { NewsDigest } from "./types";
import { searchTopStories } from "./news";
import { aggregateNewsStories } from "./claude";
import {
  saveLatestDigest,
  saveRawArticles,
  getRawArticles,
  deleteRawArticles,
} from "./storage";
import { getTodayInUserTZ } from "./timezone";

/**
 * Phase 1: Search for articles and persist them to KV.
 * Returns the number of articles found, or -1 if raw articles already exist.
 */
export async function searchPhase(): Promise<number> {
  const existing = await getRawArticles();
  if (existing) {
    console.log(
      `[digest] Raw articles already exist (${existing.length} articles), skipping search`
    );
    return -1;
  }

  console.log("[digest] Starting search phase");
  const searchStart = Date.now();
  const rawArticles = await searchTopStories();
  console.log(
    `[digest] Web search returned ${rawArticles.length} raw articles in ${((Date.now() - searchStart) / 1000).toFixed(1)}s`
  );

  if (rawArticles.length === 0) {
    console.warn("[digest] Search returned 0 articles, skipping save");
    return 0;
  }

  await saveRawArticles(rawArticles);
  console.log(`[digest] Saved ${rawArticles.length} raw articles`);
  return rawArticles.length;
}

/**
 * Phase 2: Read raw articles from KV, aggregate into a digest, and save.
 * Returns the completed digest, or null if no raw articles were found.
 */
export async function aggregatePhase(): Promise<NewsDigest | null> {
  const rawArticles = await getRawArticles();
  if (!rawArticles || rawArticles.length === 0) {
    console.error("[digest] No raw articles found");
    return null;
  }

  console.log(`[digest] Starting aggregation phase with ${rawArticles.length} articles`);
  const aggregateStart = Date.now();
  const stories = await aggregateNewsStories(rawArticles);
  console.log(
    `[digest] Aggregation produced ${stories.length} stories in ${((Date.now() - aggregateStart) / 1000).toFixed(1)}s`
  );

  const digest: NewsDigest = {
    id: uuidv4(),
    date: getTodayInUserTZ(),
    generatedAt: new Date().toISOString(),
    stories: stories.slice(0, 10),
  };

  await saveLatestDigest(digest);
  await deleteRawArticles();
  console.log(`[digest] Latest digest saved with ${digest.stories.length} stories`);
  return digest;
}

/**
 * Full single-shot generation (used for local dev / manual triggers).
 * Runs both phases in sequence within a single function invocation.
 */
export async function generateDigest(): Promise<NewsDigest> {
  console.log("[digest] Starting full generation");

  const articleCount = await searchPhase();
  if (articleCount === 0) {
    throw new Error("Search returned no articles");
  }

  const digest = await aggregatePhase();
  if (!digest) {
    throw new Error("Aggregation failed — no raw articles found");
  }

  return digest;
}
