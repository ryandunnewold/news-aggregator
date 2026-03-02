import { PERIOD_LABELS, PERIOD_TIMES } from "@/lib/types";

export function EmptyFeed() {
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
