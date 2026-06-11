import { useEffect, useState } from "react";
import { api } from "@ankommen/api-client";

export default function App() {
  const [question, setQuestion] = useState("How do I register in Vienna?");
  const [card, setCard] = useState<{ title: string; body: string } | null>(null);
  const [referral, setReferral] = useState("");

  useEffect(() => {
    api.createGuest().catch(console.error);
    fetch(`${import.meta.env.VITE_API_URL ?? "http://localhost:3001"}/referrals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform: "farcaster" }),
    })
      .then((r) => r.json())
      .then((d) => setReferral(d.code))
      .catch(() => {});
  }, []);

  const ask = async () => {
    const conv = await api.createConversation() as { id: string };
    const res = await api.sendMessage(conv.id, question) as { message: { content: string } };
    setCard({ title: "Ask Austria AI", body: res.message.content.slice(0, 280) });
  };

  const share = () => {
    if (navigator.share) {
      navigator.share({ title: "Ankommen AI", text: card?.body, url: `https://ankommen.ai?ref=${referral}` });
    }
  };

  return (
    <div style={{ fontFamily: "system-ui", padding: 20, maxWidth: 420, margin: "0 auto", minHeight: "100vh", background: "linear-gradient(135deg, #f8f9fc, #fff5f5)" }}>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>🇦🇹 Ask Austria AI</h1>
      <p style={{ color: "#666", fontSize: 14, marginBottom: 20 }}>Public demo · Building Culture ecosystem</p>
      <input value={question} onChange={(e) => setQuestion(e.target.value)} style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #ddd", marginBottom: 8 }} />
      <button onClick={ask} style={{ width: "100%", padding: 14, borderRadius: 12, background: "#1a2744", color: "#fff", border: "none", fontWeight: 600, marginBottom: 16 }}>Get Help Card</button>
      {card && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <strong>{card.title}</strong>
          <p style={{ marginTop: 12, fontSize: 14, lineHeight: 1.5 }}>{card.body}</p>
          <button onClick={share} style={{ marginTop: 12, padding: "8px 16px", borderRadius: 999, background: "#c8102e", color: "#fff", border: "none" }}>Share card</button>
        </div>
      )}
      {referral && <p style={{ marginTop: 24, fontSize: 12, color: "#888" }}>Referral: {referral}</p>}
      <a href="https://buildingculture.org" style={{ display: "block", marginTop: 16, fontSize: 12, color: "#c8102e" }}>buildingculture.org</a>
    </div>
  );
}
