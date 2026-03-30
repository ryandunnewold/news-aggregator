import { NextResponse } from "next/server";
import { generateDigest } from "@/lib/digest";
import { getCurrentHourInUserTZ } from "@/lib/timezone";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (getCurrentHourInUserTZ() !== 7) {
    return NextResponse.json({
      success: true,
      skipped: true,
      reason: "Outside morning digest window",
    });
  }

  const digest = await generateDigest("morning");

  return NextResponse.json({
    success: true,
    period: "morning",
    storiesGenerated: digest.stories.length,
    digestId: digest.id,
  });
}
