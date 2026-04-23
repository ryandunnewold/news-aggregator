import { NextResponse } from "next/server";
import { getLatestDigest } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET() {
  const digest = await getLatestDigest();
  return NextResponse.json(digest);
}
