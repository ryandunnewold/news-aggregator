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
  digestDate: string;
  digestPeriod: DigestPeriod;
}

function storiesForDigest(digest: NewsDigest): StoryWithId[] {
  return digest.stories.map((story, i) => ({
    id: `${digest.id}-${i}`,
    story,
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

  const unreadInBriefing = useMemo(
    () => currentStories.filter((s) => !readIds.has(s.id)),
    [currentStories, readIds]
  );

  const currentStory = unreadInBriefing[0] ?? null;

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
      onDigestChange?.(digests[index] ?? null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [digests, onDigestChange]
  );

  const handleMarkRead = useCallback(() => {
    if (!currentStory) return;
    const next = new Set(readIds);
    next.add(currentStory.id);
    writeReadIds(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStory, readIds]);

  const handleSkip = useCallback(() => {
    handleMarkRead();
  }, [handleMarkRead]);

  const handleMarkAllRead = useCallback(() => {
    const next = new Set(readIds);
    for (const s of currentStories) next.add(s.id);
    writeReadIds(next);
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
    navigateToBriefing(0);
  }, [navigateToBriefing]);

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
  if (!currentStory && currentDigest) {
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
      storyIndex={currentStories.length - unreadInBriefing.length}
      totalStories={currentStories.length}
      digestDate={currentStory.digestDate}
      digestPeriod={currentStory.digestPeriod}
      onMarkRead={handleMarkRead}
      onSkip={handleSkip}
      onMarkAllRead={handleMarkAllRead}
    />
  );
}
