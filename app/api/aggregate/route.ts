import { NextResponse } from "next/server";
import { generateDigest } from "@/lib/digest";
import { getSettings } from "@/lib/storage";
import type { DigestPeriod } from "@/lib/types";

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
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "midday";
  return "evening";
}
