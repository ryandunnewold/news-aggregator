export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <div style={{ maxWidth: "600px" }}>
      {/* Page header */}
      <div
        style={{
          paddingBottom: "32px",
          marginBottom: "32px",
          borderBottom: "1px solid #e8e4dc",
        }}
      >
        <h1
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "clamp(22px, 3vw, 28px)",
            fontWeight: 400,
            color: "#1a1a18",
            marginBottom: "8px",
            letterSpacing: "-0.01em",
          }}
        >
          Settings
        </h1>
        <p style={{ fontSize: "13px", color: "#9e9a90", margin: 0 }}>
          How NewsLens works for you.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Story curation info */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e8e4dc",
            borderRadius: "12px",
            padding: "24px",
          }}
        >
          <h2
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "18px",
              fontWeight: 400,
              color: "#1a1a18",
              marginBottom: "12px",
            }}
          >
            Story Curation
          </h2>
          <p style={{ fontSize: "14px", color: "#6b6860", margin: 0, lineHeight: 1.65 }}>
            NewsLens uses AI to find the 10 most important stories happening right now, across all topics. Use the <strong style={{ color: "#1a1a18" }}>&ldquo;Not interesting&rdquo;</strong> button on any story to teach it what you care about. Over time, it will learn to avoid topics you don&rsquo;t find relevant.
          </p>
        </div>

        {/* Schedule info */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e8e4dc",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "24px 24px 20px", borderBottom: "1px solid #e8e4dc" }}>
            <h2
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: "18px",
                fontWeight: 400,
                color: "#1a1a18",
                marginBottom: "6px",
              }}
            >
              Digest Schedule
            </h2>
            <p style={{ fontSize: "13px", color: "#6b6860", margin: 0 }}>
              News digests are automatically generated twice a day.
            </p>
          </div>
          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { symbol: "\u2600", label: "Morning Briefing", time: "8:00 AM CT", desc: "Start your day with the top overnight and early morning stories." },
              { symbol: "\u25D1", label: "Evening Wrap-Up", time: "4:00 PM CT", desc: "Review the day\u2019s most significant stories." },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  gap: "14px",
                  padding: "14px",
                  borderRadius: "8px",
                  background: "#faf8f4",
                  alignItems: "flex-start",
                }}
              >
                <span style={{ fontSize: "16px", color: "#9e9a90", marginTop: "1px" }}>{item.symbol}</span>
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "3px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a18" }}>{item.label}</span>
                    <span style={{ fontSize: "12px", color: "#9e9a90" }}>{item.time}</span>
                  </div>
                  <p style={{ fontSize: "13px", color: "#6b6860", margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e8e4dc",
            borderRadius: "12px",
            padding: "24px",
          }}
        >
          <h2
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "16px",
              fontWeight: 400,
              color: "#1a1a18",
              marginBottom: "16px",
            }}
          >
            How It Works
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { n: "1", title: "Search", body: "AI searches the web for the most significant news stories happening right now across all topics." },
              { n: "2", title: "Aggregate", body: "Claude AI groups articles into story clusters and identifies the key facts, filtering out editorial opinion." },
              { n: "3", title: "Balance", body: "For each story, Claude surfaces perspectives from different viewpoints so you see the full picture." },
              { n: "4", title: "Learn", body: "Mark stories as \u201Cnot interesting\u201D and future digests will avoid similar topics." },
            ].map((step) => (
              <div key={step.n} style={{ display: "flex", gap: "14px" }}>
                <span
                  style={{
                    flexShrink: 0,
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: "#f0ede8",
                    color: "#6b6860",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 600,
                    marginTop: "1px",
                  }}
                >
                  {step.n}
                </span>
                <p style={{ fontSize: "14px", color: "#6b6860", margin: 0, lineHeight: 1.65 }}>
                  <strong style={{ color: "#1a1a18", fontWeight: 600 }}>{step.title}</strong> &mdash; {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
