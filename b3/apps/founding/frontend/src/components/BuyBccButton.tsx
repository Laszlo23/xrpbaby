import {
  BCC_ADDRESS,
  BCC_DISCOUNT_LABEL,
  BCC_SYMBOL,
  BCC_UNISWAP_URL,
} from "@bc/bcc-kit";
import { Linking, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { colors } from "@/src/theme";

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/** Floating Buy BCC button + modal for Expo / React Native. */
export function BuyBccButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable style={styles.fab} onPress={() => setOpen(true)} accessibilityRole="button">
        <Text style={styles.fabText}>Buy {BCC_SYMBOL}</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.kicker}>Building Culture</Text>
            <Text style={styles.title}>Get {BCC_SYMBOL}</Text>
            <Text style={styles.body}>
              {BCC_SYMBOL} is our market token on Base, currently in fair launch. Pay with {BCC_SYMBOL}{" "}
              for {BCC_DISCOUNT_LABEL} on identity mints, art tickets, and Places.
            </Text>
            <Pressable
              style={styles.cta}
              onPress={() => void Linking.openURL(BCC_UNISWAP_URL)}
            >
              <Text style={styles.ctaText}>Buy {BCC_SYMBOL} on Uniswap →</Text>
            </Pressable>
            <View style={styles.footer}>
              <Text style={styles.footerText}>Base · {BCC_SYMBOL}</Text>
              <Text style={styles.footerMono}>{shortAddress(BCC_ADDRESS)}</Text>
            </View>
            <Pressable style={styles.close} onPress={() => setOpen(false)}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 16,
    bottom: 24,
    zIndex: 100,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.accent ?? "#C5FF41",
  },
  fabText: { fontWeight: "700", fontSize: 13, color: "#0a0a0a" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.78)",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(197,255,65,0.35)",
    backgroundColor: colors.bg ?? "#12151c",
    padding: 24,
  },
  kicker: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#C5FF41",
  },
  title: { marginTop: 8, fontSize: 24, fontWeight: "800", color: "#fff" },
  body: { marginTop: 8, fontSize: 14, lineHeight: 20, color: "#a1a1aa" },
  cta: {
    marginTop: 20,
    borderRadius: 999,
    paddingVertical: 14,
    backgroundColor: "#C5FF41",
    alignItems: "center",
  },
  ctaText: { fontWeight: "700", fontSize: 14, color: "#0a0a0a" },
  footer: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: { fontSize: 12, color: "#71717a" },
  footerMono: { fontSize: 11, color: "#d4d4d8", fontFamily: "monospace" },
  close: { marginTop: 16, alignSelf: "center" },
  closeText: { color: "#71717a", fontSize: 13 },
});
