"use client";

import { format, parseISO } from "date-fns";
import { Sun, CloudSun, Moon, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StoryCard } from "@/components/StoryCard";
import type { NewsDigest, DigestPeriod } from "@/lib/types";
import { PERIOD_LABELS, PERIOD_TIMES, ALL_CATEGORIES } from "@/lib/types";

const PERIOD_ICONS: Record<DigestPeriod, React.ReactNode> = {
  morning: <Sun className="h-5 w-5 text-amber-500" />,
  midday: <CloudSun className="h-5 w-5 text-sky-500" />,
  evening: <Moon className="h-5 w-5 text-indigo-500" />,
};

interface DigestViewProps {
  digest: NewsDigest;
}

export function DigestView({ digest }: DigestViewProps) {
  const generatedAt = parseISO(digest.generatedAt);

  return (
    <div className="space-y-6">
      {/* Digest header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          {PERIOD_ICONS[digest.period]}
          <div>
            <h2 className="text-xl font-bold">{PERIOD_LABELS[digest.period]}</h2>
            <p className="text-sm text-muted-foreground">
              {format(parseISO(digest.date), "EEEE, MMMM d, yyyy")} &middot;{" "}
              {PERIOD_TIMES[digest.period]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-wrap gap-1">
            {digest.categories.map((cat) => {
              const label = ALL_CATEGORIES.find((c) => c.value === cat)?.label ?? cat;
              return (
                <Badge key={cat} variant="outline" className="text-xs">
                  {label}
                </Badge>
              );
            })}
          </div>
        </div>
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <RefreshCw className="h-3 w-3" />
        <span>
          Generated {format(generatedAt, "h:mm a")} &middot; {digest.stories.length} stories
        </span>
      </div>

      {/* Stories */}
      {digest.stories.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground text-sm">
            No stories found for this digest.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {digest.stories.map((story, i) => (
            <StoryCard key={i} story={story} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
