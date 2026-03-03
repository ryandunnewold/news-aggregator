import { getRecentDigests } from "@/lib/storage";
import { NewsFeed } from "@/components/NewsFeed";
import { RunAggregationButton } from "@/components/RunAggregationButton";
import { PERIOD_LABELS, PERIOD_TIMES, PERIOD_SYMBOLS } from "@/lib/types";
import { format, parseISO } from "date-fns";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const digests = await getRecentDigests(7);

  // Find the most recent digest for the header
  const latestDigest = digests.length > 0 ? digests[0] : null;

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
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "6px" }}>
            {latestDigest && (
              <span style={{ fontSize: "16px", color: "#9e9a90" }}>
                {PERIOD_SYMBOLS[latestDigest.period]}
              </span>
            )}
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
              {latestDigest ? PERIOD_LABELS[latestDigest.period] : "Today's Digest"}
            </h1>
          </div>
          {latestDigest && (
            <p style={{ fontSize: "13px", color: "#9e9a90", margin: 0, paddingLeft: "26px" }}>
              {format(parseISO(latestDigest.date), "EEEE, MMMM d, yyyy")}
              {" "}&middot;{" "}
              {PERIOD_TIMES[latestDigest.period]}
              {" "}&middot;{" "}
              {latestDigest.stories.length} stor{latestDigest.stories.length !== 1 ? "ies" : "y"}
            </p>
          )}
          {!latestDigest && (
            <p style={{ fontSize: "13px", color: "#9e9a90", margin: 0 }}>
              AI-aggregated news from diverse sources — factual, balanced, unbiased.
            </p>
          )}
        </div>
        <RunAggregationButton />
      </div>

      <NewsFeed digests={digests} />
    </div>
  );
}
