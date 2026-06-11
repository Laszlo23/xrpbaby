import { useEffect, useState } from "react";
import { api } from "@ankommen/api-client";

declare global {
  interface Window {
    Telegram?: { WebApp: { ready: () => void; expand: () => void; themeParams: Record<string, string> } };
  }
}

export default function App() {
  const [input, setInput] = useState("");
  const [reply, setReply] = useState("");
  const [lang, setLang] = useState("en");

  useEffect(() => {
    window.Telegram?.WebApp.ready();
    window.Telegram?.WebApp.expand();
    api.createGuest().catch(console.error);
  }, []);

  const ask = async () => {
    const conv = await api.createConversation({ language: lang }) as { id: string };
    const res = await api.sendMessage(conv.id, input) as { message: { content: string } };
    setReply(res.message.content);
  };

  return (
    <div style={{ fontFamily: "system-ui", padding: 16, maxWidth: 480, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 24 }}>🇦🇹</span>
        <strong>Ankommen AI</strong>
      </div>
      <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ marginBottom: 12, padding: 8, borderRadius: 8, width: "100%" }}>
        {["en", "de", "ar", "tr", "uk"].map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
      </select>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        {["Housing", "Benefits", "Documents", "Translate"].map((c) => (
          <button key={c} style={{ padding: 12, borderRadius: 12, border: "1px solid #ddd", background: "#fff" }}>{c}</button>
        ))}
      </div>
      <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about Austria…" rows={3} style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #ddd" }} />
      <button onClick={ask} style={{ marginTop: 8, width: "100%", padding: 14, borderRadius: 12, background: "#c8102e", color: "#fff", border: "none", fontWeight: 600 }}>Ask AI</button>
      {reply && <div style={{ marginTop: 16, padding: 16, background: "#f5f5f5", borderRadius: 12, whiteSpace: "pre-wrap", fontSize: 14 }}>{reply}</div>}
      <p style={{ marginTop: 24, fontSize: 11, color: "#888", textAlign: "center" }}>Powered by Building Culture</p>
      <a href="https://ankommen.ai/app/settings" style={{ display: "block", textAlign: "center", marginTop: 8, fontSize: 12 }}>Upgrade to Premium</a>
    </div>
  );
}
