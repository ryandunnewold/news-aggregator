import Anthropic from "@anthropic-ai/sdk";
import type { RawArticle, AggregatedStory } from "./types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Groups raw articles into story clusters by topic and aggregates each
 * into a balanced, factual report with diverse perspectives.
 * Returns exactly 10 stories (or fewer if not enough source material).
 */
export async function aggregateNewsStories(
  articles: RawArticle[]
): Promise<AggregatedStory[]> {
  if (articles.length === 0) return [];

  // Format articles for the prompt, including content when available
  const articlesText = articles
    .slice(0, 50) // Cap to avoid token limits
    .map(
      (a, i) =>
        `[${i + 1}] SOURCE: ${a.source.name}
URL: ${a.url}
TITLE: ${a.title}
DESCRIPTION: ${a.description ?? "N/A"}
CONTENT: ${a.content ?? "N/A"}
PUBLISHED: ${a.publishedAt}
---`
    )
    .join("\n");

  const prompt = `You are a neutral, factual news aggregator. Your job is to analyze news articles from diverse sources and create detailed, balanced summaries that give the reader all the substantive information so they don't need to click through to the original articles.

Below are news articles from various sources covering today's top stories. These sources represent different political and editorial perspectives.

ARTICLES:
${articlesText}

Your task:
1. Group these articles into distinct news stories (articles about the same event/topic belong together)
2. Rank stories by importance and significance
3. Return exactly 10 stories (or fewer if there aren't enough distinct stories)
4. Each story should be a single topic — do NOT combine unrelated stories

Return a JSON array of story objects. Each story must follow this exact schema:
{
  "headline": "Neutral, factual headline (no editorial slant)",
  "summary": "A detailed 4-6 sentence summary that covers ALL the substantive details: who, what, when, where, why, and how. Include specific names, numbers, amounts, dates, rankings, lists, and outcomes mentioned in the articles. The reader should get the full picture without needing to read the original articles.",
  "keyFacts": ["Detailed fact 1", "Detailed fact 2", "Detailed fact 3", "...up to 8 facts"],
  "perspectives": [
    {
      "label": "Label for this perspective (e.g., 'Conservative view', 'Progressive view', 'Industry perspective', 'Expert opinion')",
      "description": "2-3 sentences describing this angle/perspective on the story with specific details",
      "sourceUrl": "URL from the article that best represents this perspective",
      "sourceName": "Name of the source"
    }
  ],
  "sources": [
    { "name": "Source name", "url": "Article URL" }
  ],
  "imageUrl": "Use the best image URL from the articles if available, or omit"
}

IMPORTANT GUIDELINES:
- Be COMPREHENSIVE. The reader should not need to click through to the original articles. Extract every substantive detail: specific names, numbers, dollar amounts, percentages, dates, rankings, lists, quotes, and outcomes.
- If an article mentions a list (e.g., "5 things", "top 10", "key players"), include ALL items from that list in the summary or key facts.
- If an article mentions specific people, companies, amounts, or statistics, include them by name/number.
- Be strictly factual. No opinion, no editorializing, no loaded language.
- Include at least 2-3 different perspectives per major story when multiple sources cover it.
- Key facts should be specific and detailed — not vague summaries. Include exact figures, full names, specific dates, and concrete outcomes.
- If a story only has one source, note that in perspectives.
- Perspectives should represent genuinely different viewpoints, not just different wordings of the same position.
- Do not fabricate information. Only use what's in the provided articles.
- Return ONLY the JSON array, no other text.`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 8192,
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
  period: "morning" | "evening",
  storyCount: number
): Promise<string> {
  const periodLabels = {
    morning: "morning",
    evening: "evening",
  };

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `Write a brief, neutral 1-2 sentence introduction for a ${periodLabels[period]} news digest. It covers ${storyCount} top stories from today. Be concise, professional, and non-partisan. No greetings or sign-offs.`,
      },
    ],
  });

  const content = message.content[0];
  return content.type === "text" ? content.text : "";
}
