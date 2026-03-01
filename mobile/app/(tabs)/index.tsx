import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { fetchRecentDigests } from "@/src/api";
import type { NewsDigest } from "@/src/types";
import { DigestSection } from "@/src/components/DigestSection";
import { EmptyFeed } from "@/src/components/EmptyFeed";

export default function FeedScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [digests, setDigests] = useState<NewsDigest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await fetchRecentDigests(7);
      setDigests(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load news");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load(true);
  }, [load]);

  const bg = isDark ? "#0f172a" : "#f8fafc";
  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const mutedColor = isDark ? "#64748b" : "#94a3b8";

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: bg }]}>
        <ActivityIndicator size="large" color={isDark ? "#f1f5f9" : "#0f172a"} />
        <Text style={[styles.loadingText, { color: mutedColor }]}>
          Loading news…
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: bg }]}>
        <Text style={[styles.errorText, { color: textColor }]}>⚠ {error}</Text>
        <Text style={[styles.retryHint, { color: mutedColor }]}>
          Pull down to retry
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: bg }}
      contentContainerStyle={
        digests.length === 0 ? styles.emptyContainer : styles.listContent
      }
      data={digests}
      keyExtractor={(item) => `${item.date}-${item.period}`}
      renderItem={({ item }) => <DigestSection digest={item} />}
      ListEmptyComponent={<EmptyFeed />}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={isDark ? "#f1f5f9" : "#0f172a"}
        />
      }
      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  retryHint: {
    fontSize: 13,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    padding: 16,
  },
});
