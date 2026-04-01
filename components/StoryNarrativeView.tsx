"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, ChevronDown, ChevronUp, ChevronLeft, ThumbsDown } from "lucide-react";
import type { AggregatedStory, DigestPeriod } from "@/lib/types";
import { PERIOD_LABELS, PERIOD_SYMBOLS } from "@/lib/types";
import { format, parseISO } from "date-fns";

interface StoryNarrativeViewProps {
  story: AggregatedStory;
  storyIndex: number;
  totalStories: number;
  digestDate: string;
  digestPeriod: DigestPeriod;
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
  digestPeriod,
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

        {/* Expandable Key Facts */}
        {story.keyFacts.length > 0 && (
          <Reveal delay={320}>
            <ExpandableSection
              title={`${story.keyFacts.length} Key Fact${story.keyFacts.length !== 1 ? "s" : ""}`}
              defaultOpen={false}
              style={{ maxWidth: "560px", marginTop: "32px", textAlign: "left" }}
            >
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
            </ExpandableSection>
          </Reveal>
        )}

        {/* Expandable Perspectives */}
        {story.perspectives.length > 0 && (
          <Reveal delay={400}>
            <ExpandableSection
              title={`${story.perspectives.length} Perspective${story.perspectives.length !== 1 ? "s" : ""}`}
              defaultOpen={false}
              style={{ maxWidth: "560px", marginTop: "16px", textAlign: "left" }}
            >
              {story.perspectives.map((perspective, i) => (
                <div
                  key={i}
                  style={{
                    padding: "12px 0",
                    borderBottom: i < story.perspectives.length - 1 ? "1px solid #f0ece4" : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#1a1a18",
                      }}
                    >
                      {perspective.sourceName}
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        padding: "2px 8px",
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
                        gap: "3px",
                        fontSize: "11px",
                        color: "#9e9a90",
                        textDecoration: "none",
                        marginLeft: "auto",
                      }}
                    >
                      Source
                      <ExternalLink style={{ width: "10px", height: "10px" }} />
                    </a>
                  </div>
                  <p
                    style={{
                      fontSize: "14px",
                      lineHeight: 1.6,
                      color: "#6b6860",
                      margin: 0,
                    }}
                  >
                    {perspective.description}
                  </p>
                </div>
              ))}
            </ExpandableSection>
          </Reveal>
        )}
      </section>

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

interface ExpandableSectionProps {
  title: string;
  defaultOpen: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

function ExpandableSection({ title, defaultOpen, children, style }: ExpandableSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={style}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          width: "100%",
          background: open ? "#faf8f4" : "#ffffff",
          border: "1px solid #e8e4dc",
          borderRadius: open ? "10px 10px 0 0" : "10px",
          padding: "12px 16px",
          cursor: "pointer",
          transition: "all 0.2s ease",
          fontSize: "13px",
          fontWeight: 600,
          color: "#1a1a18",
          letterSpacing: "0.02em",
        }}
      >
        {open ? (
          <ChevronUp style={{ width: "14px", height: "14px", color: "#6b6860" }} />
        ) : (
          <ChevronDown style={{ width: "14px", height: "14px", color: "#6b6860" }} />
        )}
        {title}
      </button>
      {open && (
        <div
          style={{
            border: "1px solid #e8e4dc",
            borderTop: "none",
            borderRadius: "0 0 10px 10px",
            padding: "8px 16px 16px",
            background: "#ffffff",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
