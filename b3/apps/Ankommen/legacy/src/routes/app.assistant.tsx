import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Paperclip, Mic, Camera, FileText, Sparkles, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/app/assistant")({
  component: Assistant,
});

type Msg = { role: "user" | "ai"; content: string; rich?: boolean };

const initial: Msg[] = [
  { role: "ai", content: "Hello Laszlo 👋 I'm your Ankommen AI assistant. You can ask anything, upload a letter, or take a photo. How can I help today?" },
];

function Assistant() {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [input, setInput] = useState("");

  const send = (text?: string) => {
    const val = (text ?? input).trim();
    if (!val) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: val }]);
    setTimeout(() => {
      setMessages((m) => [...m, {
        role: "ai", rich: true,
        content: "This looks like an AMS request for additional documents. You have 14 days to respond.",
      }]);
    }, 600);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-4xl flex-col">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground text-lg">🇦🇹</div>
        <div>
          <div className="font-semibold">Ankommen Assistant</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Online · 11 languages
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto rounded-3xl border bg-card p-6 shadow-soft">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "ai" && <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">🤖</div>}
            <div className={`max-w-[80%] rounded-3xl px-5 py-3 text-sm ${
              m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"
            }`}>
              {m.rich ? <RichResponse text={m.content} /> : <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>}
            </div>
            {m.role === "user" && <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground font-semibold">L</div>}
          </div>
        ))}
      </div>

      {/* Suggestions */}
      <div className="mt-3 flex flex-wrap gap-2">
        {["I just arrived", "I got a letter from AMS", "Find German course near me", "Help me with Meldezettel"].map((s) => (
          <button key={s} onClick={() => send(s)} className="rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-primary">
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="mt-3 rounded-3xl border bg-card p-3 shadow-soft">
        <div className="flex items-end gap-2">
          <div className="flex gap-1">
            <IconBtn><Paperclip className="h-4 w-4" /></IconBtn>
            <IconBtn><Camera className="h-4 w-4" /></IconBtn>
            <IconBtn><Mic className="h-4 w-4" /></IconBtn>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={1}
            placeholder="Type your question, paste text or upload a letter…"
            className="flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm outline-none"
          />
          <button onClick={() => send()} className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
            <Send className="h-4 w-4" /> Send
          </button>
        </div>
      </div>
    </div>
  );
}

function IconBtn({ children }: { children: React.ReactNode }) {
  return <button className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:bg-secondary">{children}</button>;
}

function RichResponse({ text }: { text: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-success">
        <Sparkles className="h-3.5 w-3.5" /> Letter analyzed
      </div>
      <p className="font-medium">✅ {text}</p>
      <div className="rounded-2xl bg-card p-3">
        <div className="text-xs font-semibold text-muted-foreground">Required:</div>
        <ul className="mt-2 space-y-1.5 text-sm">
          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Passport copy</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Residence permit</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Proof of address</li>
        </ul>
      </div>
      <div className="flex flex-wrap gap-2">
        {["Generate Letter", "Translate", "Find Office", "Set Reminder"].map((b) => (
          <button key={b} className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90">{b}</button>
        ))}
      </div>
    </div>
  );
}
