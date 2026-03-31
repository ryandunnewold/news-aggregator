import { NextResponse } from "next/server";
import { aggregatePhase } from "@/lib/digest";
import type { DigestPeriod } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Internal endpoint called by cron routes to run the aggregation phase.
 * This gets its own 300s execution budget, separate from the search phase.
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const period = body.period as DigestPeriod;
  const force = body.force === true;

  if (!period || !["morning", "evening"].includes(period)) {
    return NextResponse.json(
      { error: "Invalid period, must be 'morning' or 'evening'" },
      { status: 400 }
    );
  }

  const digest = await aggregatePhase(period, force);

  if (!digest) {
    return NextResponse.json(
      { error: "No raw articles found — run search phase first" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    digestId: digest.id,
    period: digest.period,
    storiesGenerated: digest.stories.length,
  });
}
