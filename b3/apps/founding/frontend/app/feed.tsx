import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "@/src/api/client";
import { colors, radius, spacing } from "@/src/theme";

const ICONS: Record<string, any> = {
  join: "person-add",
  level_up: "trophy",
  key: "key",
  referral: "people",
  share: "share-social",
  profile: "create",
};

const TINTS: Record<string, string> = {
  join: colors.emerald,
  level_up: colors.gold,
  key: colors.blue,
  referral: colors.emerald,
  share: colors.gold,
  profile: colors.blue,
};

export default function Feed() {
  const [items, setItems] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try { setItems(await api.feed(60)); } catch {}
  };

  useEffect(() => { load(); const id = setInterval(load, 10000); return () => clearInterval(id); }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back} testID="feed-back">
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <View>
          <Text style={styles.eyebrow}>LIVE FROM THE VILLAGE</Text>
          <Text style={styles.title}>Community Feed</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
        refreshControl={<RefreshControl tintColor={colors.gold} refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
      >
        {items.length === 0 && (
          <View style={styles.empty}><Text style={styles.emptyText}>The village is quiet. Be the first to act.</Text></View>
        )}
        {items.map((f, i) => (
          <Animated.View key={f.id} entering={FadeInUp.delay(i * 30)}>
            <BlurView intensity={20} tint="dark" style={styles.item}>
              <View style={[styles.iconWrap, { backgroundColor: (TINTS[f.kind] ?? colors.gold) + "22", borderColor: (TINTS[f.kind] ?? colors.gold) + "55" }]}>
                <Ionicons name={ICONS[f.kind] ?? "pulse"} size={16} color={TINTS[f.kind] ?? colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemText}>{f.text}</Text>
                <Text style={styles.itemTime}>{relative(f.ts)}</Text>
              </View>
            </BlurView>
          </Animated.View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function relative(ts: string) {
  const d = Date.now() - new Date(ts).getTime();
  const s = Math.floor(d / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: spacing.md, gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  back: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
  eyebrow: { color: colors.emerald, fontSize: 10, fontWeight: "800", letterSpacing: 2 },
  title: { color: colors.textPrimary, fontWeight: "800", fontSize: 18 },
  item: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, overflow: "hidden", borderWidth: 1, borderColor: colors.border },
  iconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  itemText: { color: colors.textPrimary, fontSize: 13 },
  itemTime: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  empty: { padding: spacing.xl, alignItems: "center" },
  emptyText: { color: colors.textMuted },
});
