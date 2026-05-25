import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Alert, Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Easing, useSharedValue, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "@/src/api/client";
import { computeSpinDelta, SpinWheel } from "@/src/components/SpinWheel";
import { useAuth } from "@/src/contexts/AuthContext";
import { KEY_COLORS, VILLAGE_IMAGES, colors, radius, shadows, spacing } from "@/src/theme";

const { width } = Dimensions.get("window");
const WHEEL_SIZE = Math.min(width - 48, 320);

export default function Inventory() {
  const { user, setUser } = useAuth();
  const [spinStatus, setSpinStatus] = useState<{ can_spin: boolean; next_at: string | null }>({ can_spin: true, next_at: null });
  const [spinning, setSpinning] = useState(false);
  const [resultModal, setResultModal] = useState<{ label: string; icon: any; color: string } | null>(null);
  const [boxModal, setBoxModal] = useState<any | null>(null);
  const rotation = useSharedValue(0);

  const loadStatus = async () => {
    try { setSpinStatus(await api.spinStatus()); } catch {}
  };

  useEffect(() => { loadStatus(); }, []);

  const onSpin = async () => {
    if (!spinStatus.can_spin || spinning) return;
    setSpinning(true);
    try {
      const res = await api.spin();
      const idx = res.segment_index;
      const seg = res.segment;
      const delta = computeSpinDelta(idx, rotation.value);
      rotation.value = withTiming(rotation.value + delta, { duration: 3800, easing: Easing.out(Easing.cubic) });
      setTimeout(() => {
        setUser(res.user);
        setResultModal({
          label: seg.label,
          icon: seg.type === "key" ? "key" : seg.type === "mystery_box" ? "cube" : "sparkles",
          color: seg.type === "key" ? KEY_COLORS[seg.key ?? "builder"] : seg.type === "mystery_box" ? colors.gold : colors.emerald,
        });
        loadStatus();
        setSpinning(false);
      }, 4000);
    } catch (e: any) {
      Alert.alert("Spin", e.message);
      setSpinning(false);
    }
  };

  const onOpenBox = async () => {
    try {
      const res = await api.openMysteryBox();
      setUser(res.user);
      setBoxModal(res.reward);
    } catch (e: any) {
      Alert.alert("Mystery Box", e.message);
    }
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={styles.eyebrow}>VAULT</Text>
          <Text style={styles.title}>Your Inventory</Text>
        </View>

        {/* Keys */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>The Key Hunt</Text>
          <View style={styles.keyGrid}>
            {(["builder", "culture", "vision", "founder"] as const).map((k) => (
              <View key={k} style={[styles.keyCard, { borderColor: KEY_COLORS[k] + "66", shadowColor: KEY_COLORS[k] }]} testID={`vault-key-${k}`}>
                <LinearGradient colors={[KEY_COLORS[k] + "22", "transparent"]} style={StyleSheet.absoluteFillObject} />
                <Ionicons name="key" size={28} color={KEY_COLORS[k]} />
                <Text style={styles.keyCount}>{user.keys?.[k] ?? 0}</Text>
                <Text style={styles.keyName}>{k} Key</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Mystery Boxes */}
        <View style={styles.section}>
          <View style={styles.boxCard}>
            <Image source={{ uri: VILLAGE_IMAGES.mysteryBox }} style={styles.boxImage} contentFit="contain" />
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={styles.boxTitle}>Mystery Boxes</Text>
              <Text style={styles.boxSub}>{user.mystery_boxes} unopened</Text>
              <Text style={styles.boxDesc}>Open to find XP, keys, or rare cosmetics.</Text>
              <Pressable
                onPress={onOpenBox}
                disabled={user.mystery_boxes < 1}
                style={({ pressed }) => [styles.openBtn, user.mystery_boxes < 1 && { opacity: 0.4 }, pressed && { transform: [{ scale: 0.97 }] }]}
                testID="open-mystery-box"
              >
                <LinearGradient colors={[colors.gold, colors.goldDeep]} style={styles.openBtnGrad}>
                  <Text style={styles.openBtnText}>{user.mystery_boxes > 0 ? "Open a Box" : "No Boxes Yet"}</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Spin Wheel */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wheel of Fortune</Text>
          <Text style={styles.sectionSub}>One free spin every 24 hours.</Text>
          <View style={styles.wheelWrap}>
            <SpinWheel size={WHEEL_SIZE} rotation={rotation} />
          </View>
          <Pressable
            onPress={onSpin}
            disabled={!spinStatus.can_spin || spinning}
            style={({ pressed }) => [styles.spinBtn, (!spinStatus.can_spin || spinning) && { opacity: 0.5 }, pressed && { transform: [{ scale: 0.97 }] }]}
            testID="spin-button"
          >
            <LinearGradient colors={[colors.emerald, colors.emeraldDeep]} style={styles.spinBtnGrad}>
              <Ionicons name="sync" size={18} color="#000" />
              <Text style={styles.spinBtnText}>{spinning ? "Spinning..." : spinStatus.can_spin ? "Spin the Wheel" : "Come back tomorrow"}</Text>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={!!resultModal} transparent animationType="fade" onRequestClose={() => setResultModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { borderColor: (resultModal?.color ?? colors.gold) + "66" }]}>
            <Ionicons name={resultModal?.icon ?? "sparkles"} size={48} color={resultModal?.color ?? colors.gold} />
            <Text style={styles.modalTitle}>You won {resultModal?.label}!</Text>
            <Text style={styles.modalSub}>Keep building. The village remembers your effort.</Text>
            <Pressable onPress={() => setResultModal(null)} style={styles.modalBtn} testID="close-spin-result">
              <Text style={styles.modalBtnText}>Continue</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={!!boxModal} transparent animationType="fade" onRequestClose={() => setBoxModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { borderColor: colors.gold + "66" }]}>
            <Image source={{ uri: VILLAGE_IMAGES.mysteryBox }} style={{ width: 100, height: 100 }} contentFit="contain" />
            <Text style={styles.modalTitle}>
              {boxModal?.type === "key" && `You found a ${boxModal.key} Key!`}
              {boxModal?.type === "xp" && `+${boxModal.amount} XP`}
              {boxModal?.type === "boost" && (boxModal.name ?? "Special Boost")}
            </Text>
            <Text style={styles.modalSub}>{boxModal?.description ?? "Open more boxes for rarer rewards."}</Text>
            <Pressable onPress={() => setBoxModal(null)} style={styles.modalBtn} testID="close-box-result">
              <Text style={styles.modalBtnText}>Continue</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, gap: spacing.xl, paddingBottom: 120 },
  eyebrow: { color: colors.emerald, fontSize: 11, fontWeight: "800", letterSpacing: 2 },
  title: { color: colors.textPrimary, fontSize: 32, fontWeight: "800", marginTop: 4 },
  section: { gap: spacing.sm },
  sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: "800" },
  sectionSub: { color: colors.textMuted, fontSize: 12 },
  keyGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  keyCard: { width: (width - spacing.lg * 2 - spacing.sm) / 2, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, backgroundColor: "rgba(255,255,255,0.03)", gap: 4, ...shadows.surface },
  keyCount: { color: colors.textPrimary, fontWeight: "900", fontSize: 28 },
  keyName: { color: colors.textSecondary, fontSize: 12, textTransform: "capitalize", letterSpacing: 1 },
  boxCard: { flexDirection: "row", gap: spacing.md, padding: spacing.md, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.gold + "44", backgroundColor: "rgba(255,215,0,0.06)" },
  boxImage: { width: 92, height: 92 },
  boxTitle: { color: colors.textPrimary, fontWeight: "800", fontSize: 18 },
  boxSub: { color: colors.gold, fontWeight: "700", fontSize: 13 },
  boxDesc: { color: colors.textSecondary, fontSize: 12 },
  openBtn: { borderRadius: radius.pill, overflow: "hidden", alignSelf: "flex-start", marginTop: 6 },
  openBtnGrad: { paddingVertical: 10, paddingHorizontal: spacing.lg },
  openBtnText: { color: "#000", fontWeight: "800", fontSize: 13 },
  wheelWrap: { alignItems: "center", justifyContent: "center", paddingVertical: spacing.lg },
  spinBtn: { borderRadius: radius.pill, overflow: "hidden", ...shadows.emerald },
  spinBtnGrad: { paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  spinBtnText: { color: "#000", fontWeight: "800", fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", alignItems: "center", justifyContent: "center", padding: spacing.lg },
  modalCard: { backgroundColor: colors.surface, padding: spacing.xl, borderRadius: radius.xl, borderWidth: 1, alignItems: "center", gap: spacing.md, maxWidth: 360, width: "100%" },
  modalTitle: { color: colors.textPrimary, fontWeight: "800", fontSize: 20, textAlign: "center" },
  modalSub: { color: colors.textSecondary, fontSize: 13, textAlign: "center" },
  modalBtn: { paddingHorizontal: spacing.xl, paddingVertical: 12, backgroundColor: colors.gold, borderRadius: radius.pill, marginTop: spacing.sm },
  modalBtnText: { color: "#000", fontWeight: "800" },
});
