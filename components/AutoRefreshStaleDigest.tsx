"use client";

import { useEffect, useRef, useState } from "react";

interface AutoRefreshStaleDigestProps {
  hasExistingDigest: boolean;
}

const STAGES = [
  "Scanning the wires",
  "Gathering today's stories",
  "Reading across sources",
  "Cross-checking the facts",
  "Weighing perspectives",
  "Drafting your briefing",
  "Polishing the prose",
];

/**
 * Full-screen loading experience shown while a fresh digest is being generated.
 * Cycles through evocative status messages and runs a layered animation of
 * orbiting type, pulsing rules, and a marching progress bar.
 */
export function AutoRefreshStaleDigest({ hasExistingDigest }: AutoRefreshStaleDigestProps) {
  const [status, setStatus] = useState<"running" | "error">("running");
  const [stageIdx, setStageIdx] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    (async () => {
      try {
        const res = await fetch("/api/aggregate", { method: "POST" });
        const data = await res.json().catch(() => ({ success: false }));
        if (data.success) {
          window.location.reload();
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    })();
  }, []);

  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(() => {
      setStageIdx((i) => (i + 1) % STAGES.length);
    }, 2400);
    return () => clearInterval(id);
  }, [status]);

  if (status === "error") {
    return (
      <div
        style={{
          background: "#fdf1ee",
          border: "1px solid #f0c9be",
          color: "#8a3a2b",
          borderRadius: "8px",
          padding: "10px 14px",
          fontSize: "13px",
          marginBottom: "24px",
        }}
      >
        Couldn&rsquo;t refresh your briefing. Try clicking &ldquo;Run Now&rdquo; above.
      </div>
    );
  }

  const headline = hasExistingDigest
    ? "Pulling fresh stories"
    : "Composing your briefing";
  const subhead = hasExistingDigest
    ? "Your last briefing is more than six hours old. Brewing a new one — should only take a minute."
    : "First briefing of the day. Reading across the wires — should only take a minute or two.";

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background:
          "radial-gradient(ellipse at top, #fbf9f4 0%, #f5f1e8 60%, #ede7d8 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
        overflow: "hidden",
      }}
    >
      {/* Background orbiting words */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "min(90vmin, 720px)",
            height: "min(90vmin, 720px)",
            animation: "briefing-orbit 40s linear infinite",
            opacity: 0.35,
          }}
        >
          {[
            "Reuters",
            "AP",
            "Bloomberg",
            "Politics",
            "World",
            "Markets",
            "Tech",
            "Science",
            "Op-Ed",
            "Local",
            "Sports",
            "Culture",
          ].map((label, i, arr) => {
            const angle = (i / arr.length) * 360;
            return (
              <span
                key={label}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: `rotate(${angle}deg) translate(0, -42%) rotate(-${angle}deg)`,
                  transformOrigin: "0 0",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "clamp(11px, 1.6vw, 14px)",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#9a8f73",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Concentric pulsing rings */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: "min(56vmin, 460px)",
          height: "min(56vmin, 460px)",
          borderRadius: "50%",
          border: "1px solid #d8d0bd",
          animation: "briefing-pulse 3.6s ease-out infinite",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: "min(56vmin, 460px)",
          height: "min(56vmin, 460px)",
          borderRadius: "50%",
          border: "1px solid #d8d0bd",
          animation: "briefing-pulse 3.6s ease-out 1.2s infinite",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: "min(56vmin, 460px)",
          height: "min(56vmin, 460px)",
          borderRadius: "50%",
          border: "1px solid #d8d0bd",
          animation: "briefing-pulse 3.6s ease-out 2.4s infinite",
        }}
      />

      {/* Center card */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "min(560px, 92vw)",
          background: "rgba(255, 253, 248, 0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid #e8e4dc",
          borderRadius: "18px",
          padding: "44px 36px 36px",
          textAlign: "center",
          boxShadow:
            "0 24px 60px -24px rgba(60, 50, 30, 0.18), 0 1px 0 rgba(255,255,255,0.7) inset",
        }}
      >
        {/* Animated masthead glyph */}
        <div
          aria-hidden="true"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            gap: "5px",
            height: "44px",
            marginBottom: "22px",
          }}
        >
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                width: "5px",
                borderRadius: "2px",
                background: "linear-gradient(180deg, #2a2a26 0%, #5b5346 100%)",
                animation: `briefing-bar 1.4s ease-in-out ${i * 0.12}s infinite`,
              }}
            />
          ))}
        </div>

        <p
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "11px",
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "#9a8f73",
            margin: "0 0 10px",
          }}
        >
          The Briefing
        </p>
        <h1
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "clamp(26px, 4vw, 34px)",
            fontWeight: 400,
            color: "#1a1a18",
            margin: "0 0 14px",
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
          }}
        >
          {headline}
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "#6b6860",
            margin: "0 auto 28px",
            maxWidth: "380px",
            lineHeight: 1.6,
          }}
        >
          {subhead}
        </p>

        {/* Stage carousel */}
        <div
          style={{
            position: "relative",
            height: "26px",
            marginBottom: "22px",
            overflow: "hidden",
          }}
        >
          {STAGES.map((stage, i) => (
            <div
              key={stage}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                fontSize: "13px",
                color: "#3a362e",
                opacity: i === stageIdx ? 1 : 0,
                transform:
                  i === stageIdx
                    ? "translateY(0)"
                    : i === (stageIdx - 1 + STAGES.length) % STAGES.length
                    ? "translateY(-12px)"
                    : "translateY(12px)",
                transition: "opacity 0.5s ease, transform 0.5s ease",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#1a1a18",
                  animation: "briefing-dot 1.2s ease-in-out infinite",
                }}
              />
              {stage}
              <span style={{ display: "inline-flex", gap: "2px" }} aria-hidden="true">
                <span style={{ animation: "briefing-blink 1.2s 0s infinite" }}>.</span>
                <span style={{ animation: "briefing-blink 1.2s 0.2s infinite" }}>.</span>
                <span style={{ animation: "briefing-blink 1.2s 0.4s infinite" }}>.</span>
              </span>
            </div>
          ))}
        </div>

        {/* Indeterminate marching progress bar */}
        <div
          style={{
            position: "relative",
            height: "3px",
            width: "100%",
            background: "#ede7d8",
            borderRadius: "999px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: "40%",
              background:
                "linear-gradient(90deg, transparent 0%, #1a1a18 50%, transparent 100%)",
              animation: "briefing-march 1.8s ease-in-out infinite",
              borderRadius: "999px",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes briefing-orbit {
          to { transform: rotate(360deg); }
        }
        @keyframes briefing-pulse {
          0% { transform: scale(0.6); opacity: 0.7; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes briefing-bar {
          0%, 100% { height: 12px; opacity: 0.55; }
          50% { height: 40px; opacity: 1; }
        }
        @keyframes briefing-march {
          0% { left: -45%; }
          100% { left: 105%; }
        }
        @keyframes briefing-dot {
          0%, 100% { transform: scale(0.6); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes briefing-blink {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          *[style*="animation"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
