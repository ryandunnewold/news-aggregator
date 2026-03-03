"use client";

import { format, parseISO } from "date-fns";
// parseISO used below for digest.date
import { StoryCard } from "@/components/StoryCard";
import type { NewsDigest } from "@/lib/types";
import { PERIOD_LABELS, PERIOD_TIMES, PERIOD_SYMBOLS } from "@/lib/types";

interface DigestViewProps {
  digest: NewsDigest;
  isFirst?: boolean;
}

export function DigestView({ digest, isFirst = false }: DigestViewProps) {
  return (
    <div>
      {/* Digest header — shown for non-first digests (first is shown in page header) */}
      {!isFirst && (
        <div
          style={{
            paddingBottom: "20px",
            marginBottom: "20px",
            borderBottom: "1px solid #e8e4dc",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "4px" }}>
            <span style={{ fontSize: "16px", color: "#9e9a90" }}>
              {PERIOD_SYMBOLS[digest.period]}
            </span>
            <h2
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: "18px",
                fontWeight: 400,
                color: "#1a1a18",
                margin: 0,
              }}
            >
              {PERIOD_LABELS[digest.period]}
            </h2>
          </div>
          <p style={{ fontSize: "12px", color: "#9e9a90", margin: 0, paddingLeft: "26px" }}>
            {format(parseISO(digest.date), "EEEE, MMMM d, yyyy")} &middot;{" "}
            {PERIOD_TIMES[digest.period]} &middot; {digest.stories.length} stories
          </p>
        </div>
      )}

      {/* Stories */}
      {digest.stories.length === 0 ? (
        <div
          style={{
            border: "1px dashed #e8e4dc",
            borderRadius: "12px",
            padding: "48px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "14px", color: "#9e9a90", margin: 0 }}>
            No stories found for this digest.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {digest.stories.map((story, i) => (
            <StoryCard key={i} story={story} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
