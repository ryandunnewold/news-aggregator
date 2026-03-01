/**
 * Storage abstraction layer.
 * Uses Vercel KV in production, falls back to in-memory for development.
 */

import type { NewsDigest, UserSettings } from "./types";
import { DEFAULT_CATEGORIES } from "./types";

// In-memory fallback for development
const memStore: Record<string, string> = {};

async function kvGet(key: string): Promise<string | null> {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    const { kv } = await import("@vercel/kv");
    return kv.get<string>(key);
  }
  return memStore[key] ?? null;
}

async function kvSet(key: string, value: string, ttlSeconds?: number): Promise<void> {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    const { kv } = await import("@vercel/kv");
    if (ttlSeconds) {
      await kv.setex(key, ttlSeconds, value);
    } else {
      await kv.set(key, value);
    }
    return;
  }
  memStore[key] = value;
}

// Digest TTL: 30 days
const DIGEST_TTL = 60 * 60 * 24 * 30;

export function digestKey(date: string, period: string): string {
  return `digest:${date}:${period}`;
}

export async function saveDigest(digest: NewsDigest): Promise<void> {
  await kvSet(digestKey(digest.date, digest.period), JSON.stringify(digest), DIGEST_TTL);
}

export async function getDigest(date: string, period: string): Promise<NewsDigest | null> {
  const raw = await kvGet(digestKey(date, period));
  if (!raw) return null;
  return JSON.parse(raw) as NewsDigest;
}

export async function getRecentDigests(days = 7): Promise<NewsDigest[]> {
  const digests: NewsDigest[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    for (const period of ["evening", "midday", "morning"] as const) {
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

// User settings (global for now, could be per-user with auth)
const SETTINGS_KEY = "settings:global";

export async function getSettings(): Promise<UserSettings> {
  const raw = await kvGet(SETTINGS_KEY);
  if (!raw) return { categories: DEFAULT_CATEGORIES };
  return JSON.parse(raw) as UserSettings;
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  await kvSet(SETTINGS_KEY, JSON.stringify(settings));
}
