export type DigestPeriod = "morning" | "evening";

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
  imageUrl?: string;
}

export interface NewsDigest {
  id: string;
  date: string; // YYYY-MM-DD
  period: DigestPeriod;
  generatedAt: string; // ISO timestamp
  stories: AggregatedStory[];
}

export interface StoryFeedback {
  headline: string;
  dismissedAt: string; // ISO timestamp
  digestId: string;
}

export const PERIOD_LABELS: Record<DigestPeriod, string> = {
  morning: "Morning Briefing",
  evening: "Afternoon Wrap-Up",
};

export const PERIOD_TIMES: Record<DigestPeriod, string> = {
  morning: "7:00 AM CT",
  evening: "2:00 PM CT",
};

export const PERIOD_SYMBOLS: Record<DigestPeriod, string> = {
  morning: "\u2600",
  evening: "\u25D1",
};
