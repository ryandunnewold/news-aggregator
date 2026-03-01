/**
 * API client for NewsLens.
 * Points to the deployed Next.js web app.
 * Set EXPO_PUBLIC_API_URL in your .env file for local dev.
 */

const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ?? "https://news-aggregator-hazel.vercel.app";

export async function fetchRecentDigests(days = 7) {
  const res = await fetch(`${API_BASE}/api/news?days=${days}`);
  if (!res.ok) throw new Error(`Failed to fetch digests: ${res.status}`);
  return res.json();
}

export async function fetchSettings() {
  const res = await fetch(`${API_BASE}/api/settings`);
  if (!res.ok) throw new Error(`Failed to fetch settings: ${res.status}`);
  return res.json();
}

export async function saveSettings(categories: string[]) {
  const res = await fetch(`${API_BASE}/api/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ categories }),
  });
  if (!res.ok) throw new Error(`Failed to save settings: ${res.status}`);
  return res.json();
}
