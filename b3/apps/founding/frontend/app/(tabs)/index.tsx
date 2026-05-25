import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "@/src/api/client";
import { useAuth } from "@/src/contexts/AuthContext";
import { useCountdown } from "@/src/hooks/useCountdown";
import { KEY_COLORS, VILLAGE_IMAGES, colors, radius, shadows, spacing } from "@/src/theme";

export default function Home() {
  const { user, refresh } = useAuth();
  const { days, hours, minutes, seconds } = useCountdown();
  const [refreshing, setRefreshing] = useState(false);
  const [feed, setFeed] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);

  const loadAll = async () => {
    try {
      const [f, m] = await Promise.all([api.feed(8), api.communityMissions()]);
      setFeed(f);
      setMissions(m);
    } catch {}
  };

  useEffect(() => { loadAll(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refresh(), loadAll()]);
    setRefreshing(false);
  };

  if (!user) return null;

  const lvl = user.level.current;
  const nxt = user.level.next;
  const progress = user.level.progress;

  // village evolves based on total xp (community-driven feel)
  const villageImage = user.xp >= 3000 ? VILLAGE_IMAGES.thriving : VILLAGE_IMAGES.abandoned;

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl tintColor={colors.gold} refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Pressable onPress={() => router.push("/(tabs)/profile")} style={styles.avatar} testID="header-avatar">
                <Text style={styles.avatarText}>{user.username[0]?.toUpperCase()}</Text>
              </Pressable>
              <View>
                <Text style={styles.hello}>Hello, builder</Text>
                <Text style={styles.userName}>{user.username}</Text>
              </View>
            </View>
            <Pressable onPress={() => router.push("/feed")} style={styles.iconBtn} testID="open-feed">
              <Ionicons name="notifications" size={20} color={colors.textPrimary} />
            </Pressable>
          </View>

          {/* Level + XP */}
          <Animated.View entering={FadeInDown.duration(500)} style={styles.levelCard}>
            <LinearGradient colors={["rgba(80,200,120,0.15)", "rgba(255,215,0,0.08)"]} style={StyleSheet.absoluteFillObject} />
            <View style={styles.levelRow}>
              <View>
                <Text style={styles.levelEyebrow}>LEVEL {lvl.id} · {lvl.name.toUpperCase()}</Text>
                <Text style={styles.xpText}>{user.xp.toLocaleString()} XP</Text>
              </View>
              <View style={styles.scoreBox}>
                <Ionicons name="sparkles" size={14} color={colors.gold} />
                <Text style={styles.scoreText}>{user.founding_score.toLocaleString()}</Text>
                <Text style={styles.scoreLabel}>FOUNDING</Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <LinearGradient colors={[colors.emerald, colors.emeraldDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.progressFill, { width: `${Math.max(4, progress * 100)}%` }]} />
            </View>
            <Text style={styles.nextLevel}>
              {nxt ? `${(nxt.threshold - user.xp).toLocaleString()} XP to ${nxt.name}` : "You are a Founder. Maximum prestige."}
            </Text>
          </Animated.View>

          {/* Village hero */}
          <Animated.View entering={FadeIn.delay(150)} style={styles.villageCard}>
            <Image source={{ uri: villageImage }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
            <LinearGradient colors={["rgba(10,10,10,0)", "rgba(10,10,10,0.95)"]} locations={[0.4, 1]} style={StyleSheet.absoluteFillObject} />
            <View style={styles.villageMeta}>
              <View style={styles.miniCountdown}>
                <Text style={styles.miniCountdownLabel}>LAUNCH IN</Text>
                <Text style={styles.miniCountdownValue}>
                  {String(days).padStart(2, "0")}d · {String(hours).padStart(2, "0")}h · {String(minutes).padStart(2, "0")}m · {String(seconds).padStart(2, "0")}s
                </Text>
              </View>
              <Text style={styles.villageTitle}>The Village Is {user.xp >= 3000 ? "Coming Back to Life" : "Waiting for Builders"}</Text>
              <Text style={styles.villageSub}>Every quest you complete restores a street.</Text>
            </View>
          </Animated.View>

          {/* AI Mayor card */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.mayorCard}>
            <Image source={{ uri: VILLAGE_IMAGES.mayor }} style={styles.mayorAvatar} contentFit="cover" />
            <View style={{ flex: 1 }}>
              <Text style={styles.mayorName}>Mayor Culture · AI</Text>
              <Text style={styles.mayorMsg}>Welcome back, {user.username}. Two more quests will unlock your next badge — let's keep the lights on.</Text>
              <Pressable onPress={() => router.push("/mayor")} style={styles.mayorBtn} testID="open-mayor">
                <Text style={styles.mayorBtnText}>Talk to the Mayor</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.gold} />
              </Pressable>
            </View>
          </Animated.View>

          {/* Quick actions */}
          <View style={styles.quickRow}>
            <QuickAction icon="flag" color={colors.emerald} label="Quests" onPress={() => router.push("/(tabs)/quests")} testID="qa-quests" />
            <QuickAction icon="sync" color={colors.gold} label="Spin" onPress={() => router.push("/(tabs)/inventory")} testID="qa-spin" />
            <QuickAction icon="cube" color={colors.blue} label="Vault" onPress={() => router.push("/(tabs)/inventory")} testID="qa-vault" />
            <QuickAction icon="trophy" color={colors.gold} label="Ranks" onPress={() => router.push("/(tabs)/leaderboard")} testID="qa-leaderboard" />
          </View>

          {/* Keys */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Keys</Text>
              <Pressable onPress={() => router.push("/(tabs)/inventory")}><Text style={styles.linkText}>Vault →</Text></Pressable>
            </View>
            <View style={styles.keyRow}>
              {["builder", "culture", "vision", "founder"].map((k) => (
                <View key={k} style={[styles.keyCard, { borderColor: KEY_COLORS[k] + "55" }]} testID={`key-card-${k}`}>
                  <Ionicons name="key" color={KEY_COLORS[k]} size={20} />
                  <Text style={styles.keyCount}>{user.keys?.[k] ?? 0}</Text>
                  <Text style={styles.keyLabel}>{k}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Community missions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Community Missions</Text>
            <Text style={styles.sectionSub}>Everyone contributes. Everyone unlocks.</Text>
            {missions.slice(0, 3).map((m) => (
              <View key={m.slug} style={styles.missionCard} testID={`mission-${m.slug}`}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.missionTitle}>{m.title}</Text>
                  <Text style={styles.missionDesc}>{m.description}</Text>
                  <View style={styles.progressBar}>
                    <LinearGradient colors={[colors.gold, colors.goldDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.progressFill, { width: `${Math.max(2, m.percent * 100)}%` }]} />
                  </View>
                  <Text style={styles.missionMeta}>{m.progress.toLocaleString()} / {m.goal.toLocaleString()}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Activity */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Live Activity</Text>
              <Pressable onPress={() => router.push("/feed")}><Text style={styles.linkText}>All →</Text></Pressable>
            </View>
            {feed.slice(0, 5).map((f) => (
              <BlurView key={f.id} intensity={20} tint="dark" style={styles.feedItem}>
                <View style={[styles.feedDot, { backgroundColor: feedColor(f.kind) }]} />
                <Text style={styles.feedText}>{f.text}</Text>
              </BlurView>
            ))}
          </View>

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function QuickAction({ icon, color, label, onPress, testID }: { icon: any; color: string; label: string; onPress: () => void; testID: string }) {
  return (
    <Pressable onPress={onPress} style={styles.quickItem} testID={testID}>
      <View style={[styles.quickIcon, { backgroundColor: color + "22", borderColor: color + "55" }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

function feedColor(kind: string) {
  switch (kind) {
    case "level_up": return colors.gold;
    case "key": return colors.blue;
    case "referral": return colors.emerald;
    default: return colors.textMuted;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: 120, gap: spacing.lg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  avatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: colors.gold, alignItems: "center", justifyContent: "center", ...shadows.gold,
  },
  avatarText: { color: "#000", fontWeight: "900", fontSize: 18 },
  hello: { color: colors.textMuted, fontSize: 12, letterSpacing: 1 },
  userName: { color: colors.textPrimary, fontSize: 18, fontWeight: "800" },
  iconBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.03)" },
  levelCard: { padding: spacing.lg, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.borderStrong, overflow: "hidden", gap: spacing.sm },
  levelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  levelEyebrow: { color: colors.emerald, fontSize: 11, fontWeight: "800", letterSpacing: 2 },
  xpText: { color: colors.textPrimary, fontSize: 28, fontWeight: "800", marginTop: 2 },
  scoreBox: { alignItems: "center", padding: spacing.sm, borderRadius: radius.md, backgroundColor: "rgba(255,215,0,0.1)", borderWidth: 1, borderColor: colors.gold + "44" },
  scoreText: { color: colors.gold, fontWeight: "800", fontSize: 18 },
  scoreLabel: { color: colors.gold, fontSize: 9, letterSpacing: 1, marginTop: -2 },
  progressBar: { height: 10, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 5, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 5 },
  nextLevel: { color: colors.textMuted, fontSize: 12 },
  villageCard: { height: 200, borderRadius: radius.xl, overflow: "hidden", borderWidth: 1, borderColor: colors.borderStrong },
  villageMeta: { position: "absolute", bottom: spacing.md, left: spacing.md, right: spacing.md, gap: 4 },
  miniCountdown: { alignSelf: "flex-start", paddingVertical: 6, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: "rgba(0,0,0,0.5)", borderWidth: 1, borderColor: colors.gold + "55" },
  miniCountdownLabel: { color: colors.gold, fontSize: 9, letterSpacing: 2, fontWeight: "800" },
  miniCountdownValue: { color: colors.textPrimary, fontWeight: "700", fontSize: 12 },
  villageTitle: { color: colors.textPrimary, fontWeight: "800", fontSize: 18, marginTop: 8 },
  villageSub: { color: colors.textSecondary, fontSize: 12 },
  mayorCard: { flexDirection: "row", gap: spacing.md, padding: spacing.md, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: "rgba(137,207,240,0.08)" },
  mayorAvatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: colors.blue },
  mayorName: { color: colors.blue, fontWeight: "800", fontSize: 12, letterSpacing: 1 },
  mayorMsg: { color: colors.textPrimary, marginTop: 4, fontSize: 13, lineHeight: 18 },
  mayorBtn: { flexDirection: "row", gap: 6, alignItems: "center", marginTop: 8 },
  mayorBtnText: { color: colors.gold, fontWeight: "700", fontSize: 13 },
  quickRow: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm },
  quickItem: { flex: 1, alignItems: "center", gap: 6 },
  quickIcon: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  quickLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: "700" },
  section: { gap: spacing.sm },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: "800" },
  sectionSub: { color: colors.textMuted, fontSize: 12, marginBottom: 4 },
  linkText: { color: colors.gold, fontWeight: "700", fontSize: 13 },
  keyRow: { flexDirection: "row", gap: spacing.sm },
  keyCard: { flex: 1, alignItems: "center", padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, backgroundColor: "rgba(255,255,255,0.03)", gap: 2 },
  keyCount: { color: colors.textPrimary, fontWeight: "800", fontSize: 16 },
  keyLabel: { color: colors.textMuted, fontSize: 10, textTransform: "capitalize", letterSpacing: 0.5 },
  missionCard: { padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: "rgba(255,255,255,0.03)", gap: 8 },
  missionTitle: { color: colors.textPrimary, fontWeight: "800", fontSize: 15 },
  missionDesc: { color: colors.textSecondary, fontSize: 12 },
  missionMeta: { color: colors.gold, fontSize: 11, fontWeight: "700" },
  feedItem: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, overflow: "hidden", borderWidth: 1, borderColor: colors.border },
  feedDot: { width: 6, height: 6, borderRadius: 3 },
  feedText: { color: colors.textPrimary, flex: 1, fontSize: 13 },
});
