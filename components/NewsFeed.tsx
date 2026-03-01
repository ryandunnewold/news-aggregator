"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DigestView } from "@/components/DigestView";
import { EmptyFeed } from "@/components/EmptyFeed";
import type { NewsDigest } from "@/lib/types";
import { format, parseISO } from "date-fns";

interface NewsFeedProps {
  digests: NewsDigest[];
}

export function NewsFeed({ digests }: NewsFeedProps) {
  if (digests.length === 0) {
    return <EmptyFeed />;
  }

  // Group digests by date
  const byDate = digests.reduce<Record<string, NewsDigest[]>>((acc, d) => {
    if (!acc[d.date]) acc[d.date] = [];
    acc[d.date].push(d);
    return acc;
  }, {});

  const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));
  const latestDate = dates[0];

  // Sort periods within each date: evening > midday > morning
  const periodOrder = { evening: 0, midday: 1, morning: 2 };
  for (const date of dates) {
    byDate[date].sort(
      (a, b) => periodOrder[a.period] - periodOrder[b.period]
    );
  }

  return (
    <div className="space-y-6">
      {dates.length > 1 ? (
        <Tabs defaultValue={latestDate}>
          <TabsList className="mb-4">
            {dates.map((date) => (
              <TabsTrigger key={date} value={date}>
                {format(parseISO(date), "MMM d")}
              </TabsTrigger>
            ))}
          </TabsList>
          {dates.map((date) => (
            <TabsContent key={date} value={date} className="space-y-8 mt-0">
              {byDate[date].map((digest) => (
                <DigestView key={digest.id} digest={digest} />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="space-y-8">
          {byDate[latestDate].map((digest) => (
            <DigestView key={digest.id} digest={digest} />
          ))}
        </div>
      )}
    </div>
  );
}
