import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/src/contexts/AuthContext";
import { colors, radius, spacing } from "@/src/theme";
import { Field } from "./register";

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async () => {
    setErr(null);
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/(tabs)");
    } catch (e: any) {
      setErr(e?.message ?? "Could not sign in.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} style={styles.back} testID="back-btn">
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </Pressable>

          <Animated.View entering={FadeInDown.duration(500)}>
            <Text style={styles.eyebrow}>WELCOME BACK</Text>
            <Text style={styles.title}>Sign in, builder.</Text>
            <Text style={styles.sub}>The village remembers you. Continue your work.</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.form}>
            <Field label="Email" icon="mail" value={email} onChange={setEmail} placeholder="you@village.io" autoCapitalize="none" keyboardType="email-address" testID="login-email" />
            <Field label="Password" icon="lock-closed" value={password} onChange={setPassword} placeholder="••••••••" secureTextEntry testID="login-password" />

            {err && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={colors.danger} />
                <Text style={styles.errorText}>{err}</Text>
              </View>
            )}

            <Pressable onPress={onSubmit} disabled={busy} style={({ pressed }) => [styles.submit, pressed && { transform: [{ scale: 0.98 }] }]} testID="login-submit">
              <LinearGradient colors={[colors.gold, colors.goldDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.submitGrad}>
                {busy ? <ActivityIndicator color="#000" /> : <Text style={styles.submitText}>Sign In</Text>}
              </LinearGradient>
            </Pressable>

            <Link href="/(auth)/register" asChild>
              <Pressable style={styles.swap} testID="goto-register">
                <Text style={styles.swapText}>
                  New to the village? <Text style={{ color: colors.gold, fontWeight: "700" }}>Become a Founding Builder</Text>
                </Text>
              </Pressable>
            </Link>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, gap: spacing.lg },
  back: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  eyebrow: { color: colors.emerald, fontSize: 11, fontWeight: "800", letterSpacing: 2 },
  title: { color: colors.textPrimary, fontSize: 32, fontWeight: "800", marginTop: spacing.xs, letterSpacing: -0.5 },
  sub: { color: colors.textSecondary, marginTop: spacing.sm, fontSize: 15, lineHeight: 22 },
  form: { gap: spacing.md },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: spacing.md, borderRadius: radius.md, backgroundColor: "rgba(239,68,68,0.12)", borderWidth: 1, borderColor: "rgba(239,68,68,0.3)" },
  errorText: { color: colors.danger, fontSize: 13, flex: 1 },
  submit: { borderRadius: radius.pill, overflow: "hidden", marginTop: spacing.sm },
  submitGrad: { paddingVertical: 18, alignItems: "center", justifyContent: "center" },
  submitText: { color: "#000", fontWeight: "800", fontSize: 16 },
  swap: { alignItems: "center", paddingVertical: spacing.md },
  swapText: { color: colors.textSecondary },
});
