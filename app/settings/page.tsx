import { getSettings } from "@/lib/storage";
import { CategorySettings } from "@/components/CategorySettings";
import { Clock, Sun, CloudSun, Moon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Customize your news digest preferences.
        </p>
      </div>

      <CategorySettings initialCategories={settings.categories} />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <CardTitle>Digest Schedule</CardTitle>
          </div>
          <CardDescription>
            News digests are automatically generated three times a day.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                icon: <Sun className="h-4 w-4 text-amber-500" />,
                label: "Morning Briefing",
                time: "8:00 AM",
                description: "Start your day with the top overnight and early morning stories.",
              },
              {
                icon: <CloudSun className="h-4 w-4 text-sky-500" />,
                label: "Midday Update",
                time: "2:00 PM",
                description: "Catch up on developments from the morning.",
              },
              {
                icon: <Moon className="h-4 w-4 text-indigo-500" />,
                label: "Evening Wrap-Up",
                time: "8:00 PM",
                description: "Review the day's most significant stories.",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
              >
                <div className="mt-0.5">{item.icon}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong className="text-foreground">1. Fetch</strong> — NewsLens pulls
            top headlines from dozens of sources across the political spectrum,
            including left-leaning, centrist, and right-leaning outlets.
          </p>
          <p>
            <strong className="text-foreground">2. Aggregate</strong> — Claude AI
            groups articles into story clusters and identifies the key facts,
            filtering out editorial opinion.
          </p>
          <p>
            <strong className="text-foreground">3. Balance</strong> — For each story,
            Claude surfaces perspectives from different viewpoints so you see the full
            picture.
          </p>
          <p>
            <strong className="text-foreground">4. Cite</strong> — Every claim links
            back to the original source, so you can read the full article yourself.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
