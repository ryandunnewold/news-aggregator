"use client";

import { useState } from "react";
import { ExternalLink, ChevronDown, ChevronUp, Check, SkipForward } from "lucide-react";
import type { AggregatedStory } from "@/lib/types";

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

function ExpandableCardSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginBottom: "8px" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          width: "100%",
          background: open ? "#faf8f4" : "#ffffff",
          border: "1px solid #e8e4dc",
          borderRadius: open ? "8px 8px 0 0" : "8px",
          padding: "10px 14px",
          cursor: "pointer",
          transition: "all 0.2s ease",
          fontSize: "12px",
          fontWeight: 600,
          color: "#1a1a18",
          letterSpacing: "0.02em",
        }}
      >
        {open ? (
          <ChevronUp style={{ width: "13px", height: "13px", color: "#6b6860" }} />
        ) : (
          <ChevronDown style={{ width: "13px", height: "13px", color: "#6b6860" }} />
        )}
        {title}
      </button>
      {open && (
        <div
          style={{
            border: "1px solid #e8e4dc",
            borderTop: "none",
            borderRadius: "0 0 8px 8px",
            padding: "8px 14px 14px",
            background: "#ffffff",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function StoryCard({ story, index }: StoryCardProps) {
  const [read, setRead] = useState(false);
  const [skipped, setSkipped] = useState(false);

  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];

  if (skipped) {
    return (
      <article
        style={{
          background: "#ffffff",
          border: "1px solid #e8e4dc",
          borderRadius: "12px",
          overflow: "hidden",
          opacity: 0.5,
        }}
      >
        <div style={{ height: "2px", background: accent }} />
        <div
          style={{
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "13px", color: "#9e9a90", fontStyle: "italic" }}>
            {story.headline}
          </span>
          <button
            onClick={() => setSkipped(false)}
            style={{
              fontSize: "12px",
              color: "#9e9a90",
              background: "none",
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              marginLeft: "16px",
            }}
          >
            Show
          </button>
        </div>
      </article>
    );
  }

  return (
    <article
      style={{
        background: "#ffffff",
        border: "1px solid #e8e4dc",
        borderRadius: "12px",
        overflow: "hidden",
        opacity: read ? 0.65 : 1,
        transition: "opacity 0.2s ease",
      }}
    >
      {/* Accent bar */}
      <div style={{ height: "3px", background: accent }} />

      <div className="p-6">
        {/* Category + source count + action buttons */}
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
            Story {index + 1}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
        </div>

        {/* Headline */}
        <h2
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "clamp(18px, 2.5vw, 22px)",
            fontWeight: 400,
            lineHeight: 1.3,
            color: "#1a1a18",
            marginBottom: "16px",
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
            margin: 0,
            marginBottom: "16px",
          }}
        >
          {story.summary}
        </p>

        {/* Expandable Key Facts */}
        {story.keyFacts.length > 0 && (
          <ExpandableCardSection
            title={`${story.keyFacts.length} Key Fact${story.keyFacts.length !== 1 ? "s" : ""}`}
          >
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {story.keyFacts.map((fact, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    gap: "8px",
                    paddingBottom: "8px",
                    marginBottom: "8px",
                    borderBottom: i < story.keyFacts.length - 1 ? "1px solid #f0ece4" : "none",
                    fontSize: "13px",
                    lineHeight: 1.55,
                    color: "#1a1a18",
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      background: "#e8f5ee",
                      color: "#2a9d5c",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "9px",
                      fontWeight: 700,
                      marginTop: "2px",
                    }}
                  >
                    ✓
                  </span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </ExpandableCardSection>
        )}

        {/* Expandable Perspectives & Sources */}
        {(story.perspectives.length > 0 || story.sources.length > 0) && (
          <ExpandableCardSection
            title={`${story.perspectives.length} Perspective${story.perspectives.length !== 1 ? "s" : ""} & Sources`}
          >
            {/* Perspectives */}
            {story.perspectives.length > 0 && (
              <div style={{ marginBottom: story.sources.length > 0 ? "14px" : "0" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {story.perspectives.map((p, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: "10px",
                        fontSize: "13px",
                        lineHeight: 1.5,
                        color: "#6b6860",
                      }}
                    >
                      <span
                        style={{
                          flexShrink: 0,
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#1a1a18",
                          minWidth: "80px",
                        }}
                      >
                        {p.label}
                      </span>
                      <span style={{ flex: 1 }}>{p.description}</span>
                      <a
                        href={p.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flexShrink: 0,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px",
                          fontSize: "11px",
                          color: "#9e9a90",
                          textDecoration: "none",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p.sourceName}
                        <ExternalLink style={{ width: "9px", height: "9px" }} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sources */}
            {story.sources.length > 0 && (
              <div
                style={{
                  paddingTop: story.perspectives.length > 0 ? "10px" : "0",
                  borderTop: story.perspectives.length > 0 ? "1px solid #f0ece4" : "none",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#9e9a90",
                    marginBottom: "8px",
                  }}
                >
                  Sources
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
                  {story.sources.map((s, i) => (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "3px",
                        fontSize: "12px",
                        color: "#6b6860",
                        textDecoration: "none",
                      }}
                    >
                      {s.name}
                      <ExternalLink style={{ width: "9px", height: "9px", color: "#9e9a90" }} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </ExpandableCardSection>
        )}

        {/* Always-visible footer: mark as read + skip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginTop: "20px",
            paddingTop: "14px",
            borderTop: "1px solid #f0ece4",
          }}
        >
          <button
            onClick={() => setRead(!read)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "12px",
              fontWeight: 500,
              color: read ? "#2a9d5c" : "#9e9a90",
              background: read ? "#e8f5ee" : "transparent",
              border: "1px solid",
              borderColor: read ? "#c0e8d0" : "#e8e4dc",
              borderRadius: "100px",
              padding: "5px 12px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <Check style={{ width: "11px", height: "11px" }} />
            {read ? "Read" : "Mark as read"}
          </button>
          <button
            onClick={() => setSkipped(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "12px",
              fontWeight: 500,
              color: "#9e9a90",
              background: "transparent",
              border: "1px solid #e8e4dc",
              borderRadius: "100px",
              padding: "5px 12px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <SkipForward style={{ width: "11px", height: "11px" }} />
            Skip
          </button>
        </div>
      </div>
    </article>
  );
}
