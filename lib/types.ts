export type NewsCategory =
  | "general"
  | "technology"
  | "business"
  | "politics"
  | "science"
  | "health"
  | "sports"
  | "entertainment"
  | "world"
  | "environment";

export type DigestPeriod = "morning" | "midday" | "evening";

export interface NewsSource {
  name: string;
  url: string;
  bias?: "left" | "center-left" | "center" | "center-right" | "right";
}

export interface RawArticle {
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: {
    id: string | null;
    name: string;
  };
}

export interface AggregatedStory {
  headline: string;
  summary: string;
  keyFacts: string[];
  perspectives: {
    label: string;
    description: string;
    sourceUrl: string;
    sourceName: string;
  }[];
  sources: {
    name: string;
    url: string;
  }[];
  category: NewsCategory;
  imageUrl?: string;
}

export interface NewsDigest {
  id: string;
  date: string; // YYYY-MM-DD
  period: DigestPeriod;
  generatedAt: string; // ISO timestamp
  categories: NewsCategory[];
  stories: AggregatedStory[];
}

export interface UserSettings {
  categories: NewsCategory[];
}

export const ALL_CATEGORIES: { value: NewsCategory; label: string }[] = [
  { value: "general", label: "General" },
  { value: "technology", label: "Technology" },
  { value: "business", label: "Business" },
  { value: "politics", label: "Politics" },
  { value: "science", label: "Science" },
  { value: "health", label: "Health" },
  { value: "sports", label: "Sports" },
  { value: "entertainment", label: "Entertainment" },
  { value: "world", label: "World" },
  { value: "environment", label: "Environment" },
];

export const DEFAULT_CATEGORIES: NewsCategory[] = [
  "general",
  "technology",
  "politics",
  "world",
];

export const PERIOD_LABELS: Record<DigestPeriod, string> = {
  morning: "Morning Briefing",
  midday: "Midday Update",
  evening: "Evening Wrap-Up",
};

export const PERIOD_TIMES: Record<DigestPeriod, string> = {
  morning: "8:00 AM",
  midday: "2:00 PM",
  evening: "8:00 PM",
};
