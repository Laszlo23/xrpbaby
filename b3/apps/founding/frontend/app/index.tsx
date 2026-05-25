import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect } from "react";
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/src/contexts/AuthContext";
import { useCountdown } from "@/src/hooks/useCountdown";
import { VILLAGE_IMAGES, colors, radius, shadows, spacing } from "@/src/theme";

const { width } = Dimensions.get("window");

function CountdownBlock({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.countdownBlock} testID={`countdown-${label.toLowerCase()}`}>
      <Text style={styles.countdownValue}>{String(value).padStart(2, "0")}</Text>
      <Text style={styles.countdownLabel}>{label}</Text>
    </View>
  );
}

export default function Index() {
  const { isLoading, user } = useAuth();
  const { days, hours, minutes, seconds, launched } = useCountdown();

  // Auto-redirect signed-in users to the dashboard
  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/(tabs)");
    }
  }, [isLoading, user]);

  // Pulse glow on CTA
  const glow = useSharedValue(0.6);
  useEffect(() => {
    glow.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [glow]);
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  if (isLoading) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container} testID="splash-hero">
      <Image source={{ uri: VILLAGE_IMAGES.abandoned }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
      <LinearGradient
        colors={["rgba(0,0,0,0.4)", "rgba(10,10,10,0.85)", "#0A0A0A"]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.delay(200).duration(700)} style={styles.brandRow}>
            <View style={styles.brandBadge}>
              <Ionicons name="diamond" size={14} color={colors.gold} />
              <Text style={styles.brandText}>$BCD · The Founding Builders</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(350).duration(800)}>
            <Text style={styles.eyebrow}>Building Culture Dollar Launch</Text>
            <Text style={styles.headline}>Help bring places{"\n"}back to life.</Text>
            <Text style={styles.subhead}>
              The community is rebuilding the future.{"\n"}Every action restores a street, a home, a café.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500).duration(800)}>
            <BlurView intensity={40} tint="dark" style={styles.countdownCard}>
              <View style={styles.countdownInner}>
                <View style={styles.countdownHeader}>
                  <View style={styles.liveDot} />
                  <Text style={styles.countdownTitle}>
                    {launched ? "WE HAVE LAUNCHED" : "LAUNCH COUNTDOWN"}
                  </Text>
                </View>
                <View style={styles.countdownRow}>
                  <CountdownBlock label="Days" value={days} />
                  <Text style={styles.colon}>:</Text>
                  <CountdownBlock label="Hours" value={hours} />
                  <Text style={styles.colon}>:</Text>
                  <CountdownBlock label="Mins" value={minutes} />
                  <Text style={styles.colon}>:</Text>
                  <CountdownBlock label="Secs" value={seconds} />
                </View>
                <Text style={styles.targetText}>May 30, 2026 · 12:00 UTC</Text>
              </View>
            </BlurView>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(700).duration(800)} style={styles.ctaWrap}>
            <Animated.View style={[styles.ctaGlow, glowStyle]} />
            <Pressable
              onPress={() => router.push("/(auth)/register")}
              style={({ pressed }) => [styles.ctaPrimary, pressed && { transform: [{ scale: 0.98 }] }]}
              testID="cta-start-building"
            >
              <LinearGradient colors={[colors.gold, colors.goldDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaGrad}>
                <Ionicons name="hammer" size={20} color="#000" />
                <Text style={styles.ctaPrimaryText}>Start Building</Text>
              </LinearGradient>
            </Pressable>
            <Pressable
              onPress={() => router.push("/leaderboard-public")}
              style={({ pressed }) => [styles.ctaSecondary, pressed && { opacity: 0.7 }]}
              testID="cta-view-leaderboard"
            >
              <Ionicons name="trophy-outline" size={18} color={colors.gold} />
              <Text style={styles.ctaSecondaryText}>View Leaderboard</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/(auth)/login")}
              style={({ pressed }) => [styles.signinLink, pressed && { opacity: 0.6 }]}
              testID="cta-sign-in"
            >
              <Text style={styles.signinText}>
                Already a builder? <Text style={{ color: colors.gold, fontWeight: "700" }}>Sign in</Text>
              </Text>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(900).duration(900)} style={styles.statsRow}>
            <Stat label="Builders" value="5,200+" icon="people" />
            <Stat label="Quests" value="48k" icon="flag" />
            <Stat label="Keys Found" value="1,180" icon="key" />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: any }) {
  return (
    <View style={styles.statBlock}>
      <Ionicons name={icon} size={14} color={colors.emerald} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.xl },
  brandRow: { alignItems: "flex-start" },
  brandBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: "rgba(255,215,0,0.08)",
  },
  brandText: { color: colors.gold, fontWeight: "700", fontSize: 12, letterSpacing: 1 },
  eyebrow: {
    color: colors.emerald,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  headline: {
    color: colors.textPrimary,
    fontSize: width < 380 ? 38 : 46,
    lineHeight: width < 380 ? 44 : 52,
    fontWeight: "800",
    letterSpacing: -1.2,
  },
  subhead: { color: colors.textSecondary, fontSize: 16, lineHeight: 24, marginTop: spacing.md },
  countdownCard: {
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  countdownInner: {
    padding: spacing.lg,
    backgroundColor: "rgba(10,10,10,0.55)",
    gap: spacing.md,
  },
  countdownHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.emerald },
  countdownTitle: { color: colors.textSecondary, letterSpacing: 2, fontSize: 11, fontWeight: "800" },
  countdownRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  countdownBlock: { alignItems: "center", minWidth: 60 },
  countdownValue: { color: colors.gold, fontSize: width < 380 ? 32 : 40, fontWeight: "800", letterSpacing: -1 },
  countdownLabel: { color: colors.textMuted, fontSize: 10, letterSpacing: 2, marginTop: 2, textTransform: "uppercase" },
  colon: { color: colors.textMuted, fontSize: 28, fontWeight: "700", marginTop: -10 },
  targetText: { color: colors.textMuted, fontSize: 11, textAlign: "center", letterSpacing: 1 },
  ctaWrap: { gap: spacing.md, position: "relative" },
  ctaGlow: {
    position: "absolute",
    top: -10,
    left: -10,
    right: -10,
    height: 80,
    backgroundColor: colors.gold,
    opacity: 0.18,
    borderRadius: radius.xl,
  },
  ctaPrimary: { borderRadius: radius.pill, overflow: "hidden", ...shadows.gold },
  ctaGrad: {
    paddingVertical: 18,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  ctaPrimaryText: { color: "#000", fontSize: 17, fontWeight: "800", letterSpacing: 0.3 },
  ctaSecondary: {
    paddingVertical: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: "rgba(255,255,255,0.04)",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  ctaSecondaryText: { color: colors.textPrimary, fontSize: 15, fontWeight: "700" },
  signinLink: { alignSelf: "center", paddingVertical: spacing.sm },
  signinText: { color: colors.textSecondary, fontSize: 13 },
  statsRow: { flexDirection: "row", justifyContent: "space-between", gap: spacing.md },
  statBlock: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    gap: 4,
  },
  statValue: { color: colors.textPrimary, fontWeight: "800", fontSize: 18 },
  statLabel: { color: colors.textMuted, fontSize: 11, letterSpacing: 1 },
});
