/**
 * Storage abstraction layer.
 * Uses Vercel KV in production, falls back to in-memory for development.
 */

import type { NewsDigest, UserSettings } from "./types";
import { DEFAULT_CATEGORIES } from "./types";

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
  await kvSet(digestKey(digest.date, digest.period), digest, DIGEST_TTL);
}

export async function getDigest(date: string, period: string): Promise<NewsDigest | null> {
  return kvGet<NewsDigest>(digestKey(date, period));
}

export async function getRecentDigests(days = 7): Promise<NewsDigest[]> {
  const digests: NewsDigest[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

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

// User settings (global for now, could be per-user with auth)
const SETTINGS_KEY = "settings:global";

export async function getSettings(): Promise<UserSettings> {
  const stored = await kvGet<UserSettings>(SETTINGS_KEY);
  return stored ?? { categories: DEFAULT_CATEGORIES };
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  await kvSet(SETTINGS_KEY, settings);
}
