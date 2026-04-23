"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { StoryNarrativeView } from "@/components/StoryNarrativeView";
import { EmptyFeed } from "@/components/EmptyFeed";
import type { AggregatedStory, NewsDigest } from "@/lib/types";

const READ_KEY = "newsagg:read-stories";

// ── localStorage-backed store ──────────────────────────────────────────────
const storeListeners = new Set<() => void>();

function subscribeReadIds(callback: () => void): () => void {
  storeListeners.add(callback);
  const onStorage = (e: StorageEvent) => { if (e.key === READ_KEY) callback(); };
  window.addEventListener("storage", onStorage);
  return () => {
    storeListeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function getReadIdsSnapshot(): string {
  try { return localStorage.getItem(READ_KEY) ?? "[]"; }
  catch { return "[]"; }
}

function getServerSnapshot(): string { return "[]"; }

function writeReadIds(ids: Set<string>): void {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
    storeListeners.forEach((l) => l());
  } catch { /* ignore */ }
}

// ── Story flattening ───────────────────────────────────────────────────────

interface StoryWithId {
  id: string;
  story: AggregatedStory;
  digestId: string;
  digestDate: string;
}

function storiesForDigest(digest: NewsDigest): StoryWithId[] {
  return digest.stories.map((story, i) => ({
    id: `${digest.id}-${i}`,
    story,
    digestId: digest.id,
    digestDate: digest.date,
  }));
}

// ── Component ──────────────────────────────────────────────────────────────

interface StoryReaderProps {
  digest: NewsDigest | null;
}

export function StoryReader({ digest: initialDigest }: StoryReaderProps) {
  const [digest, setDigest] = useState(initialDigest);

  const [storyIndex, setStoryIndex] = useState(() => {
    if (!initialDigest) return 0;
    const stories = storiesForDigest(initialDigest);
    try {
      const saved = JSON.parse(localStorage.getItem(READ_KEY) ?? "[]") as string[];
      const readSet = new Set(saved);
      const idx = stories.findIndex((s) => !readSet.has(s.id));
      return idx === -1 ? stories.length : idx;
    } catch {
      return 0;
    }
  });

  // Recheck for a new digest when the tab/window regains focus
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/news");
        if (!res.ok) return;
        const fresh: NewsDigest | null = await res.json();
        if (fresh && fresh.id !== digest?.id) {
          setDigest(fresh);
          setStoryIndex(0);
        }
      } catch {
        // Silently ignore fetch errors (offline, etc.)
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [digest?.id]);

  const rawReadIds = useSyncExternalStore(
    subscribeReadIds,
    getReadIdsSnapshot,
    getServerSnapshot
  );

  const readIds = useMemo(
    () => new Set<string>(JSON.parse(rawReadIds) as string[]),
    [rawReadIds]
  );

  const stories = useMemo(
    () => (digest ? storiesForDigest(digest) : []),
    [digest]
  );

  const currentStory = stories[storyIndex] ?? null;
  const allRead = stories.length > 0 && storyIndex >= stories.length;

  const handleMarkRead = useCallback(() => {
    if (!currentStory) return;
    const next = new Set(readIds);
    next.add(currentStory.id);
    writeReadIds(next);
    setStoryIndex((i) => i + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStory, readIds]);

  const handleSkip = useCallback(() => {
    handleMarkRead();
  }, [handleMarkRead]);

  const handlePrevious = useCallback(() => {
    if (storyIndex <= 0) return;
    setStoryIndex((i) => i - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [storyIndex]);

  const handleNotInteresting = useCallback(async () => {
    if (!currentStory) return;
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: currentStory.story.headline,
          digestId: currentStory.digestId,
        }),
      });
    } catch {
      // Best effort — don't block the UI
    }
    handleMarkRead();
  }, [currentStory, handleMarkRead]);

  const handleMarkAllRead = useCallback(() => {
    const next = new Set(readIds);
    for (const s of stories) next.add(s.id);
    writeReadIds(next);
    setStoryIndex(stories.length);
  }, [stories, readIds]);

  const handleReset = useCallback(() => {
    writeReadIds(new Set());
    setStoryIndex(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const totalRead = useMemo(
    () => stories.filter((s) => readIds.has(s.id)).length,
    [stories, readIds]
  );

  if (!digest) {
    return <EmptyFeed variant="no-digests" />;
  }

  if (allRead) {
    return (
      <EmptyFeed
        variant="all-read"
        totalRead={totalRead}
        onReset={handleReset}
      />
    );
  }

  if (!currentStory) {
    return <EmptyFeed variant="no-digests" />;
  }

  return (
    <StoryNarrativeView
      key={currentStory.id}
      story={currentStory.story}
      storyIndex={storyIndex}
      totalStories={stories.length}
      digestDate={currentStory.digestDate}
      onMarkRead={handleMarkRead}
      onSkip={handleSkip}
      onNotInteresting={handleNotInteresting}
      onPrevious={storyIndex > 0 ? handlePrevious : undefined}
      onMarkAllRead={handleMarkAllRead}
    />
  );
}
