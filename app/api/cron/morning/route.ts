import { NextResponse } from "next/server";
import { generateDigest } from "@/lib/digest";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: Request) {
  console.log("[cron/morning] Morning cron triggered");

  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn("[cron/morning] Unauthorized request — invalid CRON_SECRET");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[cron/morning] Starting morning digest generation");
    const startTime = Date.now();
    const digest = await generateDigest("morning");
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`[cron/morning] Completed in ${elapsed}s — digestId=${digest.id}, stories=${digest.stories.length}`);

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
