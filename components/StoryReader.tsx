"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { StoryNarrativeView } from "@/components/StoryNarrativeView";
import { BriefingComplete } from "@/components/BriefingComplete";
import { EmptyFeed } from "@/components/EmptyFeed";
import type { AggregatedStory, DigestPeriod, NewsDigest } from "@/lib/types";

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
  digestPeriod: DigestPeriod;
}

function storiesForDigest(digest: NewsDigest): StoryWithId[] {
  return digest.stories.map((story, i) => ({
    id: `${digest.id}-${i}`,
    story,
    digestId: digest.id,
    digestDate: digest.date,
    digestPeriod: digest.period,
  }));
}

// ── Component ──────────────────────────────────────────────────────────────

interface StoryReaderProps {
  digests: NewsDigest[];
  onDigestChange?: (digest: NewsDigest | null) => void;
}

export function StoryReader({ digests: initialDigests, onDigestChange }: StoryReaderProps) {
  const [digests, setDigests] = useState(initialDigests);
  const [briefingIndex, setBriefingIndex] = useState(0);
  const [storyIndex, setStoryIndex] = useState(() => {
    // Start at the first unread story on initial load
    const digest = initialDigests[0];
    if (!digest) return 0;
    const stories = storiesForDigest(digest);
    try {
      const saved = JSON.parse(localStorage.getItem(READ_KEY) ?? "[]") as string[];
      const readSet = new Set(saved);
      const idx = stories.findIndex((s) => !readSet.has(s.id));
      return idx === -1 ? stories.length : idx;
    } catch {
      return 0;
    }
  });

  // Recheck for new digests when the tab/window regains focus
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/news");
        if (!res.ok) return;
        const freshDigests: NewsDigest[] = await res.json();
        if (freshDigests.length > 0) {
          setDigests(freshDigests);
        }
      } catch {
        // Silently ignore fetch errors (offline, etc.)
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const rawReadIds = useSyncExternalStore(
    subscribeReadIds,
    getReadIdsSnapshot,
    getServerSnapshot
  );

  const readIds = useMemo(
    () => new Set<string>(JSON.parse(rawReadIds) as string[]),
    [rawReadIds]
  );

  const currentDigest = digests[briefingIndex] ?? null;

  const currentStories = useMemo(
    () => (currentDigest ? storiesForDigest(currentDigest) : []),
    [currentDigest]
  );

  // The displayed story comes from the explicit index.
  // If storyIndex is past the end, all stories are done (briefing complete).
  const currentStory = currentStories[storyIndex] ?? null;
  const briefingComplete = currentStories.length > 0 && storyIndex >= currentStories.length;

  const hasNextBriefing = briefingIndex < digests.length - 1;

  // Count how many remaining digests have unread stories
  const remainingBriefings = useMemo(() => {
    let count = 0;
    for (let i = briefingIndex + 1; i < digests.length; i++) {
      const stories = storiesForDigest(digests[i]);
      if (stories.some((s) => !readIds.has(s.id))) count++;
    }
    return count;
  }, [digests, briefingIndex, readIds]);

  // Notify parent when digest changes
  const navigateToBriefing = useCallback(
    (index: number) => {
      setBriefingIndex(index);
      // Start at the first unread story in the new briefing
      const digest = digests[index];
      if (digest) {
        const stories = storiesForDigest(digest);
        const idx = stories.findIndex((s) => !readIds.has(s.id));
        setStoryIndex(idx === -1 ? stories.length : idx);
      } else {
        setStoryIndex(0);
      }
      onDigestChange?.(digests[index] ?? null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [digests, readIds, onDigestChange]
  );

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
    // Send feedback to the server
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
    // Also mark as read so we advance
    handleMarkRead();
  }, [currentStory, handleMarkRead]);

  const handleMarkAllRead = useCallback(() => {
    const next = new Set(readIds);
    for (const s of currentStories) next.add(s.id);
    writeReadIds(next);
    setStoryIndex(currentStories.length);
  }, [currentStories, readIds]);

  const handleMarkAllReadAndDismiss = useCallback(() => {
    // Mark all stories across all digests as read
    const next = new Set(readIds);
    for (const digest of digests) {
      const stories = storiesForDigest(digest);
      for (const s of stories) next.add(s.id);
    }
    writeReadIds(next);
  }, [digests, readIds]);

  const handleNextBriefing = useCallback(() => {
    // Find the next digest with unread stories
    for (let i = briefingIndex + 1; i < digests.length; i++) {
      const stories = storiesForDigest(digests[i]);
      if (stories.some((s) => !readIds.has(s.id))) {
        navigateToBriefing(i);
        return;
      }
    }
    // If no unread briefings, just go to next
    if (hasNextBriefing) {
      navigateToBriefing(briefingIndex + 1);
    }
  }, [briefingIndex, digests, readIds, hasNextBriefing, navigateToBriefing]);

  const handleReset = useCallback(() => {
    writeReadIds(new Set());
    setBriefingIndex(0);
    setStoryIndex(0);
    onDigestChange?.(digests[0] ?? null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [digests, onDigestChange]);

  const allStoriesAllDigests = useMemo(
    () => digests.flatMap((d) => storiesForDigest(d)),
    [digests]
  );
  const totalRead = useMemo(
    () => allStoriesAllDigests.filter((s) => readIds.has(s.id)).length,
    [allStoriesAllDigests, readIds]
  );
  const allRead = totalRead === allStoriesAllDigests.length && allStoriesAllDigests.length > 0;

  // No digests at all
  if (digests.length === 0) {
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

  // Current briefing complete but more briefings available
  if (briefingComplete && currentDigest) {
    return (
      <BriefingComplete
        digest={currentDigest}
        storiesRead={currentStories.length}
        remainingBriefings={remainingBriefings}
        onNextBriefing={remainingBriefings > 0 ? handleNextBriefing : undefined}
        onMarkAllRead={handleMarkAllReadAndDismiss}
      />
    );
  }

  if (!currentStory || !currentDigest) {
    return <EmptyFeed variant="no-digests" />;
  }

  return (
    <StoryNarrativeView
      key={currentStory.id}
      story={currentStory.story}
      storyIndex={storyIndex}
      totalStories={currentStories.length}
      digestDate={currentStory.digestDate}
      digestPeriod={currentStory.digestPeriod}
      onMarkRead={handleMarkRead}
      onSkip={handleSkip}
      onNotInteresting={handleNotInteresting}
      onPrevious={storyIndex > 0 ? handlePrevious : undefined}
      onMarkAllRead={handleMarkAllRead}
    />
  );
}
