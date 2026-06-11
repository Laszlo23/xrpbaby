import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerStyle: { backgroundColor: "#c8102e" }, headerTintColor: "#fff", headerTitle: "Ankommen AI" }}>
        <Stack.Screen name="index" options={{ title: "Dashboard" }} />
        <Stack.Screen name="assistant" options={{ title: "AI Assistant" }} />
        <Stack.Screen name="documents" options={{ title: "Documents" }} />
        <Stack.Screen name="checklist" options={{ title: "My Checklist" }} />
      </Stack>
    </>
  );
}
