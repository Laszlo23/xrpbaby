import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";

import { useAuth } from "@/src/contexts/AuthContext";
import { router } from "expo-router";
import { colors } from "@/src/theme";

export default function TabsLayout() {
  const { user, isLoading } = useAuth();
  useEffect(() => {
    if (!isLoading && !user) router.replace("/");
  }, [user, isLoading]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
        sceneStyle: { backgroundColor: colors.bg },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.OS === "android" ? "rgba(10,10,10,0.95)" : "transparent",
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 70,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          paddingTop: 8,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(10,10,10,0.95)" }]} />
          ),
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Village", tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size ?? 22} /> }} />
      <Tabs.Screen name="quests" options={{ title: "Quests", tabBarIcon: ({ color, size }) => <Ionicons name="flag" color={color} size={size ?? 22} /> }} />
      <Tabs.Screen name="inventory" options={{ title: "Vault", tabBarIcon: ({ color, size }) => <Ionicons name="cube" color={color} size={size ?? 22} /> }} />
      <Tabs.Screen name="leaderboard" options={{ title: "Ranks", tabBarIcon: ({ color, size }) => <Ionicons name="trophy" color={color} size={size ?? 22} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" color={color} size={size ?? 22} /> }} />
    </Tabs>
  );
}
