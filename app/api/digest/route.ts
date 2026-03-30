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
  const body = await request.json();

  if (body.secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const period = (body.period as DigestPeriod) || "morning";
  const force = body.force === true;

  const digest = await generateDigest(period, force);

  return NextResponse.json({
    success: true,
    digestId: digest.id,
    period: digest.period,
    storiesGenerated: digest.stories.length,
  });
}
