import React from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import { format, parseISO } from "date-fns";
import type { NewsDigest, DigestPeriod } from "../types";
import { PERIOD_LABELS, PERIOD_TIMES, ALL_CATEGORIES } from "../types";
import { StoryCard } from "./StoryCard";

const PERIOD_EMOJI: Record<DigestPeriod, string> = {
  morning: "🌅",
  midday: "🌤",
  evening: "🌙",
};

interface Props {
  digest: NewsDigest;
}

export function DigestSection({ digest }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const mutedColor = isDark ? "#64748b" : "#94a3b8";
  const dividerColor = isDark ? "#1e293b" : "#e2e8f0";
  const pillBg = isDark ? "#1e293b" : "#f1f5f9";
  const pillText = isDark ? "#94a3b8" : "#64748b";

  const categoryLabels = digest.categories
    .map((cat) => ALL_CATEGORIES.find((c) => c.value === cat)?.label ?? cat)
    .join(" · ");

  return (
    <View>
      {/* Digest header */}
      <View style={styles.header}>
        <Text style={styles.emoji}>{PERIOD_EMOJI[digest.period]}</Text>
        <View style={styles.headerText}>
          <Text style={[styles.periodLabel, { color: textColor }]}>
            {PERIOD_LABELS[digest.period]}
          </Text>
          <Text style={[styles.dateText, { color: mutedColor }]}>
            {format(parseISO(digest.date), "EEE, MMM d")} ·{" "}
            {PERIOD_TIMES[digest.period]}
          </Text>
        </View>
        <View style={[styles.countPill, { backgroundColor: pillBg }]}>
          <Text style={[styles.countText, { color: pillText }]}>
            {digest.stories.length}
          </Text>
        </View>
      </View>

      {/* Categories */}
      {categoryLabels.length > 0 && (
        <Text style={[styles.categories, { color: mutedColor }]}>
          {categoryLabels}
        </Text>
      )}

      {/* Stories */}
      <View style={styles.stories}>
        {digest.stories.map((story, i) => (
          <StoryCard key={i} story={story} index={i} />
        ))}
      </View>

      <View style={[styles.divider, { backgroundColor: dividerColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  emoji: {
    fontSize: 22,
  },
  headerText: {
    flex: 1,
  },
  periodLabel: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  dateText: {
    fontSize: 12,
    marginTop: 1,
  },
  countPill: {
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countText: {
    fontSize: 12,
    fontWeight: "600",
  },
  categories: {
    fontSize: 11,
    marginBottom: 12,
    marginLeft: 32,
  },
  stories: {
    gap: 10,
    marginBottom: 24,
  },
  divider: {
    height: 1,
    marginBottom: 24,
    marginHorizontal: -16,
  },
});
