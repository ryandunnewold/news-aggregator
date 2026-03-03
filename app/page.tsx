import { getRecentDigests } from "@/lib/storage";
import { StoryReader } from "@/components/StoryReader";
import { RunAggregationButton } from "@/components/RunAggregationButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const digests = await getRecentDigests(7);

  return (
    <div>
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
          <h1
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "clamp(24px, 4vw, 30px)",
              fontWeight: 400,
              color: "#1a1a18",
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
              marginBottom: "8px",
            }}
          >
            {"Today's Digest"}
          </h1>
          <p style={{ fontSize: "13px", color: "#9e9a90", margin: 0 }}>
            AI-aggregated news from diverse sources — factual, balanced, unbiased.
            Updated at 8 AM, 2 PM, and 8 PM CT.
          </p>
        </div>
        <RunAggregationButton />
      </div>

      <StoryReader digests={digests} />
    </div>
  );
}
