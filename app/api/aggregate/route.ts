import { NextResponse } from "next/server";
import { generateDigest } from "@/lib/digest";
import { getSettings } from "@/lib/storage";
import type { DigestPeriod } from "@/lib/types";
import { getCurrentHourInUserTZ } from "@/lib/timezone";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const period = (body.period as DigestPeriod) || currentPeriod();
  const force = body.force === true;

  const settings = await getSettings();
  const digest = await generateDigest(settings.categories, period, force);

  return NextResponse.json({
    success: true,
    digestId: digest.id,
    period: digest.period,
    storiesGenerated: digest.stories.length,
  });
}

function currentPeriod(): DigestPeriod {
  const hour = getCurrentHourInUserTZ();
  if (hour < 10) return "morning";
  if (hour < 14) return "midday";
  return "evening";
}
