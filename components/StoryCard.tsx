"use client";

import { useState } from "react";
import { ExternalLink, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { AggregatedStory } from "@/lib/types";
import { ALL_CATEGORIES } from "@/lib/types";

interface StoryCardProps {
  story: AggregatedStory;
  index: number;
}


export function StoryCard({ story, index }: StoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const categoryLabel =
    ALL_CATEGORIES.find((c) => c.value === story.category)?.label ??
    story.category;

  return (
    <Card className="overflow-hidden">
      {story.imageUrl && (
        <div className="h-48 w-full overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={story.imageUrl}
            alt={story.headline}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-mono text-muted-foreground">
                #{index + 1}
              </span>
              <Badge variant="secondary" className="text-xs">
                {categoryLabel}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {story.sources.length} source{story.sources.length !== 1 ? "s" : ""}
              </span>
            </div>
            <CardTitle className="text-lg leading-snug">{story.headline}</CardTitle>
          </div>
        </div>
        <CardDescription className="text-sm leading-relaxed mt-2">
          {story.summary}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Key Facts */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
            <BookOpen className="h-3 w-3" />
            Key Facts
          </h4>
          <ul className="space-y-1">
            {story.keyFacts.slice(0, expanded ? undefined : 3).map((fact, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-muted-foreground mt-0.5">•</span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Expand/collapse */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="w-full mb-3 h-8 text-xs text-muted-foreground hover:text-foreground"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5 mr-1" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5 mr-1" />
              See perspectives & sources
            </>
          )}
        </Button>

        {expanded && (
          <>
            <Separator className="mb-4" />

            {/* Perspectives */}
            {story.perspectives.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Perspectives
                </h4>
                <div className="space-y-3">
                  {story.perspectives.map((p, i) => (
                    <div
                      key={i}
                      className="rounded-lg border bg-muted/30 p-3"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold">{p.label}</span>
                        <a
                          href={p.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 shrink-0"
                        >
                          {p.sourceName}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <p className="text-sm text-muted-foreground">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sources */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Sources
              </h4>
              <div className="flex flex-wrap gap-2">
                {story.sources.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  >
                    {s.name}
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
