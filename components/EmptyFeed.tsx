import { PERIOD_LABELS, PERIOD_TIMES } from "@/lib/types";

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
        <div
          style={{
            fontSize: "40px",
            marginBottom: "24px",
          }}
        >
          ✓
        </div>
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
            ? `You've read all ${totalRead} ${totalRead === 1 ? "story" : "stories"} from the latest digests. Check back later for new coverage.`
            : "You've read all the stories from the latest digests. Check back later for new coverage."}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "8px",
            }}
          >
            {(["morning", "midday", "evening"] as const).map((period) => (
              <div
                key={period}
                style={{
                  padding: "10px 18px",
                  borderRadius: "100px",
                  border: "1px solid #e8e4dc",
                  background: "#ffffff",
                }}
              >
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#1a1a18", display: "block" }}>
                  {PERIOD_LABELS[period]}
                </span>
                <span style={{ fontSize: "11px", color: "#9e9a90" }}>
                  {PERIOD_TIMES[period]}
                </span>
              </div>
            ))}
          </div>
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
        No digests yet
      </p>
      <p style={{ fontSize: "14px", color: "#6b6860", marginBottom: "32px", maxWidth: "360px", margin: "0 auto 32px" }}>
        News digests are automatically generated three times a day. The first
        digest will appear here once generated.
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {(["morning", "midday", "evening"] as const).map((period) => (
          <div
            key={period}
            style={{
              padding: "10px 18px",
              borderRadius: "100px",
              border: "1px solid #e8e4dc",
              background: "#ffffff",
            }}
          >
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#1a1a18", display: "block" }}>
              {PERIOD_LABELS[period]}
            </span>
            <span style={{ fontSize: "11px", color: "#9e9a90" }}>
              {PERIOD_TIMES[period]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
