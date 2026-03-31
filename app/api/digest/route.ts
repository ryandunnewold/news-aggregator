/**
 * Manual digest trigger endpoint (for testing / admin use).
 * Requires ADMIN_SECRET in the request body.
 */
import { NextResponse } from "next/server";
import { generateDigest } from "@/lib/digest";
import type { DigestPeriod } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  console.log("[api/digest] Manual digest trigger received");
  const body = await request.json();

  if (body.secret !== process.env.ADMIN_SECRET) {
    console.warn("[api/digest] Unauthorized request — invalid ADMIN_SECRET");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const period = (body.period as DigestPeriod) || "morning";
  const force = body.force === true;
  console.log(`[api/digest] Generating digest: period=${period}, force=${force}`);

  try {
    const startTime = Date.now();
    const digest = await generateDigest(period, force);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`[api/digest] Completed in ${elapsed}s — digestId=${digest.id}, stories=${digest.stories.length}`);

    return NextResponse.json({
      success: true,
      digestId: digest.id,
      period: digest.period,
      storiesGenerated: digest.stories.length,
    });
  } catch (error) {
    console.error("[api/digest] Failed to generate digest:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
