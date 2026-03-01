import { getRecentDigests } from "@/lib/storage";
import { NewsFeed } from "@/components/NewsFeed";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const digests = await getRecentDigests(7);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{"Today's News"}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          AI-aggregated news from diverse sources — factual, balanced, unbiased.
          Updated at 8 AM, 2 PM, and 8 PM.
        </p>
      </div>
      <NewsFeed digests={digests} />
    </div>
  );
}
