import { PERIOD_LABELS, PERIOD_SYMBOLS } from "@/lib/types";
import type { NewsDigest } from "@/lib/types";
import { format, parseISO } from "date-fns";

interface BriefingCompleteProps {
  digest: NewsDigest;
  storiesRead: number;
  remainingBriefings: number;
  onNextBriefing?: () => void;
  onMarkAllRead: () => void;
}

export function BriefingComplete({
  digest,
  storiesRead,
  remainingBriefings,
  onNextBriefing,
  onMarkAllRead,
}: BriefingCompleteProps) {
  const formattedDate = format(parseISO(digest.date), "MMMM d, yyyy");

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "80px 40px",
      }}
    >
      <div style={{ fontSize: "40px", marginBottom: "24px" }}>
        {PERIOD_SYMBOLS[digest.period]}
      </div>

      <p
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "clamp(22px, 3vw, 28px)",
          color: "#1a1a18",
          marginBottom: "8px",
          fontWeight: 400,
          lineHeight: 1.3,
        }}
      >
        Briefing Complete
      </p>

      <p
        style={{
          fontSize: "13px",
          color: "#9e9a90",
          marginBottom: "24px",
        }}
      >
        {PERIOD_LABELS[digest.period]} &middot; {formattedDate}
      </p>

      <p
        style={{
          fontSize: "15px",
          color: "#6b6860",
          marginBottom: "40px",
          maxWidth: "380px",
          lineHeight: 1.6,
        }}
      >
        You&apos;ve read all {storiesRead}{" "}
        {storiesRead === 1 ? "story" : "stories"} in this briefing.
        {remainingBriefings > 0 && (
          <>
            {" "}
            {remainingBriefings} older{" "}
            {remainingBriefings === 1 ? "briefing has" : "briefings have"}{" "}
            unread stories.
          </>
        )}
      </p>

      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {onNextBriefing && (
          <button
            onClick={onNextBriefing}
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
            Next Briefing
          </button>
        )}
        <button
          onClick={onMarkAllRead}
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
            padding: "12px 28px",
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
          Mark All as Read
        </button>
      </div>
    </div>
  );
}
