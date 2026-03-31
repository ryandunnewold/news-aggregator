/**
 * Storage abstraction layer.
 * Uses Vercel KV in production, falls back to in-memory for development.
 */

import type { NewsDigest, StoryFeedback, RawArticle } from "./types";
import { getDateInUserTZ } from "./timezone";

// In-memory fallback for development
const memStore: Record<string, string> = {};

async function kvGet<T>(key: string): Promise<T | null> {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    const { kv } = await import("@vercel/kv");
    // Vercel KV auto-deserializes JSON, so we get back the original object
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

// Digest TTL: 30 days
const DIGEST_TTL = 60 * 60 * 24 * 30;

export function digestKey(date: string, period: string): string {
  return `digest:${date}:${period}`;
}

export async function saveDigest(digest: NewsDigest): Promise<void> {
  const key = digestKey(digest.date, digest.period);
  console.log(`[storage] Saving digest to key="${key}" (${digest.stories.length} stories, TTL=${DIGEST_TTL}s)`);
  await kvSet(key, digest, DIGEST_TTL);
  console.log(`[storage] Digest saved successfully to key="${key}"`);
}

export async function getDigest(date: string, period: string): Promise<NewsDigest | null> {
  const key = digestKey(date, period);
  const result = await kvGet<NewsDigest>(key);
  console.log(`[storage] getDigest key="${key}" — ${result ? `found (${result.stories.length} stories)` : "not found"}`);
  return result;
}

export async function getRecentDigests(days = 7): Promise<NewsDigest[]> {
  const digests: NewsDigest[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = getDateInUserTZ(date);

    for (const period of ["evening", "morning"] as const) {
      const digest = await getDigest(dateStr, period);
      if (digest) digests.push(digest);
    }
  }

  return digests;
}

export async function getLatestDigest(): Promise<NewsDigest | null> {
  const digests = await getRecentDigests(3);
  return digests[0] ?? null;
}

// --- Raw articles (intermediate storage between search and aggregation) ---

const RAW_ARTICLES_TTL = 60 * 60; // 1 hour

function rawArticlesKey(date: string, period: string): string {
  return `raw-articles:${date}:${period}`;
}

export async function saveRawArticles(
  date: string,
  period: string,
  articles: RawArticle[]
): Promise<void> {
  const key = rawArticlesKey(date, period);
  console.log(`[storage] Saving ${articles.length} raw articles to key="${key}" (TTL=${RAW_ARTICLES_TTL}s)`);
  await kvSet(key, articles, RAW_ARTICLES_TTL);
}

export async function getRawArticles(
  date: string,
  period: string
): Promise<RawArticle[] | null> {
  const key = rawArticlesKey(date, period);
  const result = await kvGet<RawArticle[]>(key);
  console.log(`[storage] getRawArticles key="${key}" — ${result ? `found (${result.length} articles)` : "not found"}`);
  return result;
}

async function deleteKey(key: string): Promise<void> {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    const { kv } = await import("@vercel/kv");
    await kv.del(key);
    return;
  }
  delete memStore[key];
}

export async function deleteRawArticles(
  date: string,
  period: string
): Promise<void> {
  await deleteKey(rawArticlesKey(date, period));
}

// --- Story feedback ---

const FEEDBACK_KEY = "feedback:dismissed";
// Feedback TTL: 90 days (so Claude remembers preferences for a while)
const FEEDBACK_TTL = 60 * 60 * 24 * 90;

export async function saveFeedback(feedback: StoryFeedback): Promise<void> {
  const existing = await getRecentFeedback(90);
  existing.push(feedback);
  // Keep only last 100 entries
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
