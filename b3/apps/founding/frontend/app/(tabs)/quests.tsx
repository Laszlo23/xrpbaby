import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "@/src/api/client";
import { useAuth } from "@/src/contexts/AuthContext";
import { colors, radius, spacing } from "@/src/theme";

type Tab = "daily" | "ecosystem" | "community";

export default function QuestsScreen() {
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState<Tab>("daily");
  const [daily, setDaily] = useState<any[]>([]);
  const [eco, setEco] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [d, e, m] = await Promise.all([api.dailyQuests(), api.ecosystem(), api.communityMissions()]);
      setDaily(d);
      setEco(e);
      setMissions(m);
    } catch (err) {
      console.warn(err);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const completeDaily = async (slug: string) => {
    try {
      const res = await api.completeQuest(slug);
      if (res.awarded) {
        setUser(res.user);
        setDaily((cur) => cur.map((q) => (q.slug === slug ? { ...q, completed: true } : q)));
      }
    } catch (e: any) {
      Alert.alert("Quest", e.message);
    }
  };

  const openEco = async (item: { slug: string; url: string; name: string; xp: number }) => {
    try {
      await WebBrowser.openBrowserAsync(item.url);
    } catch {}
    try {
      const res = await api.visitEcosystem(item.slug);
      if (res.awarded) {
        setUser(res.user);
      }
    } catch (e: any) {
      console.warn(e);
    }
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>MISSIONS</Text>
          <Text style={styles.title}>Quests</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        {(["daily", "ecosystem", "community"] as Tab[]).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]} testID={`tab-${t}`}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl tintColor={colors.gold} refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {tab === "daily" && daily.map((q, i) => (
          <Animated.View key={q.slug} entering={FadeInUp.delay(i * 60)}>
            <QuestRow
              icon={q.icon}
              title={q.title}
              description={q.description}
              xp={q.xp}
              completed={q.completed}
              onPress={() => !q.completed && completeDaily(q.slug)}
              testID={`daily-${q.slug}`}
            />
          </Animated.View>
        ))}

        {tab === "ecosystem" && eco.map((e, i) => {
          const visited = user.visited_apps?.includes(e.slug);
          return (
            <Animated.View key={e.slug} entering={FadeInUp.delay(i * 60)}>
              <QuestRow
                icon="globe"
                title={e.name}
                description={e.description}
                xp={e.xp}
                completed={visited}
                actionLabel={visited ? "Visited" : "Visit App"}
                onPress={() => openEco(e)}
                testID={`eco-${e.slug}`}
              />
            </Animated.View>
          );
        })}

        {tab === "community" && missions.map((m, i) => (
          <Animated.View key={m.slug} entering={FadeInUp.delay(i * 60)} style={styles.missionCard} testID={`comm-${m.slug}`}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.missionTitle}>{m.title}</Text>
                <Text style={styles.missionDesc}>{m.description}</Text>
              </View>
              <View style={styles.xpPill}>
                <Ionicons name="sparkles" color={colors.gold} size={10} />
                <Text style={styles.xpPillText}>+{m.reward_xp} XP</Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <LinearGradient colors={[colors.gold, colors.goldDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.progressFill, { width: `${Math.max(2, m.percent * 100)}%` }]} />
            </View>
            <Text style={styles.missionMeta}>{m.progress.toLocaleString()} / {m.goal.toLocaleString()} · {(m.percent * 100).toFixed(1)}%</Text>
          </Animated.View>
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function QuestRow({
  icon, title, description, xp, completed, onPress, actionLabel = "Complete", testID,
}: {
  icon: any; title: string; description: string; xp: number; completed?: boolean; onPress: () => void; actionLabel?: string; testID: string;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.questCard, completed && styles.questDone, pressed && !completed && { transform: [{ scale: 0.99 }] }]} testID={testID}>
      <View style={[styles.questIcon, completed && { backgroundColor: colors.emerald + "33", borderColor: colors.emerald + "55" }]}>
        <Ionicons name={completed ? "checkmark" : icon} size={20} color={completed ? colors.emerald : colors.gold} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.questTitle}>{title}</Text>
        <Text style={styles.questDesc}>{description}</Text>
      </View>
      <View style={{ alignItems: "flex-end", gap: 4 }}>
        <View style={styles.xpPill}>
          <Ionicons name="sparkles" color={colors.gold} size={10} />
          <Text style={styles.xpPillText}>+{xp}</Text>
        </View>
        <Text style={[styles.actionText, completed && { color: colors.emerald }]}>{completed ? "Done" : actionLabel}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { padding: spacing.lg, paddingBottom: spacing.sm },
  eyebrow: { color: colors.emerald, fontSize: 11, fontWeight: "800", letterSpacing: 2 },
  title: { color: colors.textPrimary, fontSize: 32, fontWeight: "800", letterSpacing: -0.5, marginTop: 4 },
  tabs: { flexDirection: "row", paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.md },
  tab: { flex: 1, paddingVertical: 10, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  tabActive: { backgroundColor: "rgba(255,215,0,0.12)", borderColor: colors.gold + "66" },
  tabText: { color: colors.textMuted, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  tabTextActive: { color: colors.gold },
  scroll: { paddingHorizontal: spacing.lg, gap: spacing.md },
  questCard: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: "rgba(255,255,255,0.03)" },
  questDone: { opacity: 0.55 },
  questIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,215,0,0.1)", borderWidth: 1, borderColor: colors.gold + "44" },
  questTitle: { color: colors.textPrimary, fontWeight: "800", fontSize: 14 },
  questDesc: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  xpPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: "rgba(255,215,0,0.12)", borderWidth: 1, borderColor: colors.gold + "44" },
  xpPillText: { color: colors.gold, fontSize: 11, fontWeight: "800" },
  actionText: { color: colors.gold, fontSize: 11, fontWeight: "700" },
  missionCard: { padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: "rgba(255,255,255,0.03)", gap: spacing.sm },
  missionTitle: { color: colors.textPrimary, fontWeight: "800", fontSize: 15 },
  missionDesc: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  missionMeta: { color: colors.textMuted, fontSize: 11 },
  progressBar: { height: 10, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 5, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 5 },
});
