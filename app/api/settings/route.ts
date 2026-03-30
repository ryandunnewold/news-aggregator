import { NextResponse } from "next/server";
import { getRecentFeedback } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET() {
  const feedback = await getRecentFeedback(30);
  return NextResponse.json({
    dismissedTopics: feedback.length,
  });
}
