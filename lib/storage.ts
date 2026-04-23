/**
 * Storage abstraction layer.
 * Uses Vercel KV in production, falls back to in-memory for development.
 *
 * We only ever store a single "latest" digest — regenerating replaces the
 * previous one. No history, no date/period keying.
 */

import type { NewsDigest, StoryFeedback, RawArticle } from "./types";

// In-memory fallback for development
const memStore: Record<string, string> = {};

async function kvGet<T>(key: string): Promise<T | null> {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    const { kv } = await import("@vercel/kv");
    return kv.get<T>(key);
  }
  const raw = memStore[key];
  if (raw == null) return null;
  return JSON.parse(raw) as T;
}

async function kvSet(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    const { kv } = await import("@vercel/kv");
    if (ttlSeconds) {
      await kv.setex(key, ttlSeconds, value);
    } else {
      await kv.set(key, value);
    }
    return;
  }
  memStore[key] = JSON.stringify(value);
}

async function deleteKey(key: string): Promise<void> {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    const { kv } = await import("@vercel/kv");
    await kv.del(key);
    return;
  }
  delete memStore[key];
}

// --- Latest digest (single-slot storage) ---

const LATEST_DIGEST_KEY = "digest:latest";

export async function saveLatestDigest(digest: NewsDigest): Promise<void> {
  console.log(`[storage] Saving latest digest (${digest.stories.length} stories)`);
  await kvSet(LATEST_DIGEST_KEY, digest);
}

export async function getLatestDigest(): Promise<NewsDigest | null> {
  const result = await kvGet<NewsDigest>(LATEST_DIGEST_KEY);
  console.log(`[storage] getLatestDigest — ${result ? `found (${result.stories.length} stories)` : "not found"}`);
  return result;
}

// --- Raw articles (intermediate storage between search and aggregation) ---

const RAW_ARTICLES_KEY = "raw-articles:latest";
const RAW_ARTICLES_TTL = 60 * 60; // 1 hour

export async function saveRawArticles(articles: RawArticle[]): Promise<void> {
  console.log(`[storage] Saving ${articles.length} raw articles (TTL=${RAW_ARTICLES_TTL}s)`);
  await kvSet(RAW_ARTICLES_KEY, articles, RAW_ARTICLES_TTL);
}

export async function getRawArticles(): Promise<RawArticle[] | null> {
  const result = await kvGet<RawArticle[]>(RAW_ARTICLES_KEY);
  console.log(`[storage] getRawArticles — ${result ? `found (${result.length} articles)` : "not found"}`);
  return result;
}

export async function deleteRawArticles(): Promise<void> {
  await deleteKey(RAW_ARTICLES_KEY);
}

// --- Story feedback ---

const FEEDBACK_KEY = "feedback:dismissed";
const FEEDBACK_TTL = 60 * 60 * 24 * 90;

export async function saveFeedback(feedback: StoryFeedback): Promise<void> {
  const existing = await getRecentFeedback(90);
  existing.push(feedback);
  const trimmed = existing.slice(-100);
  await kvSet(FEEDBACK_KEY, trimmed, FEEDBACK_TTL);
}

export async function getRecentFeedback(days = 30): Promise<StoryFeedback[]> {
  const all = await kvGet<StoryFeedback[]>(FEEDBACK_KEY);
  if (!all) return [];

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return all.filter((f) => new Date(f.dismissedAt) >= cutoff);
}
