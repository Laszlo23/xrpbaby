import { Text, View, StyleSheet } from "react-native";

const items = [
  "Register address (Meldezettel)",
  "Get health insurance (e-card)",
  "Open bank account",
  "Register with AMS (if job seeking)",
];

export default function ChecklistScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Checklist</Text>
      {items.map((item) => (
        <View key={item} style={styles.item}>
          <Text>☐ {item}</Text>
        </View>
      ))}
      <Text style={styles.note}>Synced when online. Offline mode uses local storage.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  item: { padding: 16, backgroundColor: "#fff", borderRadius: 12, marginBottom: 8 },
  note: { marginTop: 24, color: "#999", fontSize: 12 },
});
