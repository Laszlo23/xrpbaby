import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ChevronDown, Loader2, MessageCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { postEliasChat, postEliasEnsureSession, postEliasLoadThread } from "@/lib/elias-fns";
import { eliasOrbEnabled } from "@/lib/elias-feature";
import { ELIAS_ORB_QUICK_PROMPTS } from "@/lib/elias-orb-prompts";
import { dailyCultureChallenge } from "@/lib/daily-culture-challenge";
import { tryCompleteDailyCultureChallenge } from "@/lib/playerProgress";
import { useAccount } from "wagmi";
import { cn } from "@/lib/utils";

const ORB_SESSION_KEY = "bc_elias_orb_session_v1";
const ORB_THREAD_KEY = "bc_elias_orb_thread_id_v1";
const ORB_OPEN_EVENT = "bc_elias_orb_open";

function chatFailureHint(reason?: string): string {
  switch (reason) {
    case "elias_rate_limited_local":
      return "Too fast — wait a second and try again.";
    case "supabase_env_missing":
      return "Supabase env is missing on the server. Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in frontend/.env and restart npm run dev.";
    case "supabase_schema_or_key":
      return "Supabase is set but Elias tables aren’t reachable. Make sure you ran frontend/scripts/apply-elias-supabase-all.sql in your Supabase project, and that SUPABASE_SERVICE_ROLE_KEY is the service_role key (not anon). Then restart npm run dev.";
    case "supabase_unconfigured":
    case "supabase_or_unknown_session":
      return "Server needs Supabase: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in frontend/.env, restart dev server (see docs/SUPABASE_ELIAS_SETUP.md).";
    default:
      return reason ?? "Try again or check server logs.";
  }
}

