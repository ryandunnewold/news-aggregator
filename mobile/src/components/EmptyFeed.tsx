import React from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";

export function EmptyFeed() {
  const isDark = useColorScheme() === "dark";
  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const mutedColor = isDark ? "#64748b" : "#94a3b8";
  const borderColor = isDark ? "#1e293b" : "#e2e8f0";

  return (
    <View style={styles.root}>
      <View style={[styles.box, { borderColor }]}>
        <Text style={styles.icon}>📰</Text>
        <Text style={[styles.title, { color: textColor }]}>No digests yet</Text>
        <Text style={[styles.desc, { color: mutedColor }]}>
          News digests are generated at 8 AM, 2 PM, and 8 PM.{"\n"}
          Pull down to refresh once a digest is available.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  box: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    width: "100%",
    gap: 10,
  },
  icon: {
    fontSize: 36,
    marginBottom: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  desc: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
});
