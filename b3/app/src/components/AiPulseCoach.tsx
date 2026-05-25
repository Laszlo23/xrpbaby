import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAiCoach } from "@/contexts/AiCoachContext";
import { erc20Abi } from "@/lib/bcd-abi";
import { getBcdTokenAddress } from "@/lib/bcd-config";
import { loadProgress } from "@/lib/playerProgress";
import { formatUnits } from "viem";
import type { AiPulseResult } from "@/lib/ai-pulse-fn";
import { postAiPulseMessage } from "@/lib/ai-pulse-fn";
import { toast } from "sonner";

const QUEST_TOTAL = 4;
const PULSE_COACH_OPEN_EVENT = "bc_pulse_coach_open";

type ChatTurn = { role: "user" | "assistant"; content: string };

const PRESETS = [
  { label: "What should I do today?", message: "What should I focus on today on BUILDCHAIN?" },
  { label: "BCD vs ETH mint", message: "Explain BCD pricing vs how mints settle on-chain today." },
  { label: "Rank up faster", message: "How do I climb the leaderboard and earn XP faster?" },
] as const;

export function AiPulseCoach() {
  const { address } = useAccount();
  const { coachOpen, closeCoach, openCoach } = useAiCoach();
  const runAi = useServerFn(postAiPulseMessage);
  const tokenBcd = getBcdTokenAddress();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: bcdBal } = useReadContract({
    address: tokenBcd,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!tokenBcd && !!address },
  });

  const snapshot = useMemo(() => {
    if (!address) return undefined;
    const p = loadProgress(address);
    const bcdHint =
      bcdBal !== undefined ? formatUnits(bcdBal as bigint, 18).slice(0, 24) : undefined;
    return {
      xp: p.xp,
      questsCompleted: p.questsCompleted.length,
      questsTotal: QUEST_TOTAL,
      bcdTutorialSeen: p.bcdTutorialSeen === true,
      genesisClaimRecorded: p.questsCompleted.includes("bcd_genesis_claimed"),
      bcdWeiBalanceApprox: bcdHint,
      walletHint: `${address.slice(0, 6)}…${address.slice(-4)}`,
    };
  }, [address, bcdBal]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, loading]);

  useEffect(() => {
    function onOpen() {
      openCoach();
    }
    window.addEventListener(PULSE_COACH_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(PULSE_COACH_OPEN_EVENT, onOpen);
  }, [openCoach]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;
      setLoading(true);
      const userTurn: ChatTurn = { role: "user", content: trimmed };
      const nextTurns = [...turns, userTurn];
      setTurns(nextTurns);
      setInput("");
      try {
        const result = (await runAi({
          data: {
            message: trimmed,
            history: turns,
            snapshot,
          },
        })) as AiPulseResult;
        setTurns((prev) => [...prev, { role: "assistant", content: result.reply }]);
        if (result.source === "fallback") {
          toast.message(
            "Pulse Coach — offline tips (set OPENAI_API_KEY on the server for full AI).",
          );
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Something went wrong.";
        toast.error(msg.slice(0, 160));
        setTurns((prev) => prev.slice(0, -1));
      } finally {
        setLoading(false);
      }
    },
    [loading, runAi, snapshot, turns],
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void sendMessage(input);
  }

  return (
    <Dialog open={coachOpen} onOpenChange={(o) => !o && closeCoach()}>
      <DialogContent className="glass flex max-h-[85vh] flex-col border-white/[0.08] sm:max-w-lg sm:rounded-3xl">
        <DialogHeader className="shrink-0">
          <DialogTitle className="font-heading flex items-center gap-2 text-xl">
            <MessageCircle className="h-5 w-5 text-neon" aria-hidden />
            Pulse Coach
          </DialogTitle>
          <DialogDescription className="text-left text-zinc-500">
            AI tips for drops, XP, and BCD — not financial advice. On-chain facts may change; verify
            in the app and contracts.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto py-2">
          {turns.length === 0 ? (
            <p className="text-sm leading-relaxed text-zinc-500">
              Ask anything about playing BUILDCHAIN, or tap a shortcut below. Your local XP / quest
              progress is sent as context when your wallet is connected (no full addresses stored
              server-side beyond a short hint).
            </p>
          ) : (
            <ul className="space-y-3">
              {turns.map((t, i) => (
                <li
                  key={`${i}-${t.role}`}
                  className={`rounded-2xl border px-3 py-2.5 text-sm leading-relaxed ${
                    t.role === "user"
                      ? "ml-6 border-[rgb(0_82_255/0.25)] bg-[rgb(0_82_255/0.08)] text-zinc-100"
                      : "mr-6 border-white/[0.08] bg-white/[0.04] text-zinc-300 whitespace-pre-wrap"
                  }`}
                >
                  {t.content}
                </li>
              ))}
              {loading ? (
                <li className="flex items-center gap-2 text-xs text-zinc-500">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Thinking…
                </li>
              ) : null}
              <div ref={bottomRef} />
            </ul>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            {PRESETS.map((p) => (
              <Button
                key={p.label}
                type="button"
                size="sm"
                variant="secondary"
                disabled={loading}
                className="rounded-full text-xs"
                onClick={() => void sendMessage(p.message)}
              >
                {p.label}
              </Button>
            ))}
            {turns.length > 0 ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="rounded-full text-xs text-zinc-500"
                disabled={loading}
                onClick={() => setTurns([])}
              >
                Clear chat
              </Button>
            ) : null}
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex shrink-0 gap-2 border-t border-white/[0.06] pt-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Pulse Coach…"
            className="font-mono text-sm"
            disabled={loading}
            maxLength={4000}
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="shrink-0 rounded-full bg-[var(--b3-purple)] px-5 text-white hover:bg-[var(--base-blue-hover)]"
          >
            Send
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
