import { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, ScrollView, StyleSheet } from "react-native";
import { api } from "@ankommen/api-client";

export default function AssistantScreen() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>(["Hello! How can I help you in Austria?"]);
  const [convId, setConvId] = useState<string | null>(null);

  const send = async () => {
    if (!input.trim()) return;
    const text = input;
    setInput("");
    setMessages((m) => [...m, `You: ${text}`]);
    try {
      let id = convId;
      if (!id) {
        const c = await api.createConversation() as { id: string };
        id = c.id;
        setConvId(id);
      }
      const res = await api.sendMessage(id!, text) as { message: { content: string } };
      setMessages((m) => [...m, res.message.content]);
    } catch (e) {
      setMessages((m) => [...m, "Error sending message"]);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.chat}>
        {messages.map((m, i) => (
          <Text key={i} style={styles.msg}>{m}</Text>
        ))}
      </ScrollView>
      <View style={styles.inputRow}>
        <TextInput value={input} onChangeText={setInput} placeholder="Ask anything…" style={styles.input} />
        <TouchableOpacity onPress={send} style={styles.sendBtn}><Text style={styles.sendText}>Send</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  chat: { flex: 1 },
  msg: { marginBottom: 12, lineHeight: 22 },
  inputRow: { flexDirection: "row", gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 12, padding: 12 },
  sendBtn: { backgroundColor: "#c8102e", borderRadius: 12, paddingHorizontal: 16, justifyContent: "center" },
  sendText: { color: "#fff", fontWeight: "600" },
});
