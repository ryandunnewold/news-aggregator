interface EmptyFeedProps {
  variant?: "no-digests" | "all-read";
  totalRead?: number;
  onReset?: () => void;
}

export function EmptyFeed({ variant = "no-digests", totalRead = 0, onReset }: EmptyFeedProps) {
  if (variant === "all-read") {
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
        <div style={{ fontSize: "40px", marginBottom: "24px" }}>✓</div>
        <p
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "clamp(22px, 3vw, 28px)",
            color: "#1a1a18",
            marginBottom: "16px",
            fontWeight: 400,
            lineHeight: 1.3,
          }}
        >
          {"You're all caught up"}
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
          {totalRead > 0
            ? `You've read all ${totalRead} ${totalRead === 1 ? "story" : "stories"} in the latest briefing. A fresh briefing is generated whenever you return and the latest is more than 6 hours old.`
            : "You've read all the stories in the latest briefing."}
        </p>
        {onReset && (
          <button
            onClick={onReset}
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: "#9e9a90",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              textDecoration: "underline",
              textDecorationColor: "#e8e4dc",
            }}
          >
            Mark all as unread
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        border: "1px dashed #e8e4dc",
        borderRadius: "12px",
        padding: "64px 40px",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "20px",
          color: "#1a1a18",
          marginBottom: "12px",
          fontWeight: 400,
        }}
      >
        No briefing yet
      </p>
      <p style={{ fontSize: "14px", color: "#6b6860", maxWidth: "360px", margin: "0 auto" }}>
        A fresh briefing is generated on demand. Click &ldquo;Run Now&rdquo; to pull the latest
        top stories.
      </p>
    </div>
  );
}
