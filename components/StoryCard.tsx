"use client";

import { useState } from "react";
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import type { AggregatedStory } from "@/lib/types";
import { ALL_CATEGORIES } from "@/lib/types";

interface StoryCardProps {
  story: AggregatedStory;
  index: number;
}

// Accent colors keyed by index for visual variety
const ACCENT_COLORS = [
  "#e66a1e", // orange
  "#2a6496", // blue
  "#2a9d5c", // green
  "#c8a930", // gold
  "#1a2b5c", // navy
  "#b01c2e", // red
  "#7b5ea7", // purple
  "#4a7c59", // forest
];

export function StoryCard({ story, index }: StoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const categoryLabel =
    ALL_CATEGORIES.find((c) => c.value === story.category)?.label ??
    story.category;
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];

  return (
    <article
      style={{
        background: "#ffffff",
        border: "1px solid #e8e4dc",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* Accent bar */}
      <div style={{ height: "3px", background: accent }} />

      <div className="p-6">
        {/* Category + source count */}
        <div className="flex items-center justify-between mb-3">
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#9e9a90",
            }}
          >
            {categoryLabel}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              fontWeight: 500,
              color: "#6b6860",
              background: "#ffffff",
              border: "1px solid #e8e4dc",
              borderRadius: "100px",
              padding: "4px 12px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#2a9d5c",
                display: "inline-block",
              }}
            />
            {story.sources.length} source{story.sources.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Headline */}
        <h2
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "clamp(18px, 2.5vw, 22px)",
            fontWeight: 400,
            lineHeight: 1.3,
            color: "#1a1a18",
            marginBottom: "12px",
            letterSpacing: "-0.01em",
          }}
        >
          {story.headline}
        </h2>

        {/* Summary */}
        <p
          style={{
            fontSize: "15px",
            lineHeight: 1.7,
            color: "#6b6860",
            marginBottom: "20px",
          }}
        >
          {story.summary}
        </p>

        {/* Key Facts */}
        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#9e9a90",
              marginBottom: "12px",
            }}
          >
            Key Facts
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {story.keyFacts.slice(0, expanded ? undefined : 3).map((fact, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  gap: "12px",
                  padding: "10px 0",
                  borderBottom: "1px solid #e8e4dc",
                  fontSize: "14px",
                  lineHeight: 1.6,
                  color: "#1a1a18",
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "#e8f5ee",
                    color: "#2a9d5c",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 700,
                    marginTop: "1px",
                  }}
                >
                  ✓
                </span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Expand / collapse button */}
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            fontWeight: 500,
            color: "#6b6860",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "6px 0",
            marginBottom: expanded ? "20px" : "0",
          }}
        >
          {expanded ? (
            <ChevronUp style={{ width: "14px", height: "14px" }} />
          ) : (
            <ChevronDown style={{ width: "14px", height: "14px" }} />
          )}
          {expanded ? "Show less" : "See perspectives & sources"}
        </button>

        {expanded && (
          <div>
            {/* Perspectives */}
            {story.perspectives.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#9e9a90",
                    marginBottom: "12px",
                  }}
                >
                  Perspectives
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {story.perspectives.map((p, i) => (
                    <div
                      key={i}
                      style={{
                        borderLeft: `3px solid ${ACCENT_COLORS[i % ACCENT_COLORS.length]}`,
                        paddingLeft: "14px",
                        paddingTop: "8px",
                        paddingBottom: "8px",
                        background: "#faf8f4",
                        borderRadius: "0 8px 8px 0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "6px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#1a1a18",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                          }}
                        >
                          {p.label}
                        </span>
                        <a
                          href={p.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "12px",
                            color: "#9e9a90",
                            textDecoration: "none",
                          }}
                        >
                          {p.sourceName}
                          <ExternalLink style={{ width: "11px", height: "11px" }} />
                        </a>
                      </div>
                      <p
                        style={{
                          fontSize: "14px",
                          lineHeight: 1.65,
                          color: "#6b6860",
                          margin: 0,
                        }}
                      >
                        {p.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sources */}
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#9e9a90",
                  marginBottom: "10px",
                }}
              >
                Sources
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {story.sources.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "#1a1a18",
                      padding: "6px 14px",
                      borderRadius: "100px",
                      border: "1px solid #e8e4dc",
                      background: "#ffffff",
                      textDecoration: "none",
                      transition: "border-color 0.2s ease",
                    }}
                  >
                    {s.name}
                    <ExternalLink style={{ width: "10px", height: "10px", color: "#9e9a90" }} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
