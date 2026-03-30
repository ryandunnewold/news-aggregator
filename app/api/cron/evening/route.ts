import { NextResponse } from "next/server";
import { generateDigest } from "@/lib/digest";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const digest = await generateDigest("evening");

  return NextResponse.json({
    success: true,
    period: "evening",
    storiesGenerated: digest.stories.length,
    digestId: digest.id,
  });
}
