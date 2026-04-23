import { getLatestDigest } from "@/lib/storage";
import { StoryReader } from "@/components/StoryReader";
import { RunAggregationButton } from "@/components/RunAggregationButton";
import { AutoRefreshStaleDigest } from "@/components/AutoRefreshStaleDigest";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const STALE_AFTER_MS = 6 * 60 * 60 * 1000;

export default async function HomePage() {
  const digest = await getLatestDigest();
  const now = new Date();
  const isStale =
    !digest ||
    now.getTime() - new Date(digest.generatedAt).getTime() >= STALE_AFTER_MS;

  return (
    <div>
      {isStale && <AutoRefreshStaleDigest hasExistingDigest={!!digest} />}

      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "16px",
          marginBottom: "40px",
          paddingBottom: "32px",
          borderBottom: "1px solid #e8e4dc",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "6px" }}>
            <h1
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: "clamp(24px, 4vw, 30px)",
                fontWeight: 400,
                color: "#1a1a18",
                letterSpacing: "-0.01em",
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              Your Briefing
            </h1>
          </div>
          <p style={{ fontSize: "13px", color: "#9e9a90", margin: 0 }}>
            {digest
              ? `${digest.stories.length} ${digest.stories.length === 1 ? "story" : "stories"} in the latest briefing`
              : "AI-aggregated news from diverse sources — factual, balanced, unbiased."}
          </p>
        </div>
        <RunAggregationButton />
      </div>

      <StoryReader digest={digest} />
    </div>
  );
}
