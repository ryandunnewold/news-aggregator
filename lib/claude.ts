import Anthropic from "@anthropic-ai/sdk";
import type { RawArticle, AggregatedStory, NewsCategory } from "./types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Groups raw articles into story clusters by topic and aggregates each
 * into a balanced, factual report with diverse perspectives.
 */
export async function aggregateNewsStories(
  articles: RawArticle[],
  category: NewsCategory
): Promise<AggregatedStory[]> {
  if (articles.length === 0) return [];

  // Format articles for the prompt
  const articlesText = articles
    .slice(0, 30) // Cap to avoid token limits
    .map(
      (a, i) =>
        `[${i + 1}] SOURCE: ${a.source.name}
URL: ${a.url}
TITLE: ${a.title}
DESCRIPTION: ${a.description ?? "N/A"}
PUBLISHED: ${a.publishedAt}
---`
    )
    .join("\n");

  const prompt = `You are a neutral, factual news aggregator. Your job is to analyze news articles from diverse sources and create balanced, unbiased summaries.

Below are news articles from various sources about ${category} topics. These sources represent different political and editorial perspectives.

ARTICLES:
${articlesText}

Your task:
1. Identify the 3-5 most significant, distinct news stories from these articles
2. For each story, create a balanced, factual aggregated report

Return a JSON array of story objects. Each story must follow this exact schema:
{
  "headline": "Neutral, factual headline (no editorial slant)",
  "summary": "2-3 sentence factual summary covering the core facts without editorializing",
  "keyFacts": ["Fact 1", "Fact 2", "Fact 3", "Fact 4"],
  "perspectives": [
    {
      "label": "Label for this perspective (e.g., 'Conservative view', 'Progressive view', 'Industry perspective', 'Expert opinion')",
      "description": "1-2 sentences describing this angle/perspective on the story",
      "sourceUrl": "URL from the article that best represents this perspective",
      "sourceName": "Name of the source"
    }
  ],
  "sources": [
    { "name": "Source name", "url": "Article URL" }
  ],
  "category": "${category}",
  "imageUrl": "Use the best image URL from the articles if available, or omit"
}

IMPORTANT GUIDELINES:
- Be strictly factual. No opinion, no editorializing, no loaded language.
- Include at least 2-3 different perspectives per major story when multiple sources cover it.
- Key facts should be specific, verifiable claims (numbers, dates, names, events).
- If a story only has one source, note that in perspectives.
- Perspectives should represent genuinely different viewpoints, not just different wordings of the same position.
- Do not fabricate information. Only use what's in the provided articles.
- Return ONLY the JSON array, no other text.`;

  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") return [];

  try {
    // Extract JSON from response
    const text = content.text.trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    const stories = JSON.parse(jsonMatch[0]) as AggregatedStory[];
    return stories;
  } catch (e) {
    console.error("Failed to parse Claude response:", e);
    return [];
  }
}

/**
 * Given a list of story headlines/summaries, fetches diverse perspectives
 * from different political/editorial angles using search terms.
 */
export async function generateDigestIntro(
  period: "morning" | "midday" | "evening",
  storyCount: number,
  categories: NewsCategory[]
): Promise<string> {
  const periodLabels = {
    morning: "morning",
    midday: "midday",
    evening: "evening",
  };

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `Write a brief, neutral 1-2 sentence introduction for a ${periodLabels[period]} news digest. It covers ${storyCount} stories across: ${categories.join(", ")}. Be concise, professional, and non-partisan. No greetings or sign-offs.`,
      },
    ],
  });

  const content = message.content[0];
  return content.type === "text" ? content.text : "";
}
