"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, ChevronLeft, ThumbsDown } from "lucide-react";
import type { AggregatedStory } from "@/lib/types";
import { format, parseISO } from "date-fns";

interface StoryNarrativeViewProps {
  story: AggregatedStory;
  storyIndex: number;
  totalStories: number;
  digestDate: string;
  onMarkRead: () => void;
  onSkip: () => void;
  onNotInteresting: () => void;
  onPrevious?: () => void;
  onMarkAllRead?: () => void;
}

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
  onMarkRead,
  onSkip,
  onNotInteresting,
  onPrevious,
  onMarkAllRead,
}: StoryNarrativeViewProps) {
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
          <span style={{ fontWeight: 500, color: "#6b6860" }}>
            Latest Briefing
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

      {/* ── Article content ── */}
      <article
        style={{
          padding: "48px 0 0",
        }}
      >
        {/* Headline */}
        <Reveal delay={80}>
          <h1
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "clamp(26px, 4vw, 38px)",
              fontWeight: 400,
              lineHeight: 1.25,
              color: "#1a1a18",
              marginBottom: "16px",
              letterSpacing: "-0.01em",
            }}
          >
            {story.headline}
          </h1>
        </Reveal>

        {/* Byline / source count */}
        <Reveal delay={140}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "32px",
              paddingBottom: "24px",
              borderBottom: "1px solid #e8e4dc",
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
            <span
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "#6b6860",
              }}
            >
              {story.sources.length} source{story.sources.length !== 1 ? "s" : ""} analyzed
            </span>
          </div>
        </Reveal>

        {/* Summary / lede */}
        <Reveal delay={200}>
          <p
            style={{
              fontSize: "17px",
              lineHeight: 1.75,
              color: "#3d3d3a",
              marginBottom: "36px",
            }}
          >
            {story.summary}
          </p>
        </Reveal>

        {/* Key Facts — always visible, integrated */}
        {story.keyFacts.length > 0 && (
          <Reveal delay={280}>
            <div
              style={{
                borderLeft: "3px solid #2a9d5c",
                paddingLeft: "20px",
                marginBottom: "40px",
              }}
            >
              <h2
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#6b6860",
                  marginBottom: "12px",
                }}
              >
                Key Facts
              </h2>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {story.keyFacts.map((fact, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: "15px",
                      lineHeight: 1.6,
                      color: "#1a1a18",
                      padding: "6px 0",
                      borderBottom: i < story.keyFacts.length - 1 ? "1px solid #f0ece4" : "none",
                    }}
                  >
                    {fact}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        )}

        {/* Perspectives — always visible, newspaper style */}
        {story.perspectives.length > 0 && (
          <Reveal delay={360}>
            <div
              style={{
                borderTop: "2px solid #1a1a18",
                paddingTop: "20px",
                marginBottom: "40px",
              }}
            >
              <h2
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "20px",
                  fontWeight: 400,
                  color: "#1a1a18",
                  marginBottom: "20px",
                }}
              >
                How Different Sources Covered It
              </h2>
              {story.perspectives.map((perspective, i) => (
                <div
                  key={i}
                  style={{
                    padding: "16px 0",
                    borderBottom: i < story.perspectives.length - 1 ? "1px solid #e8e4dc" : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "10px",
                      marginBottom: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        fontSize: "16px",
                        fontWeight: 700,
                        color: "#1a1a18",
                      }}
                    >
                      {perspective.sourceName}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        padding: "2px 8px",
                        borderRadius: "100px",
                        border: "1px solid #e8e4dc",
                        color: "#6b6860",
                        background: "#faf8f4",
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
                        gap: "3px",
                        fontSize: "12px",
                        color: "#9e9a90",
                        textDecoration: "none",
                        marginLeft: "auto",
                      }}
                    >
                      Read source
                      <ExternalLink style={{ width: "11px", height: "11px" }} />
                    </a>
                  </div>
                  <p
                    style={{
                      fontSize: "15px",
                      lineHeight: 1.65,
                      color: "#3d3d3a",
                      margin: 0,
                    }}
                  >
                    {perspective.description}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        )}
      </article>

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
          {onPrevious && (
            <button
              onClick={onPrevious}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "13px",
                fontWeight: 500,
                color: "#9e9a90",
                background: "transparent",
                border: "1px solid #e8e4dc",
                borderRadius: "100px",
                padding: "10px 16px",
                cursor: "pointer",
                transition: "border-color 0.2s ease, color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#9e9a90";
                e.currentTarget.style.color = "#1a1a18";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e8e4dc";
                e.currentTarget.style.color = "#9e9a90";
              }}
            >
              <ChevronLeft style={{ width: "14px", height: "14px" }} />
              Previous
            </button>
          )}
          <button
            onClick={onNotInteresting}
            title="Not interesting — future digests will avoid similar topics"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              fontWeight: 500,
              color: "#9e9a90",
              background: "transparent",
              border: "1px solid #e8e4dc",
              borderRadius: "100px",
              padding: "10px 16px",
              cursor: "pointer",
              transition: "border-color 0.2s ease, color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#c8453a";
              e.currentTarget.style.color = "#c8453a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e8e4dc";
              e.currentTarget.style.color = "#9e9a90";
            }}
          >
            <ThumbsDown style={{ width: "13px", height: "13px" }} />
            Not interesting
          </button>
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
            Next Story
          </button>
          {onMarkAllRead && (
            <button
              onClick={onMarkAllRead}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                fontWeight: 500,
                color: "#9e9a90",
                background: "transparent",
                border: "none",
                padding: "10px 16px",
                cursor: "pointer",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#1a1a18")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#9e9a90")}
            >
              Finish Briefing
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
