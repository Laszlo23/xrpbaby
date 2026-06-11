import { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Link } from "expo-router";
import { api } from "@ankommen/api-client";

export default function HomeScreen() {
  useEffect(() => {
    api.createGuest().catch(console.error);
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greeting}>Hello 👋</Text>
      <Text style={styles.sub}>Your AI guide for Austria</Text>
      {[
        { href: "/assistant", label: "AI Chat", emoji: "🤖" },
        { href: "/documents", label: "Scan Document", emoji: "📄" },
        { href: "/checklist", label: "My Checklist", emoji: "✅" },
      ].map((item) => (
        <Link key={item.href} href={item.href as any} asChild>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.cardLabel}>{item.label}</Text>
          </TouchableOpacity>
        </Link>
      ))}
      <Text style={styles.footer}>Powered by Building Culture</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fafbfc" },
  greeting: { fontSize: 28, fontWeight: "700", marginTop: 20 },
  sub: { color: "#666", marginBottom: 24 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 20, borderRadius: 16, marginBottom: 12, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  emoji: { fontSize: 24, marginRight: 16 },
  cardLabel: { fontSize: 18, fontWeight: "600" },
  footer: { textAlign: "center", color: "#999", marginTop: 32, fontSize: 12 },
});
