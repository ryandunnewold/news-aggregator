import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Linking,
  useColorScheme,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import type { AggregatedStory } from "../types";
import { ALL_CATEGORIES } from "../types";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  story: AggregatedStory;
  index: number;
}

export function StoryCard({ story, index }: Props) {
  const [expanded, setExpanded] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const mutedColor = isDark ? "#64748b" : "#94a3b8";
  const borderColor = isDark ? "#334155" : "#e2e8f0";
  const factDot = isDark ? "#475569" : "#cbd5e1";
  const perspectiveBg = isDark ? "#0f172a" : "#f8fafc";
  const badgeBg = isDark ? "#334155" : "#f1f5f9";
  const badgeText = isDark ? "#94a3b8" : "#64748b";
  const linkColor = isDark ? "#60a5fa" : "#2563eb";
  const pillBg = isDark ? "#1e3a5f" : "#eff6ff";
  const pillText = isDark ? "#93c5fd" : "#1d4ed8";

  const categoryLabel =
    ALL_CATEGORIES.find((c) => c.value === story.category)?.label ??
    story.category;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: cardBg, borderColor, shadowColor: isDark ? "#000" : "#94a3b8" },
      ]}
    >
      {/* Story image */}
      {story.imageUrl ? (
        <Image
          source={{ uri: story.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : null}

      <View style={styles.body}>
        {/* Meta row */}
        <View style={styles.meta}>
          <Text style={[styles.indexTag, { color: mutedColor }]}>
            #{index + 1}
          </Text>
          <View style={[styles.badge, { backgroundColor: pillBg }]}>
            <Text style={[styles.badgeText, { color: pillText }]}>
              {categoryLabel}
            </Text>
          </View>
          <Text style={[styles.sourceCount, { color: mutedColor }]}>
            {story.sources.length} source{story.sources.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Headline */}
        <Text style={[styles.headline, { color: textColor }]}>
          {story.headline}
        </Text>

        {/* Summary */}
        <Text style={[styles.summary, { color: mutedColor }]}>
          {story.summary}
        </Text>

        {/* Key facts */}
        <Text style={[styles.sectionTitle, { color: mutedColor }]}>
          KEY FACTS
        </Text>
        {story.keyFacts
          .slice(0, expanded ? undefined : 3)
          .map((fact, i) => (
            <View key={i} style={styles.factRow}>
              <View style={[styles.factDot, { backgroundColor: factDot }]} />
              <Text style={[styles.factText, { color: textColor }]}>{fact}</Text>
            </View>
          ))}

        {/* Expand toggle */}
        <TouchableOpacity
          onPress={toggle}
          style={[styles.expandBtn, { borderColor }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.expandBtnText, { color: mutedColor }]}>
            {expanded ? "▲  Show less" : "▼  Perspectives & sources"}
          </Text>
        </TouchableOpacity>

        {expanded && (
          <>
            {/* Perspectives */}
            {story.perspectives.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: mutedColor }]}>
                  PERSPECTIVES
                </Text>
                {story.perspectives.map((p, i) => (
                  <View
                    key={i}
                    style={[
                      styles.perspective,
                      { backgroundColor: perspectiveBg, borderColor },
                    ]}
                  >
                    <View style={styles.perspectiveHeader}>
                      <Text
                        style={[styles.perspectiveLabel, { color: textColor }]}
                      >
                        {p.label}
                      </Text>
                      <TouchableOpacity
                        onPress={() => openUrl(p.sourceUrl)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={[styles.perspectiveSource, { color: linkColor }]}>
                          {p.sourceName} ↗
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={[styles.perspectiveDesc, { color: mutedColor }]}>
                      {p.description}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Sources */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: mutedColor }]}>
                SOURCES
              </Text>
              <View style={styles.sourcePills}>
                {story.sources.map((s, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => openUrl(s.url)}
                    style={[styles.sourcePill, { backgroundColor: badgeBg }]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.sourcePillText, { color: badgeText }]}>
                      {s.name} ↗
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 180,
  },
  body: {
    padding: 14,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  indexTag: {
    fontSize: 11,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  badge: {
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  sourceCount: {
    fontSize: 11,
  },
  headline: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  summary: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  factRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
    alignItems: "flex-start",
  },
  factDot: {
    width: 5,
    height: 5,
    borderRadius: 99,
    marginTop: 6,
    flexShrink: 0,
  },
  factText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  expandBtn: {
    marginTop: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
  },
  expandBtnText: {
    fontSize: 12,
    fontWeight: "500",
  },
  section: {
    marginTop: 14,
  },
  perspective: {
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    marginBottom: 8,
  },
  perspectiveHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
    gap: 8,
  },
  perspectiveLabel: {
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
  },
  perspectiveSource: {
    fontSize: 11,
    fontWeight: "500",
  },
  perspectiveDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  sourcePills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  sourcePill: {
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sourcePillText: {
    fontSize: 11,
    fontWeight: "500",
  },
});
