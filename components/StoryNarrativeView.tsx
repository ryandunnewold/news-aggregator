"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import type { AggregatedStory, DigestPeriod } from "@/lib/types";
import { ALL_CATEGORIES, PERIOD_LABELS, PERIOD_SYMBOLS } from "@/lib/types";
import { format, parseISO } from "date-fns";

interface StoryNarrativeViewProps {
  story: AggregatedStory;
  storyIndex: number;
  totalStories: number;
  digestDate: string;
  digestPeriod: DigestPeriod;
  onMarkRead: () => void;
  onSkip: () => void;
}

const ACCENT_COLORS = [
  "#e66a1e",
  "#2a6496",
  "#2a9d5c",
  "#c8a930",
  "#1a2b5c",
  "#b01c2e",
  "#7b5ea7",
  "#4a7c59",
];

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

function Reveal({ children, delay = 0, className, style }: RevealProps) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function StoryNarrativeView({
  story,
  storyIndex,
  totalStories,
  digestDate,
  digestPeriod,
  onMarkRead,
  onSkip,
}: StoryNarrativeViewProps) {
  const categoryLabel =
    ALL_CATEGORIES.find((c) => c.value === story.category)?.label ??
    story.category;

  const accentForPerspective = (i: number) =>
    ACCENT_COLORS[i % ACCENT_COLORS.length];

  const formattedDate = format(parseISO(digestDate), "MMMM d, yyyy");

  return (
    <div
      style={{
        maxWidth: "780px",
        margin: "0 auto",
        padding: "0 24px 100px",
      }}
    >
      {/* ── Digest header with story counter ── */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "16px",
          padding: "0 0 20px",
          borderBottom: "1px solid #e8e4dc",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            color: "#9e9a90",
            marginBottom: "4px",
          }}
        >
          <span style={{ fontSize: "15px" }}>{PERIOD_SYMBOLS[digestPeriod]}</span>
          <span style={{ fontWeight: 500, color: "#6b6860" }}>
            {PERIOD_LABELS[digestPeriod]}
          </span>
          <span>&middot;</span>
          <span>{formattedDate}</span>
        </div>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#9e9a90",
            marginTop: "4px",
          }}
        >
          Story {storyIndex + 1} of {totalStories}
        </div>
      </div>

      {/* ── Intro with inline key facts ── */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "48px 0 56px",
        }}
      >
        <Reveal delay={0}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#9e9a90",
              marginBottom: "20px",
            }}
          >
            {categoryLabel}
          </div>
        </Reveal>

        <Reveal delay={80}>
          <h1
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "clamp(26px, 4vw, 38px)",
              fontWeight: 400,
              lineHeight: 1.25,
              color: "#1a1a18",
              marginBottom: "28px",
              letterSpacing: "-0.01em",
              maxWidth: "720px",
            }}
          >
            {story.headline}
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <div
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
              padding: "6px 16px",
              marginBottom: "32px",
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
            {story.sources.length} source{story.sources.length !== 1 ? "s" : ""} analyzed
          </div>
        </Reveal>

        <Reveal delay={240}>
          <p
            style={{
              fontSize: "17px",
              lineHeight: 1.7,
              color: "#6b6860",
              maxWidth: "600px",
            }}
          >
            {story.summary}
          </p>
        </Reveal>

        {/* Key facts inline after summary */}
        {story.keyFacts.length > 0 && (
          <Reveal delay={320}>
            <div
              style={{
                maxWidth: "560px",
                marginTop: "32px",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#9e9a90",
                  marginBottom: "12px",
                }}
              >
                Key Facts
              </div>
              {story.keyFacts.map((fact, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "10px",
                    padding: "8px 0",
                    borderBottom: i < story.keyFacts.length - 1 ? "1px solid #f0ece4" : "none",
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: "#e8f5ee",
                      color: "#2a9d5c",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      fontWeight: 700,
                      marginTop: "2px",
                    }}
                  >
                    ✓
                  </span>
                  <span style={{ fontSize: "14px", lineHeight: 1.5, color: "#1a1a18" }}>
                    {fact}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        )}
      </section>

      {/* ── Perspectives ── */}
      {story.perspectives.map((perspective, i) => (
        <PerspectiveSection
          key={i}
          perspective={perspective}
          accent={accentForPerspective(i)}
          fromRight={i % 2 !== 0}
        />
      ))}
      {/* Sources section removed -- source links are now inline in each perspective */}

      {/* ── Sticky footer ── */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(250, 248, 244, 0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderTop: "1px solid #e8e4dc",
          zIndex: 50,
          padding: "12px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "780px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
          }}
        >
          <button
            onClick={onSkip}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#6b6860",
              background: "transparent",
              border: "1px solid #d4d0c8",
              borderRadius: "100px",
              padding: "10px 24px",
              cursor: "pointer",
              transition: "border-color 0.2s ease, color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#9e9a90";
              e.currentTarget.style.color = "#1a1a18";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#d4d0c8";
              e.currentTarget.style.color = "#6b6860";
            }}
          >
            Skip
          </button>
          <button
            onClick={onMarkRead}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#faf8f4",
              background: "#1a1a18",
              border: "none",
              borderRadius: "100px",
              padding: "10px 24px",
              cursor: "pointer",
              transition: "opacity 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Mark as Read
          </button>
        </div>
      </div>
    </div>
  );
}

interface PerspectiveSectionProps {
  perspective: AggregatedStory["perspectives"][number];
  accent: string;
  fromRight: boolean;
}

function PerspectiveSection({ perspective, accent, fromRight }: PerspectiveSectionProps) {
  const { ref, visible } = useReveal(0.1);
  const [expanded, setExpanded] = useState(false);

  // Truncate description to ~120 chars for collapsed view
  const isLong = perspective.description.length > 120;
  const truncated = isLong
    ? perspective.description.slice(0, 120).replace(/\s+\S*$/, "") + "..."
    : perspective.description;

  return (
    <section
      ref={ref}
      style={{
        padding: "40px 0",
        position: "relative",
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateX(0)"
          : fromRight
          ? "translateX(30px)"
          : "translateX(-30px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
        borderTop: `2px solid ${accent}`,
      }}
    >
      <div
        style={{
          maxWidth: "640px",
          margin: "0 auto",
        }}
      >
        {/* Compact source header: name + label inline */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "16px",
          }}
        >
          <h2
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "18px",
              fontWeight: 400,
              color: "#1a1a18",
              margin: 0,
            }}
          >
            {perspective.sourceName}
          </h2>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "3px 10px",
              borderRadius: "100px",
              border: "1px solid #e8e4dc",
              color: "#6b6860",
              background: "#ffffff",
            }}
          >
            {perspective.label}
          </span>
          <a
            href={perspective.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px",
              fontWeight: 500,
              color: "#9e9a90",
              textDecoration: "none",
              marginLeft: "auto",
              transition: "color 0.2s ease",
            }}
          >
            Source
            <ExternalLink style={{ width: "11px", height: "11px" }} />
          </a>
        </div>

        {/* Truncated/expandable description */}
        <p
          style={{
            fontSize: "15px",
            lineHeight: 1.7,
            color: "#6b6860",
            margin: 0,
          }}
        >
          {expanded || !isLong ? perspective.description : truncated}
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                background: "none",
                border: "none",
                color: "#2a6496",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                padding: "0 0 0 6px",
                textDecoration: "none",
              }}
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </p>
      </div>
    </section>
  );
}
