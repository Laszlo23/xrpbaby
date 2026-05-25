import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/src/contexts/AuthContext";
import { colors, radius, spacing } from "@/src/theme";

export default function Register() {
  const { signUp } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referral, setReferral] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async () => {
    setErr(null);
    setBusy(true);
    try {
      await signUp({ username: username.trim(), email: email.trim(), password, referral_code: referral.trim() || undefined });
      router.replace("/(tabs)");
    } catch (e: any) {
      setErr(e?.message ?? "Could not create account.");
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
            <Text style={styles.eyebrow}>JOIN THE REBUILD</Text>
            <Text style={styles.title}>Become a Founding Builder</Text>
            <Text style={styles.sub}>Claim your username before the launch. Every builder shapes the village.</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.form}>
            <Field label="Username" icon="person" value={username} onChange={setUsername} placeholder="founder.username" autoCapitalize="none" testID="register-username" />
            <Field label="Email" icon="mail" value={email} onChange={setEmail} placeholder="you@village.io" autoCapitalize="none" keyboardType="email-address" testID="register-email" />
            <Field label="Password" icon="lock-closed" value={password} onChange={setPassword} placeholder="At least 6 characters" secureTextEntry testID="register-password" />
            <Field label="Referral code (optional)" icon="gift" value={referral} onChange={setReferral} placeholder="Invite code" autoCapitalize="characters" testID="register-referral" />

            {err && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={colors.danger} />
                <Text style={styles.errorText}>{err}</Text>
              </View>
            )}

            <Pressable onPress={onSubmit} disabled={busy} style={({ pressed }) => [styles.submit, pressed && { transform: [{ scale: 0.98 }] }]} testID="register-submit">
              <LinearGradient colors={[colors.gold, colors.goldDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.submitGrad}>
                {busy ? <ActivityIndicator color="#000" /> : <Text style={styles.submitText}>Start Building</Text>}
              </LinearGradient>
            </Pressable>

            <Link href="/(auth)/login" asChild>
              <Pressable style={styles.swap} testID="goto-login">
                <Text style={styles.swapText}>
                  Already in the village? <Text style={{ color: colors.gold, fontWeight: "700" }}>Sign in</Text>
                </Text>
              </Pressable>
            </Link>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Field({
  label,
  icon,
  value,
  onChange,
  placeholder,
  secureTextEntry,
  autoCapitalize,
  keyboardType,
  testID,
}: {
  label: string;
  icon: any;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: any;
  testID?: string;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputRow}>
        <Ionicons name={icon} size={16} color={colors.textMuted} />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          style={styles.input}
          testID={testID}
        />
      </View>
    </View>
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
  fieldWrap: { gap: 6 },
  fieldLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  input: { flex: 1, paddingVertical: 14, color: colors.textPrimary, fontSize: 15 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "rgba(239,68,68,0.12)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
  },
  errorText: { color: colors.danger, fontSize: 13, flex: 1 },
  submit: { borderRadius: radius.pill, overflow: "hidden", marginTop: spacing.sm },
  submitGrad: { paddingVertical: 18, alignItems: "center", justifyContent: "center" },
  submitText: { color: "#000", fontWeight: "800", fontSize: 16 },
  swap: { alignItems: "center", paddingVertical: spacing.md },
  swapText: { color: colors.textSecondary },
});
