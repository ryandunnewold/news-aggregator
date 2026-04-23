import { NextResponse } from "next/server";
import { searchPhase } from "@/lib/digest";
import { getLatestDigest } from "@/lib/storage";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Generate a fresh digest. Uses a two-phase pattern:
 *   Phase 1 (here): run web search, save raw articles to KV.
 *   Phase 2 (/api/aggregate/run): internal fetch gets its own 300s budget.
 *
 * By default, skips regeneration if the latest digest is less than 6 hours old.
 * Pass { force: true } to override.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const force = body.force === true;

  if (!force) {
    const existing = await getLatestDigest();
    if (existing && !isStale(existing.generatedAt)) {
      console.log("[aggregate] Latest digest is fresh (<6h), returning cached");
      return NextResponse.json({
        success: true,
        digestId: existing.id,
        storiesGenerated: existing.stories.length,
        cached: true,
      });
    }
  }

  console.log("[aggregate] Starting search phase");
  const start = Date.now();
  const articleCount = await searchPhase();
  console.log(
    `[aggregate] Search phase complete: ${articleCount} articles in ${((Date.now() - start) / 1000).toFixed(1)}s`
  );

  if (articleCount === 0) {
    return NextResponse.json(
      { success: false, error: "Search returned no articles" },
      { status: 500 }
    );
  }

  console.log("[aggregate] Triggering aggregation phase via internal fetch");
  const baseUrl = getBaseUrl(request);
  const aggregateResponse = await fetch(`${baseUrl}/api/aggregate/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CRON_SECRET}`,
    },
    body: JSON.stringify({}),
  });

  if (!aggregateResponse.ok) {
    const error = await aggregateResponse.text();
    console.error(`[aggregate] Aggregation failed: ${error}`);
    return NextResponse.json(
      { success: false, error: `Aggregation failed: ${error}` },
      { status: 500 }
    );
  }

  const result = await aggregateResponse.json();
  console.log(
    `[aggregate] Complete — digestId=${result.digestId}, stories=${result.storiesGenerated}`
  );
  return NextResponse.json(result);
}

function isStale(generatedAt: string): boolean {
  const ageMs = Date.now() - new Date(generatedAt).getTime();
  return ageMs >= 6 * 60 * 60 * 1000;
}

function getBaseUrl(request: Request): string {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}
