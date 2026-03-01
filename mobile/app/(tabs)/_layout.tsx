import { Tabs } from "expo-router";
import { Platform, useColorScheme } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const TINT_LIGHT = "#0f172a";
const TINT_DARK = "#f8fafc";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tintColor = colorScheme === "dark" ? TINT_DARK : TINT_LIGHT;
  const tabBarBg = colorScheme === "dark" ? "#0f172a" : "#ffffff";
  const inactiveColor = colorScheme === "dark" ? "#64748b" : "#94a3b8";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tintColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: tabBarBg,
          borderTopColor: colorScheme === "dark" ? "#1e293b" : "#e2e8f0",
          ...(Platform.OS === "ios" ? {} : { height: 60, paddingBottom: 8 }),
        },
        headerStyle: {
          backgroundColor: tabBarBg,
        },
        headerTintColor: tintColor,
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "NewsLens",
          tabBarLabel: "Feed",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper-outline" color={color} size={size} />
          ),
          headerRight: undefined,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
