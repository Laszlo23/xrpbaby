import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "@/src/api/client";
import { colors, radius, shadows, spacing } from "@/src/theme";

type Cat = "xp" | "referrers" | "founders";

export default function Leaderboard() {
  const [cat, setCat] = useState<Cat>("xp");
  const [rows, setRows] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (c = cat) => {
    try { setRows(await api.leaderboard(c, 50)); } catch {}
  };

  useEffect(() => { load(cat); }, [cat]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>HONOUR ROLL</Text>
        <Text style={styles.title}>Leaderboard</Text>
      </View>

      <View style={styles.tabs}>
        {(["xp", "referrers", "founders"] as Cat[]).map((c) => (
          <Pressable key={c} onPress={() => setCat(c)} style={[styles.tab, cat === c && styles.tabActive]} testID={`tab-${c}`}>
            <Text style={[styles.tabText, cat === c && styles.tabTextActive]}>{labelFor(c)}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl tintColor={colors.gold} refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {rows.length === 0 && (
          <View style={styles.empty}><Text style={styles.emptyText}>No builders yet. Be the first.</Text></View>
        )}
        {rows.map((r, i) => (
          <Animated.View key={r.username + i} entering={FadeInUp.delay(i * 30)}>
            <View style={[styles.row, i < 3 && styles.rowTop, i === 0 && shadows.gold]} testID={`rank-${i + 1}`}>
              <View style={[styles.rank, i < 3 && { backgroundColor: medalColor(i) }]}>
                <Text style={[styles.rankText, i < 3 && { color: "#000" }]}>{r.rank}</Text>
              </View>
              <View style={[styles.avatar, { backgroundColor: medalColor(i) }]}>
                <Text style={styles.avatarText}>{r.username?.[0]?.toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{r.username}</Text>
                <Text style={styles.lvl}>
                  LVL {r.level?.id} · {r.level?.name}
                  {r.farcaster_username ? ` · @${r.farcaster_username}` : r.farcaster_fid ? ` · FID ${r.farcaster_fid}` : ""}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.value}>{valueFor(r, cat).toLocaleString()}</Text>
                <Text style={styles.valueLabel}>{cat === "referrers" ? "INVITES" : cat === "founders" ? "SCORE" : "XP"}</Text>
              </View>
            </View>
          </Animated.View>
        ))}
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function labelFor(c: Cat) {
  return c === "xp" ? "GLOBAL XP" : c === "referrers" ? "REFERRERS" : "FOUNDERS";
}

function valueFor(r: any, c: Cat) {
  return c === "xp" ? r.xp : c === "referrers" ? r.referral_count : r.founding_score;
}

function medalColor(i: number) {
  return i === 0 ? colors.gold : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : colors.surfaceElevated;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { padding: spacing.lg, paddingBottom: spacing.sm },
  eyebrow: { color: colors.emerald, fontSize: 11, fontWeight: "800", letterSpacing: 2 },
  title: { color: colors.textPrimary, fontSize: 32, fontWeight: "800", marginTop: 4 },
  tabs: { flexDirection: "row", paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.md },
  tab: { flex: 1, paddingVertical: 10, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  tabActive: { backgroundColor: "rgba(255,215,0,0.12)", borderColor: colors.gold + "66" },
  tabText: { color: colors.textMuted, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  tabTextActive: { color: colors.gold },
  scroll: { paddingHorizontal: spacing.lg, gap: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: "rgba(255,255,255,0.03)" },
  rowTop: { borderColor: colors.gold + "44" },
  rank: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceElevated, alignItems: "center", justifyContent: "center" },
  rankText: { color: colors.textPrimary, fontWeight: "800", fontSize: 13 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#000", fontWeight: "900", fontSize: 16 },
  name: { color: colors.textPrimary, fontWeight: "800", fontSize: 15 },
  lvl: { color: colors.textMuted, fontSize: 11, letterSpacing: 1, marginTop: 2 },
  value: { color: colors.gold, fontWeight: "800", fontSize: 16 },
  valueLabel: { color: colors.textMuted, fontSize: 9, letterSpacing: 1, marginTop: 2 },
  empty: { padding: spacing.xl, alignItems: "center" },
  emptyText: { color: colors.textMuted },
});
