import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Settings } from "lucide-react";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NewsLens",
  description:
    "AI-aggregated news from diverse sources, delivered on demand with balanced perspectives.",
};

function getFormattedDate() {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dateStr = getFormattedDate();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
        style={{ background: "#faf8f4" }}
      >
        <header
          className="sticky top-0 z-50 transition-all"
          style={{ borderBottom: "1px solid #e8e4dc", background: "rgba(250,248,244,0.95)", backdropFilter: "blur(12px)" }}
        >
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="text-sm font-semibold tracking-tight"
              style={{ color: "#1a1a18", letterSpacing: "-0.02em" }}
            >
              NewsLens{" "}
              <span style={{ color: "#9e9a90", fontWeight: 400 }}>/ Digest</span>
            </Link>
            <div className="flex items-center gap-6">
              <span className="text-xs" style={{ color: "#6b6860" }}>
                {dateStr}
              </span>
              <Link
                href="/settings"
                className="flex items-center gap-1.5 text-xs transition-colors hover:opacity-70"
                style={{ color: "#6b6860" }}
              >
                <Settings className="h-3.5 w-3.5" />
                Settings
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-10">
          {children}
        </main>

        <Toaster richColors />
      </body>
    </html>
  );
}
