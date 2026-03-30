import Anthropic from "@anthropic-ai/sdk";
import type { RawArticle, NewsCategory } from "./types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Category descriptions for web search prompts
const CATEGORY_SEARCH_TERMS: Record<NewsCategory, string> = {
  general: "top breaking news stories today",
  technology: "top technology news today (exclude video games and gaming)",
  business: "top business and financial news today",
  politics: "US politics and government news today",
  science: "top science news and discoveries today",
  health: "top health and medical news today",
  sports: "top sports news today",
  entertainment:
    "top entertainment news today (exclude video games and gaming)",
  world: "top international and world news today",
  nation: "top US domestic news and national affairs today",
  environment: "top environment and climate news today",
};

/**
 * Uses Claude with web search to discover the top news stories for a category.
 * Returns raw article data compatible with the existing aggregation pipeline.
 */
export async function searchNewsForCategory(
  category: NewsCategory,
  maxStories = 5
): Promise<RawArticle[]> {
  const searchTerm = CATEGORY_SEARCH_TERMS[category];

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 5,
      },
    ],
    messages: [
      {
        role: "user",
        content: `Search the web for: ${searchTerm}

Find the ${maxStories} most important and newsworthy stories happening right now in the "${category}" category. For each story, search for multiple sources covering it.

Return a JSON array of articles. Each article must have this exact schema:
{
  "title": "Article headline",
  "description": "2-3 sentence summary of the article",
  "content": "Detailed 4-6 sentence description with specific facts, names, numbers, and quotes from the article",
  "url": "URL of the source article",
  "urlToImage": "URL of an image if available, or null",
  "publishedAt": "ISO date string of when published",
  "source": {
    "id": null,
    "name": "Name of the news source"
  }
}

IMPORTANT:
- Find REAL, currently active news stories with REAL URLs from actual news sources
- For each major story, include 2-3 articles from different sources covering the same story
- Aim for ${maxStories} distinct stories with multiple source articles each (${maxStories * 2}-${maxStories * 3} articles total)
- Include diverse sources: mainstream, wire services, and specialty outlets
- Every URL must be a real, working link you found via web search
- Return ONLY the JSON array, no other text`,
      },
    ],
  });

  // Extract the text response (after web search tool use)
  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") return [];

  try {
    const text = textBlock.text.trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    const articles = JSON.parse(jsonMatch[0]) as RawArticle[];
    return articles;
  } catch (e) {
    console.error(`Failed to parse web search results for ${category}:`, e);
    return [];
  }
}

export type { RawArticle };
