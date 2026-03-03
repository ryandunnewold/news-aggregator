"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { StoryNarrativeView } from "@/components/StoryNarrativeView";
import { EmptyFeed } from "@/components/EmptyFeed";
import type { AggregatedStory, DigestPeriod, NewsDigest } from "@/lib/types";

const READ_KEY = "newsagg:read-stories";

// ── localStorage-backed store ──────────────────────────────────────────────
// Custom listener set ensures in-tab updates propagate to useSyncExternalStore.

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
  digestDate: string;
  digestPeriod: DigestPeriod;
}

function flattenStories(digests: NewsDigest[]): StoryWithId[] {
  return digests.flatMap((digest) =>
    digest.stories.map((story, i) => ({
      id: `${digest.id}-${i}`,
      story,
      digestDate: digest.date,
      digestPeriod: digest.period,
    }))
  );
}

// ── Component ──────────────────────────────────────────────────────────────

interface StoryReaderProps {
  digests: NewsDigest[];
}

export function StoryReader({ digests }: StoryReaderProps) {
  const rawReadIds = useSyncExternalStore(
    subscribeReadIds,
    getReadIdsSnapshot,
    getServerSnapshot
  );

  const readIds = useMemo(
    () => new Set<string>(JSON.parse(rawReadIds) as string[]),
    [rawReadIds]
  );

  const allStories = useMemo(() => flattenStories(digests), [digests]);

  const unreadStories = useMemo(
    () => allStories.filter((s) => !readIds.has(s.id)),
    [allStories, readIds]
  );

  const currentStory = unreadStories[0] ?? null;

  const handleMarkRead = useCallback(() => {
    if (!currentStory) return;
    const next = new Set(readIds);
    next.add(currentStory.id);
    writeReadIds(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStory, readIds]);

  // Skip works the same as mark-as-read: advances to the next story
  const handleSkip = useCallback(() => {
    handleMarkRead();
  }, [handleMarkRead]);

  const handleReset = useCallback(() => {
    writeReadIds(new Set());
  }, []);

  if (allStories.length === 0) {
    return <EmptyFeed variant="no-digests" />;
  }

  if (!currentStory) {
    return (
      <EmptyFeed
        variant="all-read"
        totalRead={readIds.size}
        onReset={handleReset}
      />
    );
  }

  return (
    <StoryNarrativeView
      key={currentStory.id}
      story={currentStory.story}
      storyIndex={allStories.length - unreadStories.length}
      totalStories={allStories.length}
      digestDate={currentStory.digestDate}
      digestPeriod={currentStory.digestPeriod}
      onMarkRead={handleMarkRead}
      onSkip={handleSkip}
    />
  );
}
