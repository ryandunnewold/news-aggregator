import { NextResponse } from "next/server";
import { searchPhase } from "@/lib/digest";
import { getDigest } from "@/lib/storage";
import { getTodayInUserTZ } from "@/lib/timezone";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: Request) {
  console.log("[cron/evening] Evening cron triggered");

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn("[cron/evening] Unauthorized request — invalid CRON_SECRET");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = getTodayInUserTZ();

  // Check if digest already exists
  const existing = await getDigest(today, "evening");
  if (existing) {
    console.log(`[cron/evening] Digest already exists for ${today}`);
    return NextResponse.json({
      success: true,
      period: "evening",
      storiesGenerated: existing.stories.length,
      digestId: existing.id,
      cached: true,
    });
  }

  // Phase 1: Search for articles (saves to KV)
  console.log("[cron/evening] Starting search phase");
  const startTime = Date.now();
  const articleCount = await searchPhase("evening");
  console.log(`[cron/evening] Search phase complete: ${articleCount} articles in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);

  if (articleCount === 0) {
    return NextResponse.json(
      { error: "Search returned no articles" },
      { status: 500 }
    );
  }

  // Phase 2: Trigger aggregation via internal fetch (new 300s budget)
  console.log("[cron/evening] Triggering aggregation phase via internal fetch");
  const baseUrl = getBaseUrl(request);
  const aggregateResponse = await fetch(`${baseUrl}/api/aggregate/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CRON_SECRET}`,
    },
    body: JSON.stringify({ period: "evening" }),
  });

  if (!aggregateResponse.ok) {
    const error = await aggregateResponse.text();
    console.error(`[cron/evening] Aggregation failed: ${error}`);
    return NextResponse.json(
      { error: `Aggregation failed: ${error}` },
      { status: 500 }
    );
  }

  const result = await aggregateResponse.json();
  console.log(`[cron/evening] Complete — digestId=${result.digestId}, stories=${result.storiesGenerated}`);
  return NextResponse.json(result);
}

function getBaseUrl(request: Request): string {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}
