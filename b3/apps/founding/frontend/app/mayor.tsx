import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "@/src/api/client";
import { useAuth } from "@/src/contexts/AuthContext";
import { VILLAGE_IMAGES, colors, radius, shadows, spacing } from "@/src/theme";

type Msg = { id: string; role: "user" | "mayor"; text: string };

export default function MayorChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<Msg>>(null);

  useEffect(() => {
    (async () => {
      try {
        const history = await api.mayorHistory();
        if (history.length === 0) {
          setMessages([
            {
              id: "intro",
              role: "mayor",
              text: `Welcome back, ${user?.username ?? "builder"}. The village is waiting. What shall we build today?`,
            },
          ]);
        } else {
          setMessages(history.map((m) => ({ id: m.id, role: m.role, text: m.text })));
        }
      } catch {
        setMessages([{ id: "intro", role: "mayor", text: "Welcome, builder. Tell me what you'd like to work on today." }]);
      }
    })();
  }, [user]);

  const send = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    const tmpId = `u-${Date.now()}`;
    setMessages((m) => [...m, { id: tmpId, role: "user", text }]);
    setSending(true);
    try {
      const res = await api.mayorChat(text);
      setMessages((m) => [...m, { id: `m-${Date.now()}`, role: "mayor", text: res.reply }]);
    } catch (e: any) {
      setMessages((m) => [...m, { id: `err-${Date.now()}`, role: "mayor", text: "The Mayor is briefly away. Try again in a moment." }]);
    } finally {
      setSending(false);
      setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 80);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back} testID="mayor-back">
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Image source={{ uri: VILLAGE_IMAGES.mayor }} style={styles.headerAvatar} contentFit="cover" />
          <View>
            <Text style={styles.headerName}>Mayor Culture</Text>
            <View style={styles.live}><View style={styles.liveDot} /><Text style={styles.liveText}>AI · always listening</Text></View>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
          renderItem={({ item }) => (
            <Animated.View entering={FadeInUp.duration(300)}>
              <View style={[styles.bubble, item.role === "mayor" ? styles.bubbleMayor : styles.bubbleUser]}>
                {item.role === "mayor" && (
                  <LinearGradient colors={["rgba(137,207,240,0.15)", "transparent"]} style={StyleSheet.absoluteFillObject} />
                )}
                <Text style={[styles.bubbleText, item.role === "user" && { color: "#000" }]}>{item.text}</Text>
              </View>
            </Animated.View>
          )}
          onContentSizeChange={() => listRef.current?.scrollToEnd?.({ animated: true })}
        />

        <View style={styles.composer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask the Mayor for a mission..."
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            multiline
            testID="mayor-input"
          />
          <Pressable onPress={send} disabled={sending || !input.trim()} style={[styles.sendBtn, (!input.trim() || sending) && { opacity: 0.4 }]} testID="mayor-send">
            {sending ? <ActivityIndicator color="#000" /> : <Ionicons name="send" size={18} color="#000" />}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", padding: spacing.md, gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  back: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: colors.blue },
  headerName: { color: colors.textPrimary, fontWeight: "800", fontSize: 15 },
  live: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.emerald },
  liveText: { color: colors.textMuted, fontSize: 11 },
  bubble: { padding: spacing.md, borderRadius: radius.lg, maxWidth: "85%", overflow: "hidden" },
  bubbleMayor: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.blue + "44", alignSelf: "flex-start", borderBottomLeftRadius: 4 },
  bubbleUser: { backgroundColor: colors.gold, alignSelf: "flex-end", borderBottomRightRadius: 4, ...shadows.gold },
  bubbleText: { color: colors.textPrimary, fontSize: 14, lineHeight: 20 },
  composer: { flexDirection: "row", alignItems: "flex-end", gap: spacing.sm, padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg },
  input: { flex: 1, color: colors.textPrimary, fontSize: 14, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: "rgba(255,255,255,0.04)", maxHeight: 120 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.gold, alignItems: "center", justifyContent: "center", ...shadows.gold },
});
