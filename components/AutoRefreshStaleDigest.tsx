"use client";

import { useEffect, useRef, useState } from "react";

interface AutoRefreshStaleDigestProps {
  hasExistingDigest: boolean;
}

/**
 * When mounted, kicks off a background regeneration of the latest digest.
 * Shows a small banner while the request is in flight, then reloads the page
 * so the server component picks up the fresh digest.
 *
 * Rendered by the home page only when the latest digest is missing or older
 * than 6 hours.
 */
export function AutoRefreshStaleDigest({ hasExistingDigest }: AutoRefreshStaleDigestProps) {
  const [status, setStatus] = useState<"running" | "error">("running");
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
        Couldn&rsquo;t refresh the latest briefing. Try clicking &ldquo;Run Now&rdquo; above.
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#faf8f4",
        border: "1px solid #e8e4dc",
        color: "#6b6860",
        borderRadius: "8px",
        padding: "10px 14px",
        fontSize: "13px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <span
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          border: "2px solid #d4d0c8",
          borderTopColor: "#1a1a18",
          animation: "spin 0.9s linear infinite",
          display: "inline-block",
        }}
      />
      {hasExistingDigest
        ? "The latest briefing is more than 6 hours old — pulling fresh stories now…"
        : "Generating your first briefing — this can take a minute or two…"}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
