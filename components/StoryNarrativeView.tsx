"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import type { AggregatedStory } from "@/lib/types";
import { ALL_CATEGORIES } from "@/lib/types";

interface StoryNarrativeViewProps {
  story: AggregatedStory;
  storyIndex: number;
  totalStories: number;
  onMarkRead: () => void;
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
  onMarkRead,
}: StoryNarrativeViewProps) {
  const categoryLabel =
    ALL_CATEGORIES.find((c) => c.value === story.category)?.label ??
    story.category;

  const accentForPerspective = (i: number) =>
    ACCENT_COLORS[i % ACCENT_COLORS.length];

  return (
    <div
      style={{
        maxWidth: "780px",
        margin: "0 auto",
        padding: "0 24px",
      }}
    >
      {/* Story counter */}
      <div
        style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#9e9a90",
          textAlign: "center",
          marginBottom: "8px",
        }}
      >
        Story {storyIndex + 1} of {totalStories}
      </div>

      {/* ── Intro ── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "80px 0 80px",
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

        <div
          style={{
            marginTop: "48px",
            fontSize: "13px",
            color: "#9e9a90",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            animation: "hintPulse 2.5s ease-in-out infinite",
          }}
        >
          Scroll to explore perspectives
          <span style={{ fontSize: "18px" }}>↓</span>
        </div>
      </section>

      {/* ── Key Facts ── */}
      {story.keyFacts.length > 0 && (
        <section
          style={{
            maxWidth: "640px",
            margin: "0 auto",
            padding: "80px 0 100px",
          }}
        >
          <Reveal>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#9e9a90",
                marginBottom: "40px",
              }}
            >
              Verified Key Facts
            </div>
          </Reveal>

          {story.keyFacts.map((fact, i) => (
            <FactItem key={i} fact={fact} delay={i * 80} />
          ))}
        </section>
      )}

      {/* ── Perspectives ── */}
      {story.perspectives.map((perspective, i) => (
        <PerspectiveSection
          key={i}
          perspective={perspective}
          accent={accentForPerspective(i)}
          fromRight={i % 2 !== 0}
        />
      ))}

      {/* ── Sources ── */}
      {story.sources.length > 0 && (
        <section
          style={{
            maxWidth: "640px",
            margin: "0 auto",
            padding: "60px 0 40px",
          }}
        >
          <Reveal>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#9e9a90",
                marginBottom: "16px",
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
          </Reveal>
        </section>
      )}

      {/* ── Mark as Read CTA ── */}
      <section
        style={{
          maxWidth: "640px",
          margin: "0 auto",
          padding: "60px 0 100px",
          textAlign: "center",
          borderTop: "1px solid #e8e4dc",
        }}
      >
        <Reveal>
          <p
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "18px",
              color: "#6b6860",
              marginBottom: "32px",
            }}
          >
            {"You've reached the end of this story."}
          </p>
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
              padding: "12px 28px",
              cursor: "pointer",
              transition: "opacity 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Mark as Read →
          </button>
        </Reveal>
      </section>

      <style>{`
        @keyframes hintPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function FactItem({ fact, delay }: { fact: string; delay: number }) {
  const { ref, visible } = useReveal(0.2);
  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        gap: "16px",
        padding: "18px 0",
        borderBottom: "1px solid #e8e4dc",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      <span
        style={{
          flexShrink: 0,
          width: "22px",
          height: "22px",
          borderRadius: "50%",
          background: "#e8f5ee",
          color: "#2a9d5c",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          fontWeight: 700,
          marginTop: "1px",
        }}
      >
        ✓
      </span>
      <span style={{ fontSize: "15px", lineHeight: 1.6, color: "#1a1a18" }}>{fact}</span>
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

  return (
    <section
      ref={ref}
      style={{
        padding: "80px 0",
        position: "relative",
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateX(0)"
          : fromRight
          ? "translateX(30px)"
          : "translateX(-30px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
      }}
    >
      {/* Accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "-24px",
          right: "-24px",
          height: "3px",
          background: accent,
        }}
      />

      <div
        style={{
          maxWidth: "640px",
          margin: "0 auto",
          padding: "32px 0 0",
        }}
      >
        {/* Source header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "13px",
                color: "#ffffff",
                flexShrink: 0,
              }}
            >
              {perspective.sourceName
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 3)
                .toUpperCase()}
            </div>
            <h2
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: "24px",
                fontWeight: 400,
                color: "#1a1a18",
                margin: 0,
              }}
            >
              {perspective.sourceName}
            </h2>
          </div>
          <span
            style={{
              display: "inline-block",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "4px 12px",
              borderRadius: "100px",
              border: "1px solid #e8e4dc",
              color: "#6b6860",
              background: "#ffffff",
            }}
          >
            {perspective.label}
          </span>
        </div>

        {/* Body */}
        <p
          style={{
            fontSize: "16px",
            lineHeight: 1.8,
            color: "#6b6860",
            marginBottom: "32px",
          }}
        >
          {perspective.description}
        </p>

        {/* Read original */}
        <a
          href={perspective.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "14px",
            fontWeight: 500,
            color: "#1a1a18",
            textDecoration: "none",
            padding: "10px 0",
            borderBottom: "1px solid #e8e4dc",
            transition: "border-color 0.2s ease",
          }}
        >
          Read original article{" "}
          <ExternalLink style={{ width: "13px", height: "13px" }} />
        </a>
      </div>
    </section>
  );
}
