import { NextResponse } from "next/server";
import { saveFeedback } from "@/lib/storage";
import type { StoryFeedback } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.headline || !body?.digestId) {
    return NextResponse.json(
      { error: "headline and digestId are required" },
      { status: 400 }
    );
  }

  const feedback: StoryFeedback = {
    headline: body.headline,
    digestId: body.digestId,
    dismissedAt: new Date().toISOString(),
  };

  await saveFeedback(feedback);

  return NextResponse.json({ success: true });
}
