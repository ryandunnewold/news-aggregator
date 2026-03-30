import { NextResponse } from "next/server";
import { generateDigest } from "@/lib/digest";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[cron/morning] Starting morning digest generation");
    const digest = await generateDigest("morning");
    console.log(
      `[cron/morning] Digest generated: ${digest.stories.length} stories, id=${digest.id}`
    );

    return NextResponse.json({
      success: true,
      period: "morning",
      storiesGenerated: digest.stories.length,
      digestId: digest.id,
    });
  } catch (error) {
    console.error("[cron/morning] Failed to generate digest:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
