import { NextResponse } from "next/server";
import { getRecentDigests, getDigest } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const period = searchParams.get("period");
  const days = parseInt(searchParams.get("days") ?? "7", 10);

  if (date && period) {
    const digest = await getDigest(date, period);
    if (!digest) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(digest);
  }

  const digests = await getRecentDigests(Math.min(days, 30));
  return NextResponse.json(digests);
}
