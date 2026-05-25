import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "@/src/api/client";
import { ConnectFarcasterButton } from "@/src/components/ConnectFarcasterButton";
import { useAuth } from "@/src/contexts/AuthContext";
import { useFarcasterMiniApp } from "@/src/hooks/useFarcasterMiniApp";
import { colors, radius, shadows, spacing } from "@/src/theme";

const BADGE_META: Record<string, { name: string; color: string; level: number }> = {
  explorer: { name: "Explorer", color: colors.blue, level: 1 },
  builder: { name: "Builder", color: colors.emerald, level: 2 },
  creator: { name: "Creator", color: colors.emerald, level: 3 },
  architect: { name: "Architect", color: colors.gold, level: 4 },
  visionary: { name: "Visionary", color: colors.gold, level: 5 },
  founder: { name: "Founder", color: colors.gold, level: 6 },
};

export default function Profile() {
  const { user, signOut, setUser, unlinkFarcaster } = useAuth();
  const { miniAppFid, inMiniApp } = useFarcasterMiniApp();
  const [bio, setBio] = useState(user?.bio ?? "");
  const [editing, setEditing] = useState(false);
  const [savedAnim, setSaved] = useState(false);

  if (!user) return null;
  const earned = new Set(user.badges);
  const avatarLetter = user.username[0]?.toUpperCase();

  const copy = async () => {
    await Clipboard.setStringAsync(user.referral_code);
    Alert.alert("Copied", `Your referral code ${user.referral_code} is on the clipboard.`);
  };

  const share = async (platform: "x" | "farcaster") => {
    try {
      const res = platform === "x" ? await api.shareX() : await api.shareFarcaster();
      setUser(res.user);
      Alert.alert("Shared", `+${res.xp} XP added. Thanks for spreading the rebuild.`);
    } catch (e: any) {
      Alert.alert("Share", e.message);
    }
  };

  const saveProfile = async () => {
    try {
      const updated = await api.updateProfile({ bio, avatar: avatarLetter });
      setUser(updated);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (e: any) {
      Alert.alert("Profile", e.message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.username}>{user.username}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <View style={styles.levelChip}>
              <Ionicons name="diamond" size={11} color={colors.gold} />
              <Text style={styles.levelChipText}>LVL {user.level.current.id} · {user.level.current.name}</Text>
            </View>
            {user.farcaster_fid ? (
              <Pressable
                onPress={() => Linking.openURL(`https://warpcast.com/~/${user.farcaster_fid}`)}
                style={styles.fidChip}
                testID="profile-fid"
              >
                <Ionicons name="at" size={11} color={colors.emerald} />
                <Text style={styles.fidChipText}>
                  FID {user.farcaster_fid}
                  {user.farcaster_username ? ` · @${user.farcaster_username}` : ""}
                </Text>
              </Pressable>
            ) : null}
          </View>
          <Pressable onPress={signOut} style={styles.signoutBtn} testID="signout">
            <Ionicons name="log-out-outline" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Stat grid */}
        <View style={styles.statGrid}>
          <Stat icon="sparkles" color={colors.gold} value={user.xp.toLocaleString()} label="XP" />
          <Stat icon="trophy" color={colors.gold} value={user.founding_score.toLocaleString()} label="Founding" />
          <Stat icon="people" color={colors.emerald} value={String(user.referral_count)} label="Invites" />
          <Stat icon="key" color={colors.blue} value={String(Object.values(user.keys ?? {}).reduce((a, b) => a + b, 0))} label="Keys" />
        </View>

        {/* Farcaster */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Farcaster</Text>
          {user.farcaster_fid ? (
            <View style={styles.farcasterLinked}>
              <Text style={styles.farcasterLinkedText}>
                Linked as FID {user.farcaster_fid}
                {user.farcaster_username ? ` (@${user.farcaster_username})` : ""}
              </Text>
              <Pressable
                onPress={async () => {
                  try {
                    await unlinkFarcaster();
                    Alert.alert("Unlinked", "Farcaster account removed from this profile.");
                  } catch (e: unknown) {
                    Alert.alert("Farcaster", e instanceof Error ? e.message : "Could not unlink");
                  }
                }}
                style={styles.unlinkBtn}
                testID="unlink-farcaster"
              >
                <Text style={styles.unlinkBtnText}>Unlink</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={styles.farcasterHint}>
                Connect your Farcaster identity so other builders can recognize you in the village.
              </Text>
              {inMiniApp && miniAppFid ? (
                <Text style={styles.miniAppHint}>
                  Warpcast sees you as FID {miniAppFid}. Connect below to save it to this account.
                </Text>
              ) : null}
              <ConnectFarcasterButton />
            </>
          )}
        </View>

        {/* Bio */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>About</Text>
            <Pressable onPress={() => (editing ? saveProfile() : setEditing(true))} testID={editing ? "save-bio" : "edit-bio"}>
              <Text style={styles.linkText}>{editing ? "Save" : "Edit"}</Text>
            </Pressable>
          </View>
          {editing ? (
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="What are you rebuilding?"
              placeholderTextColor={colors.textMuted}
              style={styles.bioInput}
              multiline
            />
          ) : (
            <Text style={styles.bio}>{user.bio || "Tap edit to introduce yourself to the village."}</Text>
          )}
          {savedAnim && <Text style={styles.savedHint}>Saved · {user.profile_completed ? "+100 XP for completing profile" : "Add an avatar & bio to earn +100 XP"}</Text>}
        </View>

        {/* Badges */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Founding Badges</Text>
          <View style={styles.badgeGrid}>
            {Object.entries(BADGE_META).map(([slug, b]) => {
              const has = earned.has(slug);
              return (
                <View key={slug} style={[styles.badge, !has && { opacity: 0.25 }]} testID={`badge-${slug}`}>
                  <LinearGradient colors={[b.color + "55", "transparent"]} style={StyleSheet.absoluteFillObject} />
                  <View style={[styles.badgeInner, { borderColor: b.color + (has ? "AA" : "33") }]}>
                    <Ionicons name={has ? "shield-checkmark" : "lock-closed"} size={22} color={b.color} />
                  </View>
                  <Text style={[styles.badgeName, { color: has ? b.color : colors.textMuted }]}>{b.name}</Text>
                  <Text style={styles.badgeLvl}>LVL {b.level}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Referral */}
        <View style={[styles.card, styles.referralCard]}>
          <LinearGradient colors={["rgba(255,215,0,0.15)", "rgba(80,200,120,0.08)"]} style={StyleSheet.absoluteFillObject} />
          <Text style={styles.referralEyebrow}>YOUR REFERRAL CODE</Text>
          <Text style={styles.referralCode} testID="referral-code">{user.referral_code}</Text>
          <Text style={styles.referralSub}>Bring a friend. You earn 500 XP. They register → you earn 1000 XP more.</Text>
          <View style={styles.referralRow}>
            <Pressable onPress={copy} style={styles.smallBtn} testID="copy-referral">
              <Ionicons name="copy" size={14} color={colors.textPrimary} />
              <Text style={styles.smallBtnText}>Copy</Text>
            </Pressable>
            <Pressable onPress={() => share("x")} style={styles.smallBtn} testID="share-x">
              <Ionicons name="logo-twitter" size={14} color={colors.textPrimary} />
              <Text style={styles.smallBtnText}>Share on X (+150)</Text>
            </Pressable>
            <Pressable onPress={() => share("farcaster")} style={styles.smallBtn} testID="share-farcaster">
              <Ionicons name="chatbubbles" size={14} color={colors.textPrimary} />
              <Text style={styles.smallBtnText}>Farcaster (+150)</Text>
            </Pressable>
          </View>
        </View>

        <Pressable onPress={() => router.push("/mayor")} style={styles.bigBtn} testID="profile-open-mayor">
          <Ionicons name="chatbubbles" size={18} color={colors.gold} />
          <Text style={styles.bigBtnText}>Talk to Mayor Culture</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/feed")} style={styles.bigBtn} testID="profile-open-feed">
          <Ionicons name="pulse" size={18} color={colors.emerald} />
          <Text style={styles.bigBtnText}>Live Community Feed</Text>
        </Pressable>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ icon, color, value, label }: { icon: any; color: string; value: string; label: string }) {
  return (
    <View style={styles.statCell}>
      <Ionicons name={icon} size={14} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 140 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.gold, alignItems: "center", justifyContent: "center", ...shadows.gold },
  avatarText: { color: "#000", fontSize: 28, fontWeight: "900" },
  username: { color: colors.textPrimary, fontSize: 24, fontWeight: "800" },
  email: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  levelChip: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", marginTop: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: "rgba(255,215,0,0.12)", borderWidth: 1, borderColor: colors.gold + "44" },
  levelChipText: { color: colors.gold, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  fidChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: "rgba(80,200,120,0.12)",
    borderWidth: 1,
    borderColor: colors.emerald + "44",
  },
  fidChipText: { color: colors.emerald, fontSize: 10, fontWeight: "700" },
  signoutBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  farcasterLinked: { gap: spacing.sm },
  farcasterLinkedText: { color: colors.textSecondary, fontSize: 13 },
  farcasterHint: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  miniAppHint: { color: colors.emerald, fontSize: 12, lineHeight: 17 },
  unlinkBtn: { alignSelf: "flex-start", paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  unlinkBtnText: { color: colors.textSecondary, fontWeight: "700", fontSize: 12 },
  statGrid: { flexDirection: "row", gap: spacing.sm },
  statCell: { flex: 1, padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: "rgba(255,255,255,0.03)", alignItems: "center", gap: 4 },
  statValue: { fontWeight: "800", fontSize: 16 },
  statLabel: { color: colors.textMuted, fontSize: 10, letterSpacing: 1 },
  card: { padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: "rgba(255,255,255,0.03)", gap: spacing.sm, overflow: "hidden" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { color: colors.textPrimary, fontWeight: "800", fontSize: 15 },
  linkText: { color: colors.gold, fontWeight: "700", fontSize: 13 },
  bio: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  bioInput: { color: colors.textPrimary, fontSize: 14, minHeight: 80, padding: spacing.sm, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: radius.md, textAlignVertical: "top" },
  savedHint: { color: colors.emerald, fontSize: 12 },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  badge: { width: 96, alignItems: "center", padding: spacing.sm, borderRadius: radius.lg, overflow: "hidden" },
  badgeInner: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", borderWidth: 2, backgroundColor: "rgba(0,0,0,0.3)" },
  badgeName: { fontWeight: "800", fontSize: 12, marginTop: 6 },
  badgeLvl: { color: colors.textMuted, fontSize: 9, letterSpacing: 1 },
  referralCard: { padding: spacing.lg },
  referralEyebrow: { color: colors.gold, fontSize: 10, letterSpacing: 2, fontWeight: "800" },
  referralCode: { color: colors.textPrimary, fontSize: 32, fontWeight: "900", letterSpacing: 4, marginTop: 4 },
  referralSub: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  referralRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.sm },
  smallBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: "rgba(0,0,0,0.4)" },
  smallBtnText: { color: colors.textPrimary, fontWeight: "700", fontSize: 12 },
  bigBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: "rgba(255,255,255,0.03)" },
  bigBtnText: { color: colors.textPrimary, fontWeight: "700" },
});
