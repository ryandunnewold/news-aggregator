# NewsLens

AI-powered news aggregator that fetches top stories three times a day, sources perspectives from across the political spectrum, and delivers a balanced, factual summary with links to all original sources.

## Features

- **2x daily digests** — Morning (7 AM CT), Afternoon (2 PM CT)
- **AI-powered story discovery** — Claude searches the web to find the top stories across each category
- **AI aggregation** — Claude synthesizes articles from diverse sources into comprehensive reports
- **Multi-perspective reporting** — Each story shows viewpoints from different political and editorial angles
- **Source transparency** — Every claim links back to the original article
- **Category filtering** — Choose which topics to include (tech, politics, world, business, etc.)
- **Zero editorializing** — Strictly factual, neutral language

## Tech Stack

- **Next.js 15** (App Router)
- **Claude AI** (Anthropic) — web search for story discovery + aggregation and balanced reporting
- **Vercel KV** (Redis) — digest storage
- **Vercel Cron Jobs** — scheduled digest generation
- **Tailwind CSS v4 + shadcn/ui** — UI components

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url> news-aggregator
cd news-aggregator
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Fill in:

| Variable            | Where to get it                                        |
| ------------------- | ------------------------------------------------------ |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `KV_REST_API_URL`   | Vercel KV dashboard (see below)                        |
| `KV_REST_API_TOKEN` | Vercel KV dashboard                                    |
| `CRON_SECRET`       | Any random string                                      |
| `ADMIN_SECRET`      | Any random string                                      |

### 3. Set up Vercel KV (local dev)

For local development, you can skip KV — the app uses an in-memory store as a fallback. Digests won't persist between restarts, but everything else works.

For production, create a KV store in your Vercel dashboard and link it to your project.

### 4. Run locally

```bash
npm run dev
```

### 5. Manually trigger a digest (for testing)

```bash
curl -X POST http://localhost:3000/api/digest \
  -H "Content-Type: application/json" \
  -d '{"secret": "your-admin-secret", "period": "morning", "force": true}'
```

## Deploying to Vercel

1. Push to GitHub
2. Import the repo in Vercel
3. Add environment variables in the Vercel dashboard
4. Create a KV store and link it to the project
5. Deploy

The `vercel.json` cron configuration schedules both CST and CDT UTC hours for each digest. The digest deduplicates automatically — if one already exists for the date/period, the second cron hit returns the cached version.

## Cron Schedule

| Digest    | Times (UTC)          | Intended Time (CT) | Endpoint            |
| --------- | -------------------- | ------------------ | ------------------- |
| Morning   | 12:00 PM and 1:00 PM | 7:00 AM year-round | `/api/cron/morning` |
| Afternoon | 7:00 PM and 8:00 PM  | 2:00 PM year-round | `/api/cron/evening` |

> **Note:** Vercel Cron Jobs run in UTC. Both DST offsets are scheduled so the digest runs at the intended local time year-round. Duplicate runs are harmless — the second invocation returns the cached digest.

## API Reference

### `GET /api/news`

Returns recent digests (last 7 days by default).

Query params:

- `days` — number of days to fetch (max 30)
- `date` + `period` — fetch a specific digest

### `POST /api/settings`

Update category preferences.

```json
{ "categories": ["general", "technology", "politics"] }
```

### `POST /api/digest`

Manually trigger digest generation (requires `ADMIN_SECRET`).

```json
{ "secret": "...", "period": "morning", "force": false }
```
