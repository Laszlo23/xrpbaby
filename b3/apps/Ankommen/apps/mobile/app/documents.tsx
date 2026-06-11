import { Text, View, StyleSheet } from "react-native";

export default function DocumentsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Document Scanner</Text>
      <Text style={styles.body}>Use camera to scan official letters. Requires expo-camera integration in production build.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "700" },
  body: { marginTop: 12, color: "#666", lineHeight: 22 },
});
