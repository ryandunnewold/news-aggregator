import { NextResponse } from "next/server";
import { aggregatePhase } from "@/lib/digest";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Internal endpoint called by /api/aggregate to run the aggregation phase.
 * Gets its own 300s execution budget, separate from the search phase.
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const digest = await aggregatePhase();

  if (!digest) {
    return NextResponse.json(
      { error: "No raw articles found — run search phase first" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    digestId: digest.id,
    storiesGenerated: digest.stories.length,
  });
}
