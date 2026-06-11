"use client";

import { useState, useEffect } from "react";
import { Send, Paperclip, Mic, Camera, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { api } from "@ankommen/api-client";

type Msg = { role: "user" | "assistant"; content: string; citations?: unknown[] };

export default function AssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hello 👋 I'm your Ankommen AI assistant. Ask anything about life in Austria, upload a letter, or take a photo. How can I help today?" },
  ]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.createConversation({ agentType: "AUSTRIA_GUIDE", language: "en" }).then((c) => setConversationId(c.id)).catch(console.error);
  }, []);

  const send = async (text?: string) => {
    const val = (text ?? input).trim();
    if (!val || !conversationId || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: val }]);
    setLoading(true);
    try {
      const res = await api.sendMessage(conversationId, val);
      setMessages((m) => [...m, { role: "assistant", content: res.message.content, citations: res.message.citations }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: `Sorry, something went wrong. ${e instanceof Error ? e.message : ""}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-4xl flex-col">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground text-lg">🇦🇹</div>
        <div>
          <div className="font-semibold">Ankommen Assistant</div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Online · 14 languages
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto rounded-3xl border bg-card p-6 shadow-soft">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "assistant" && <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">🤖</div>}
            <div className={`max-w-[80%] rounded-3xl px-5 py-3 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
              <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
              {m.citations && (m.citations as unknown[]).length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <Sparkles className="mr-1 inline h-3 w-3" /> Sources cited in response
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {["I just arrived", "I got a letter from AMS", "Find German course near me", "Help me with Meldezettel"].map((s) => (
          <button key={s} onClick={() => send(s)} className="rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-primary">{s}</button>
        ))}
      </div>

      <div className="mt-3 rounded-3xl border bg-card p-3 shadow-soft">
        <div className="flex items-end gap-2">
          <div className="flex gap-1">
            <IconBtn><Paperclip className="h-4 w-4" /></IconBtn>
            <IconBtn><Camera className="h-4 w-4" /></IconBtn>
            <IconBtn><Mic className="h-4 w-4" /></IconBtn>
          </div>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} rows={1} placeholder="Type your question…" className="flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm outline-none" />
          <button onClick={() => send()} disabled={loading} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            <Send className="h-4 w-4" /> Send
          </button>
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">Not legal, financial, or medical advice. Always confirm with official offices.</p>
    </div>
  );
}

function IconBtn({ children }: { children: React.ReactNode }) {
  return <button className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:bg-secondary">{children}</button>;
}
