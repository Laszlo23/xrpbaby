import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiweMessage } from "siwe";
import { useAccount, useChainId, useSignMessage } from "wagmi";
import { Loader2, Send, Sparkles, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  postEliasApprovePlan,
  postEliasChat,
  postEliasEnsureSession,
  postEliasLinkWallet,
  postEliasLoadThread,
} from "@/lib/elias-fns";
import { postCompleteEliasPlanConfirmed, postPointsBalance } from "@/lib/points-fns";
import type { EliasItinerary } from "@/server/elias/schema";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";

const SESSION_STORAGE_KEY = "bc_elias_session_key_v1";
const THREAD_STORAGE_KEY = "bc_elias_thread_id_v1";

export function EliasConcierge() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync, isPending: signing } = useSignMessage();

  const ensureSession = useServerFn(postEliasEnsureSession);
  const sendChat = useServerFn(postEliasChat);
  const loadThread = useServerFn(postEliasLoadThread);
  const approvePlan = useServerFn(postEliasApprovePlan);
  const linkWalletFn = useServerFn(postEliasLinkWallet);
  const claimXpFn = useServerFn(postCompleteEliasPlanConfirmed);
  const fetchBalance = useServerFn(postPointsBalance);

  const [sessionKey, setSessionKey] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hydrating, setHydrating] = useState(true);
  const [planId, setPlanId] = useState<string | null>(null);
  const [planStatus, setPlanStatus] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState<EliasItinerary | null>(null);
  const [pointsBalance, setPointsBalance] = useState<number | null>(null);

  useEffect(() => {
    let k = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!k) {
      k = crypto.randomUUID();
      localStorage.setItem(SESSION_STORAGE_KEY, k);
    }
    setSessionKey(k);
    const tid = localStorage.getItem(THREAD_STORAGE_KEY);
    if (tid) setThreadId(tid);
  }, []);

  const refreshPoints = useCallback(async () => {
    if (!address) return;
    const r = await fetchBalance({ data: { address } });
    if (r.ok) setPointsBalance(r.balance);
  }, [address, fetchBalance]);

  useEffect(() => {
    void refreshPoints();
  }, [refreshPoints]);

  useEffect(() => {
    if (!sessionKey) return;
    let cancelled = false;
    void (async () => {
      setHydrating(true);
      try {
        await ensureSession({ data: { sessionKey } });
        const tid = localStorage.getItem(THREAD_STORAGE_KEY);
        if (!tid) {
          setHydrating(false);
          return;
        }
        const r = await loadThread({ data: { sessionKey, threadId: tid } });
        if (cancelled || !r.ok) {
          setHydrating(false);
          return;
        }
        setMessages(r.messages ?? []);
        if (r.plan?.id) {
          setPlanId(r.plan.id);
          setPlanStatus(r.plan.status ?? null);
          setItinerary(r.plan.itinerary ?? null);
        }
      } finally {
        if (!cancelled) setHydrating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionKey, ensureSession, loadThread]);

  async function signSiwe(
    statement: string,
  ): Promise<{ prepared: string; signature: string } | undefined> {
    if (!address || !chainId) return undefined;
    const message = new SiweMessage({
      domain: typeof window !== "undefined" ? window.location.host : "localhost",
      address,
      statement,
      uri: typeof window !== "undefined" ? window.location.origin : "",
      version: "1",
      chainId,
      nonce: crypto.randomUUID(),
    });
    const prepared = message.prepareMessage();
    const signature = await signMessageAsync({ message: prepared });
    return { prepared, signature };
  }

  async function onSend() {
    if (!sessionKey || !input.trim()) return;
    setLoading(true);
    try {
      const userMsg = input.trim();
      setInput("");
      setMessages((m) => [...m, { role: "user", content: userMsg }]);
      const r = await sendChat({
        data: {
          sessionKey,
          threadId: threadId ?? undefined,
          message: userMsg,
        },
      });
      if (!r.ok || !r.threadId) {
        toast.error(r.reason ?? "Could not reach Elias concierge.");
        return;
      }
      setThreadId(r.threadId);
      localStorage.setItem(THREAD_STORAGE_KEY, r.threadId);
      setMessages((m) => [...m, { role: "assistant", content: r.assistantReply ?? "" }]);
      if (r.plan?.id) {
        setPlanId(r.plan.id);
        setPlanStatus(r.plan.status ?? null);
      }
      if (r.itinerary) setItinerary(r.itinerary);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Send failed");
    } finally {
      setLoading(false);
    }
  }

  async function onApprove() {
    if (!sessionKey || !planId) return;
    setLoading(true);
    try {
      const r = await approvePlan({ data: { sessionKey, planId } });
      if (!r.ok) {
        toast.error(r.reason ?? "Approve failed");
        return;
      }
      toast.success(
        r.emailedPartners != null
          ? `Partner outreach queued/sent (${r.emailedPartners}).`
          : "Approved.",
      );
      if (r.errors?.length) toast.message(r.errors.slice(0, 2).join("; "));
      setPlanStatus("partner_outreach");
      await refreshPoints();
    } finally {
      setLoading(false);
    }
  }

  async function onLinkWallet() {
    if (!sessionKey) return;
    setLoading(true);
    try {
      const signed = await signSiwe(
        `Link wallet to Elias Concierge guest session on ${BRAND_DISPLAY_NAME}.`,
      );
      if (!signed) return;
      const r = await linkWalletFn({
        data: {
          sessionKey,
          message: signed.prepared,
          signature: signed.signature,
        },
      });
      if (!r.ok) toast.error(r.error ?? "Link failed");
      else toast.success("Wallet linked for XP when your plan is confirmed.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign failed");
    } finally {
      setLoading(false);
    }
  }

  async function onClaimXp() {
    if (!planId || !address) return;
    setLoading(true);
    try {
      const signed = await signSiwe(
        `Claim BUILDCHAIN points for confirmed Elias itinerary plan ${planId}.`,
      );
      if (!signed) return;
      const r = await claimXpFn({
        data: {
          planId,
          message: signed.prepared,
          signature: signed.signature,
        },
      });
      if (!r.ok) {
        toast.error(r.error ?? "Could not claim");
        return;
      }
      toast.success(r.alreadyCompleted ? "Already credited." : "Points recorded.");
      setPointsBalance(r.balance);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Claim failed");
    } finally {
      setLoading(false);
    }
  }

  const showApprove =
    planId && planStatus === "pending_approval" && itinerary && messages.length > 0;

  const showXpClaim = planId && planStatus === "confirmed" && isConnected && address;

  const vibeLine = useMemo(() => {
    if (!itinerary?.vibeTags?.length) return null;
    return itinerary.vibeTags.join(" · ");
  }, [itinerary]);

  if (!sessionKey || hydrating) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Loading Elias…
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 pb-28 pt-8 md:pb-24">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-6 w-6 shrink-0 text-amber-400" aria-hidden />
          <div>
            <h2 className="font-heading text-lg font-semibold text-zinc-100">Elias Concierge</h2>
            <p className="mt-1 text-sm leading-relaxed text-zinc-400">
              Your AI concierge for real-world culture, stays, and private Vienna experiences —
              Elias Residence × Building Culture. Tell me dates, vibe, and budget band; I&apos;ll
              draft an itinerary. Nothing is booked until you approve partner outreach.
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[min(420px,50vh)] rounded-2xl border border-white/10 bg-black/40 p-4">
        <div className="space-y-4 pr-3">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-zinc-500">
              Try: &ldquo;Plan a romantic Vienna weekend&rdquo; or &ldquo;Art collector trip with
              private galleries&rdquo;.
            </p>
          ) : (
            messages.map((m, i) => (
              <div
                key={`${i}-${m.role}`}
                className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "ml-8 bg-[rgb(0_82_255/0.12)] text-zinc-100"
                    : "mr-8 bg-white/[0.06] text-zinc-200"
                }`}
              >
                <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                  {m.role === "user" ? "You" : "Elias"}
                </span>
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {itinerary && (
        <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-950/30 to-black/50 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-200/80">
            Draft itinerary
          </p>
          <h3 className="mt-2 font-heading text-xl font-semibold text-zinc-50">
            {itinerary.title}
          </h3>
          {vibeLine ? <p className="mt-1 text-xs text-amber-100/80">{vibeLine}</p> : null}
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">{itinerary.summary}</p>
          <ul className="mt-4 space-y-3 text-sm text-zinc-400">
            {itinerary.schedule.map((day) => (
              <li key={day.dayLabel}>
                <span className="font-medium text-zinc-200">{day.dayLabel}</span>
                <ul className="mt-1 list-disc pl-5">
                  {day.blocks.map((b, j) => (
                    <li key={`${day.dayLabel}-${j}`}>
                      {b.start ? `${b.start} — ` : ""}
                      {b.label}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          {itinerary.priceBand ? (
            <p className="mt-4 text-xs text-zinc-500">Indicative band: {itinerary.priceBand}</p>
          ) : null}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your Vienna trip…"
          className="flex-1 border-white/15 bg-black/50"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void onSend();
            }
          }}
          disabled={loading}
        />
        <Button
          type="button"
          onClick={() => void onSend()}
          disabled={loading || !input.trim()}
          className="shrink-0 gap-2 bg-[rgb(0_82_255)] text-white hover:bg-[rgb(0_72_230)]"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send
        </Button>
      </div>

      {showApprove ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5">
          <p className="text-sm text-emerald-100/90">
            Ready to contact partners with booking intent (still non-binding until they confirm)?
          </p>
          <Button
            type="button"
            className="mt-4 w-full bg-emerald-600 text-white hover:bg-emerald-500"
            onClick={() => void onApprove()}
            disabled={loading}
          >
            Approve plan & email partners
          </Button>
        </div>
      ) : null}

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Wallet className="h-5 w-5 text-zinc-400" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-zinc-200">Wallet & BUILDCHAIN XP</p>
            <p className="text-xs text-zinc-500">
              Link your wallet to this Elias session. After staff confirms your stay experience on
              their side, claim one-time quest XP here.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={!isConnected || loading || signing}
            onClick={() => void onLinkWallet()}
          >
            Link wallet (SIWE)
          </Button>
          {showXpClaim ? (
            <Button
              type="button"
              variant="outline"
              disabled={loading || signing}
              onClick={() => void onClaimXp()}
            >
              Claim itinerary XP
            </Button>
          ) : null}
          {pointsBalance != null ? (
            <span className="self-center font-mono text-xs text-zinc-500">
              Ledger ≈ {pointsBalance} XP
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
