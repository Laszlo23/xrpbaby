import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

const AGENT_KINDS = [
  { id: "research", label: "Research", hint: "Ecosystem & competitor insights" },
  { id: "grant", label: "Grant", hint: "Grant-ready proof drafts" },
  { id: "grove", label: "Grove", hint: "Social & brand voice" },
  { id: "trading", label: "Trading", hint: "Quotes & analysis (not financial advice)" },
] as const;

type AgentKind = (typeof AGENT_KINDS)[number]["id"];

type Props = {
  walletAddress: string;
  onSent?: () => void;
};

export function AgentInboxCompose({ walletAddress, onSent }: Props) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [agentKind, setAgentKind] = useState<AgentKind>("research");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/agents/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          subject: subject.trim() || "Agent request",
          agentKind,
          body: body.trim(),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; draft?: string };
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Could not send to agent");
        return;
      }
      toast.success("Draft ready — review in your threads");
      setBody("");
      setSubject("");
      onSent?.();
    } catch {
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-5"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
        Write like an email — agents draft, you approve
      </p>
      <select
        value={agentKind}
        onChange={(e) => setAgentKind(e.target.value as AgentKind)}
        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
      >
        {AGENT_KINDS.map((k) => (
          <option key={k.id} value={k.id}>
            {k.label} — {k.hint}
          </option>
        ))}
      </select>
      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Subject"
        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Tell your agent what you need…"
        rows={5}
        className="w-full resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600"
      />
      <button
        type="submit"
        disabled={busy || !body.trim()}
        className="inline-flex items-center gap-2 rounded-full bg-[#C5FF41] px-6 py-3 text-sm font-semibold text-black disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        {busy ? "Drafting…" : "Send to agent"}
      </button>
      <p className="text-xs text-zinc-600">
        Agents provide analysis and drafts only — not financial advice or guaranteed returns.
      </p>
    </form>
  );
}
