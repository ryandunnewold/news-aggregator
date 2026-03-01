import { NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/storage";
import type { UserSettings } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  const body = (await request.json()) as UserSettings;

  if (!body.categories || !Array.isArray(body.categories)) {
    return NextResponse.json({ error: "Invalid settings" }, { status: 400 });
  }

  await saveSettings(body);
  return NextResponse.json({ success: true });
}
