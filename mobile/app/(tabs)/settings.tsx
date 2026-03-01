import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  Alert,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { fetchSettings, saveSettings } from "@/src/api";
import { ALL_CATEGORIES, type NewsCategory } from "@/src/types";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [selected, setSelected] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const bg = isDark ? "#0f172a" : "#f8fafc";
  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const mutedColor = isDark ? "#64748b" : "#94a3b8";
  const borderColor = isDark ? "#334155" : "#e2e8f0";
  const activeBg = isDark ? "#1e3a5f" : "#eff6ff";
  const activeBorder = isDark ? "#3b82f6" : "#3b82f6";
  const activeText = isDark ? "#93c5fd" : "#1d4ed8";

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          const settings = await fetchSettings();
          if (mounted) {
            setSelected(settings.categories ?? []);
            setDirty(false);
          }
        } catch {
          // ignore, keep defaults
        } finally {
          if (mounted) setLoading(false);
        }
      })();
      return () => {
        mounted = false;
      };
    }, [])
  );

  const toggle = (cat: NewsCategory) => {
    setDirty(true);
    setSelected((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = async () => {
    if (selected.length === 0) {
      Alert.alert("Select at least one category");
      return;
    }
    setSaving(true);
    try {
      await saveSettings(selected);
      setDirty(false);
      Alert.alert("Saved", "Your category preferences have been updated.");
    } catch {
      Alert.alert("Error", "Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: bg }]}>
        <ActivityIndicator color={textColor} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: bg }}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.sectionLabel, { color: mutedColor }]}>
        NEWS CATEGORIES
      </Text>
      <Text style={[styles.hint, { color: mutedColor }]}>
        Choose the topics you want included in each digest.
      </Text>

      <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
        {ALL_CATEGORIES.map((cat, i) => {
          const isActive = selected.includes(cat.value);
          return (
            <TouchableOpacity
              key={cat.value}
              onPress={() => toggle(cat.value)}
              style={[
                styles.row,
                {
                  borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth,
                  borderTopColor: borderColor,
                  backgroundColor: isActive ? activeBg : "transparent",
                },
              ]}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: isActive ? activeBorder : borderColor,
                    backgroundColor: isActive ? activeBorder : "transparent",
                  },
                ]}
              >
                {isActive && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text
                style={[
                  styles.categoryLabel,
                  { color: isActive ? activeText : textColor },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        onPress={handleSave}
        disabled={saving || !dirty}
        style={[
          styles.saveBtn,
          {
            backgroundColor:
              saving || !dirty
                ? isDark
                  ? "#334155"
                  : "#e2e8f0"
                : "#3b82f6",
            opacity: saving ? 0.7 : 1,
          },
        ]}
        activeOpacity={0.8}
      >
        {saving ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text
            style={[
              styles.saveBtnText,
              { color: dirty ? "#ffffff" : mutedColor },
            ]}
          >
            {dirty ? "Save Changes" : "No Changes"}
          </Text>
        )}
      </TouchableOpacity>

      <Text style={[styles.footerNote, { color: mutedColor }]}>
        Digests are generated at 8 AM, 2 PM, and 8 PM daily.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 6,
    marginLeft: 4,
  },
  hint: {
    fontSize: 13,
    marginBottom: 16,
    marginLeft: 4,
    lineHeight: 18,
  },
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 16,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  saveBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    minHeight: 50,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },
  footerNote: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
});