export function EliasOrb() {
  const { address } = useAccount();
  const enabled = eliasOrbEnabled();
  const [shellOpen, setShellOpen] = useState(false);
  const [sessionKey, setSessionKey] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [sessionOk, setSessionOk] = useState<boolean | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const ensureSession = useServerFn(postEliasEnsureSession);
  const sendChat = useServerFn(postEliasChat);
  const loadThread = useServerFn(postEliasLoadThread);

  useEffect(() => {
    let k = localStorage.getItem(ORB_SESSION_KEY);
    if (!k) {
      k = crypto.randomUUID();
      localStorage.setItem(ORB_SESSION_KEY, k);
    }
    setSessionKey(k);
    const tid = localStorage.getItem(ORB_THREAD_KEY);
    if (tid) setThreadId(tid);
  }, []);

  const hydrate = useCallback(async () => {
    if (!sessionKey) return;
    const ensured = await ensureSession({ data: { sessionKey } });
    setSessionOk(ensured.ok === true);
    if (!ensured.ok) return;
    const tid = localStorage.getItem(ORB_THREAD_KEY);
    if (!tid) return;
    const r = await loadThread({ data: { sessionKey, threadId: tid } });
    if (!r.ok) return;
    setMessages(r.messages ?? []);
  }, [sessionKey, ensureSession, loadThread]);

  useEffect(() => {
    function onOpen() {
      setShellOpen(true);
    }
    window.addEventListener(ORB_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(ORB_OPEN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!shellOpen || !sessionKey) return;
    setSessionOk(null);
    void hydrate();
  }, [shellOpen, sessionKey, hydrate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (userMsg: string) => {
      const trimmed = userMsg.trim();
      if (!sessionKey || !trimmed) return;
      if (sessionOk === false) {
        toast.error(chatFailureHint("supabase_unconfigured"));
        return;
      }
      setLoading(true);
      setMessages((m) => [...m, { role: "user", content: trimmed }]);
      try {
        const r = await sendChat({
          data: {
            sessionKey,
            threadId: threadId ?? undefined,
            message: trimmed,
            mode: "ecosystem_guide",
          },
        });
        if (!r.ok || !r.threadId) {
          const hint = chatFailureHint(r.reason);
          toast.error(hint);
          // Keep the user message; show the error as assistant text so the UI doesn't look frozen.
          setMessages((m) => [...m, { role: "assistant", content: `**Elias** — ${hint}` }]);
          if (r.reason === "supabase_or_unknown_session" || r.reason === "supabase_unconfigured") {
            setSessionOk(false);
          }
          return;
        }
        setSessionOk(true);
        setThreadId(r.threadId);
        localStorage.setItem(ORB_THREAD_KEY, r.threadId);
        setMessages((m) => [
          ...m,
          { role: "assistant", content: r.assistantReply?.trim() ? r.assistantReply : "…" },
        ]);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Send failed");
        setMessages((m) => [
          ...m,
          { role: "assistant", content: "**Elias** — send failed. Please try again." },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [sessionKey, sessionOk, threadId, sendChat],
  );

  async function onSendTyped() {
    if (!input.trim()) return;
    const t = input.trim();
    setInput("");
    await sendMessage(t);
  }

  const dc = dailyCultureChallenge();
  const showTranscript = messages.length > 0 || loading;

  if (!enabled) return null;

  return (
    <>
      <div className="pointer-events-none fixed left-4 z-[58] bottom-[calc(5.75rem+env(safe-area-inset-bottom))] md:bottom-[calc(6.25rem+env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => setShellOpen(true)}
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/35 bg-black/65 text-emerald shadow-[0_0_24px_-6px_rgb(52_211_153/65%)] backdrop-blur-md transition hover:scale-[1.03]"
          aria-label="Open Elias — ecosystem guide"
        >
          <Sparkles className="h-6 w-6" aria-hidden />
        </button>
      </div>

      <Dialog open={shellOpen} onOpenChange={setShellOpen}>
        <DialogContent className="glass left-[50%] top-auto bottom-0 max-h-[min(72dvh,520px)] w-[calc(100%-1rem)] max-w-sm translate-y-0 rounded-t-2xl border-emerald-500/20 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-5 sm:bottom-auto sm:top-[50%] sm:max-h-[min(85vh,560px)] sm:max-w-sm sm:translate-y-[-50%] sm:rounded-2xl sm:p-5">
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-heading flex items-center gap-2 text-base">
              <MessageCircle className="h-5 w-5 text-emerald-300" aria-hidden />
              Elias
            </DialogTitle>
            <DialogDescription className="text-left text-[11px] leading-snug text-zinc-500">
              Pick one of three — no typing needed.
            </DialogDescription>
          </DialogHeader>

          {sessionOk === false ? (
            <p className="rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-[11px] leading-snug text-amber-100/95">
              Chat storage isn’t configured. Add{" "}
              <span className="font-mono text-amber-50">SUPABASE_URL</span> +{" "}
              <span className="font-mono text-amber-50">SUPABASE_SERVICE_ROLE_KEY</span> to{" "}
              <span className="font-mono">frontend/.env</span> and restart the dev server. See{" "}
              <span className="font-mono">docs/SUPABASE_ELIAS_SETUP.md</span>.
            </p>
          ) : sessionOk === null ? (
            <p className="text-[10px] text-zinc-600">Checking connection…</p>
          ) : null}

          <div className="flex items-start justify-between gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-2">
            <p className="min-w-0 flex-1 text-[11px] leading-snug text-zinc-300">
              <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                Pulse {dc.dayKey}{" "}
              </span>
              <span className="text-emerald-200/95">{dc.title}</span>
            </p>
            {address ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 shrink-0 px-2 text-[10px] text-zinc-400 hover:text-white"
                onClick={() => {
                  const ok = tryCompleteDailyCultureChallenge(address);
                  if (ok) toast.success(`+${dc.xpReward} XP`);
                  else toast.message("Already today.");
                }}
              >
                +{dc.xpReward} XP
              </Button>
            ) : null}
          </div>

          {!address ? (
            <p className="text-[10px] text-zinc-600">Wallet on Profile unlocks pulse XP.</p>
          ) : null}

          <div className="space-y-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">Tap one</p>
            <div className="flex flex-col gap-2">
              {ELIAS_ORB_QUICK_PROMPTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  disabled={loading || sessionOk === false}
                  onClick={() => void sendMessage(p.message)}
                  className={cn(
                    "flex min-h-[48px] w-full items-center rounded-xl border border-white/[0.14] bg-white/[0.06] px-4 py-3 text-left text-[14px] font-semibold leading-snug text-zinc-100 transition active:scale-[0.99] disabled:opacity-45",
                    "hover:border-emerald-500/45 hover:bg-emerald-500/12",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {showTranscript ? (
            <ScrollArea className="max-h-[28vh] rounded-xl border border-white/[0.08] bg-black/35 p-2.5">
              <div className="space-y-2 pr-2">
                {messages.map((m, i) => (
                  <div
                    key={`${m.role}-${i}-${m.content.slice(0, 20)}`}
                    className={
                      m.role === "assistant"
                        ? "rounded-lg border border-white/[0.08] bg-white/[0.04] p-2.5 text-[13px] leading-relaxed text-zinc-200 whitespace-pre-wrap"
                        : "ml-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-2.5 text-[13px] text-white whitespace-pre-wrap"
                    }
                  >
                    {m.content}
                  </div>
                ))}
                {loading ? (
                  <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] p-2.5 text-[12px] text-zinc-400">
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                    Thinking…
                  </div>
                ) : null}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>
          ) : null}

          <div className="rounded-lg border border-white/[0.06] bg-black/25">
            <button
              type="button"
              onClick={() => setKeyboardOpen((o) => !o)}
              className="flex w-full min-h-[40px] items-center justify-between px-3 py-2 text-left text-[11px] text-zinc-500"
              aria-expanded={keyboardOpen}
            >
              <span>Ask in my own words (optional)</span>
              <ChevronDown
                className={cn("h-4 w-4 shrink-0 transition", keyboardOpen && "rotate-180")}
                aria-hidden
              />
            </button>
            {keyboardOpen ? (
              <div className="flex gap-2 border-t border-white/[0.06] px-3 pb-3 pt-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Your question…"
                  className="h-10 font-mono text-[13px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void onSendTyped();
                  }}
                />
                <Button
                  type="button"
                  className="shrink-0"
                  disabled={loading || !input.trim() || sessionOk === false}
                  onClick={() => void onSendTyped()}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : "Send"}
                </Button>
              </div>
            ) : null}
          </div>

          <p className="text-[10px] leading-snug text-zinc-600">
            Vienna itineraries →{" "}
            <Link
              to="/elias"
              className="text-emerald-400 underline"
              onClick={() => setShellOpen(false)}
            >
              full concierge
            </Link>
            . Elias LLM: <span className="font-mono">OPENAI_API_KEY</span> or{" "}
            <span className="font-mono">ANTHROPIC_API_KEY</span> (optional{" "}
            <span className="font-mono">ELIAS_LLM_PROVIDER=anthropic</span>).
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
