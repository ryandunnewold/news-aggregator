import { NextResponse } from "next/server";
import { generateDigest } from "@/lib/digest";
import type { DigestPeriod } from "@/lib/types";
import { getCurrentHourInUserTZ } from "@/lib/timezone";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const period = (body.period as DigestPeriod) || currentPeriod();
  const force = body.force === true;

  try {
    const digest = await generateDigest(period, force);

    return NextResponse.json({
      success: true,
      digestId: digest.id,
      period: digest.period,
      storiesGenerated: digest.stories.length,
    });
  } catch (error) {
    console.error("[aggregate] Failed to generate digest:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function currentPeriod(): DigestPeriod {
  const hour = getCurrentHourInUserTZ();
  if (hour < 14) return "morning";
  return "evening";
}
