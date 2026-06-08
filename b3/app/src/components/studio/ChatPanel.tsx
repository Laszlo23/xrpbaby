import { useState } from "react";
import { Send } from "lucide-react";

type Message = { id: string; role: string; content: string };

type Props = {
  messages: Message[];
  busy: boolean;
  onSend: (text: string) => void;
};

export function ChatPanel({ messages, busy, onSend }: Props) {
  const [input, setInput] = useState("");

  return (
    <div className="flex h-full flex-col border-r border-white/10 bg-[#0a0a0a]">
      <div className="border-b border-white/10 px-4 py-3">
        <p className="mono-label text-[10px]">CHAT</p>
        <p className="text-sm text-zinc-400">Describe what to build or change.</p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages
          .filter((m) => m.role !== "system")
          .map((m) => (
            <div
              key={m.id}
              className={
                m.role === "user"
                  ? "ml-6 rounded-2xl bg-[#00E5FF]/10 px-3 py-2 text-sm text-zinc-100"
                  : "mr-4 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-300"
              }
            >
              {m.content}
            </div>
          ))}
      </div>
      <form
        className="border-t border-white/10 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          const text = input.trim();
          if (!text || busy) return;
          onSend(text);
          setInput("");
        }}
      >
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Build a todo app with dark theme…"
            className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#00E5FF]/40"
            disabled={busy}
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00E5FF] text-black disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
