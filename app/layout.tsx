import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Newspaper, Settings } from "lucide-react";
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
  title: "NewsLens — AI-Powered Unbiased News",
  description:
    "AI-aggregated news from diverse sources, delivered three times a day with balanced perspectives.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <Newspaper className="h-5 w-5" />
              NewsLens
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                href="/"
                className="text-sm px-3 py-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                Feed
              </Link>
              <Link
                href="/settings"
                className="text-sm px-3 py-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground flex items-center gap-1.5"
              >
                <Settings className="h-3.5 w-3.5" />
                Settings
              </Link>
            </nav>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {children}
        </main>

        <Toaster richColors />
      </body>
    </html>
  );
}
