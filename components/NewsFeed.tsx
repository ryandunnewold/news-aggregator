"use client";

import { useState } from "react";
import { DigestView } from "@/components/DigestView";
import { EmptyFeed } from "@/components/EmptyFeed";
import type { NewsDigest } from "@/lib/types";
import { format, parseISO } from "date-fns";

interface NewsFeedProps {
  digests: NewsDigest[];
}

export function NewsFeed({ digests }: NewsFeedProps) {
  const byDate = digests.reduce<Record<string, NewsDigest[]>>((acc, d) => {
    if (!acc[d.date]) acc[d.date] = [];
    acc[d.date].push(d);
    return acc;
  }, {});

  const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));
  const latestDate = dates[0];

  const periodOrder = { evening: 0, midday: 1, morning: 2 };
  for (const date of dates) {
    byDate[date].sort(
      (a, b) => periodOrder[a.period] - periodOrder[b.period]
    );
  }

  const [activeDate, setActiveDate] = useState(latestDate);

  if (digests.length === 0) {
    return <EmptyFeed />;
  }

  return (
    <div>
      {/* Date selector — only shown when multiple dates exist */}
      {dates.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: "6px",
            marginBottom: "32px",
            flexWrap: "wrap",
          }}
        >
          {dates.map((date) => {
            const isActive = date === activeDate;
            return (
              <button
                key={date}
                onClick={() => setActiveDate(date)}
                style={{
                  fontSize: "13px",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#1a1a18" : "#6b6860",
                  background: isActive ? "#ffffff" : "transparent",
                  border: isActive ? "1px solid #e8e4dc" : "1px solid transparent",
                  borderRadius: "100px",
                  padding: "6px 16px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {format(parseISO(date), "MMM d")}
              </button>
            );
          })}
        </div>
      )}

      {/* Digests for active date */}
      <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
        {(byDate[activeDate] ?? []).map((digest) => (
          <DigestView key={digest.id} digest={digest} />
        ))}
      </div>
    </div>
  );
}
