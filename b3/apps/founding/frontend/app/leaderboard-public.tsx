import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "@/src/api/client";
import { colors, radius, shadows, spacing } from "@/src/theme";

export default function PublicLeaderboard() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    api.leaderboard("xp", 50).then(setRows).catch(() => {});
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back} testID="public-back">
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <View>
          <Text style={styles.eyebrow}>FOUNDING LEADERS</Text>
          <Text style={styles.title}>Top Builders</Text>
        </View>
        <Pressable onPress={() => router.push("/(auth)/register")} style={styles.joinBtn} testID="public-join">
          <Text style={styles.joinText}>Join</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: 10 }}>
        {rows.length === 0 && <Text style={{ color: colors.textMuted, textAlign: "center", padding: spacing.xl }}>No builders yet. Be the first.</Text>}
        {rows.map((r, i) => (
          <View key={r.username + i} style={[styles.row, i === 0 && shadows.gold]}>
            <View style={[styles.rank, i < 3 && { backgroundColor: medal(i) }]}>
              <Text style={[styles.rankText, i < 3 && { color: "#000" }]}>{r.rank}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{r.username}</Text>
              <Text style={styles.lvl}>LVL {r.level?.id} · {r.level?.name}</Text>
            </View>
            <Text style={styles.xp}>{r.xp.toLocaleString()} XP</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function medal(i: number) {
  return i === 0 ? colors.gold : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : colors.surfaceElevated;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md },
  back: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
  eyebrow: { color: colors.emerald, fontSize: 10, fontWeight: "800", letterSpacing: 2 },
  title: { color: colors.textPrimary, fontWeight: "800", fontSize: 18 },
  joinBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.gold },
  joinText: { color: "#000", fontWeight: "800", fontSize: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: "rgba(255,255,255,0.03)" },
  rank: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceElevated },
  rankText: { color: colors.textPrimary, fontWeight: "800" },
  name: { color: colors.textPrimary, fontWeight: "800", fontSize: 15 },
  lvl: { color: colors.textMuted, fontSize: 11, letterSpacing: 1, marginTop: 2 },
  xp: { color: colors.gold, fontWeight: "800" },
});
