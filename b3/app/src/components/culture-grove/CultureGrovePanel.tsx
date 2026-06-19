"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Crown, Dna, Music, Sparkles, Users } from "lucide-react";
import { useAccount } from "wagmi";
import { toast } from "sonner";

import { CultureGroveTree } from "@/components/culture-grove/CultureGroveTree";
import { AsyncSection, AsyncSectionSpinner } from "@/components/AsyncSection";
import { usePointsSiweSign } from "@/hooks/usePointsSiweSign";
import { sanitizeAgentRef } from "@/lib/agent-attribution";
import { getPublicAppOrigin } from "@/lib/app-origin";
import { warpcastComposeUrl } from "@/lib/campaign-share";
import {
  celebrateTwinBloomUnlock,
  isTwinBloomCelebrated,
  playTwinBloomAudio,
  setTwinBloomAudioMuted,
  twinBloomAudioUrl,
} from "@/lib/culture-grove/celebration";
import { GROVE_INVITE_TARGET, groveMilestoneLabel } from "@/lib/culture-grove/story";
import type { GroveTreePayload } from "@/lib/culture-grove/types";
import { postCompleteTaskWithSiwe } from "@/lib/points-fns";
import { communityTelegramUrl } from "@/lib/community-links";

type Props = {
  address: string;
  compact?: boolean;
};

function walletAgentRef(address: string): string {
  const raw = address.slice(2, 10).toLowerCase();
  return sanitizeAgentRef(raw) ?? raw;
}

export function CultureGrovePanel({ address, compact = false }: Props) {
  const { isConnected } = useAccount();
  const { signSiwe } = usePointsSiweSign();
  const completeTask = useServerFn(postCompleteTaskWithSiwe);
  const [data, setData] = useState<GroveTreePayload | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [copied, setCopied] = useState(false);
  const [completedSlugs, setCompletedSlugs] = useState<string[]>([]);
  const autoClaimAttempted = useRef(false);
  const prevTwinBloom = useRef<boolean | null>(null);

  const joinUrl = useMemo(() => {
    const origin = getPublicAppOrigin();
    const params = new URLSearchParams({
      agent_ref: walletAgentRef(address),
      utm_source: "grove",
      utm_medium: "culture_dna",
      utm_campaign: "twin_bloom",
    });
    return `${origin}/join?${params.toString()}`;
  }, [address]);

  const shareText = "Plant your seed in my Culture Grove — earn Culture Points when you join 🌿";
  const farcasterShare = useMemo(() => warpcastComposeUrl(shareText, [joinUrl]), [joinUrl]);
  const xShare = useMemo(() => {
    const u = new URL("https://twitter.com/intent/tweet");
    u.searchParams.set("text", shareText);
    u.searchParams.set("url", joinUrl);
    return u.href;
  }, [joinUrl]);
  const tgShare = useMemo(() => {
    const u = new URL("https://t.me/share/url");
    u.searchParams.set("url", joinUrl);
    u.searchParams.set("text", shareText);
    return u.href;
  }, [joinUrl]);

  const load = useCallback(async () => {
    if (!address) return;
    setLoadState("loading");
    try {
      const [groveRes, meRes] = await Promise.all([
        fetch(`/api/member/grove-tree?address=${encodeURIComponent(address)}`),
        fetch(`/api/member/me?address=${encodeURIComponent(address)}`),
      ]);
      const json = (await groveRes.json()) as GroveTreePayload & { error?: string };
      if (!groveRes.ok || !json.ok) {
        setLoadState("error");
        return;
      }
      setData(json);
      setLoadState("ready");

      if (meRes.ok) {
        const me = (await meRes.json()) as { member?: { completedSlugs?: string[] } };
        setCompletedSlugs(me.member?.completedSlugs ?? []);
      }
    } catch {
      setLoadState("error");
    }
  }, [address]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!data?.twinBloomUnlocked) {
      prevTwinBloom.current = data?.twinBloomUnlocked ?? false;
      return;
    }
    const wasUnlocked = prevTwinBloom.current === true;
    prevTwinBloom.current = true;
    if (!wasUnlocked || !isTwinBloomCelebrated()) {
      celebrateTwinBloomUnlock();
    }
  }, [data?.twinBloomUnlocked]);

  useEffect(() => {
    if (
      !data?.twinBloomUnlocked ||
      !isConnected ||
      autoClaimAttempted.current ||
      completedSlugs.includes("daily-invite-friend")
    ) {
      return;
    }
    autoClaimAttempted.current = true;

    void (async () => {
      try {
        const signed = await signSiwe();
        if (!signed) return;
        const result = await completeTask({
          data: {
            message: signed.prepared,
            signature: signed.signature,
            taskSlug: "daily-invite-friend",
          },
        });
        if (result.ok && !result.alreadyCompleted) {
          toast.success("Quest claimed — +200 Culture Points", {
            description: "Twin Bloom invite quest complete.",
          });
          setCompletedSlugs((prev) => [...prev, "daily-invite-friend"]);
        }
      } catch {
        autoClaimAttempted.current = false;
      }
    })();
  }, [completeTask, completedSlugs, data?.twinBloomUnlocked, isConnected, signSiwe]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      toast.success("Grove link copied — send it to 2 friends!", {
        description: "When they join, your Culture DNA tree grows.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  }, [joinUrl]);

  const progressPct = data
    ? Math.min(100, Math.round((data.directCount / GROVE_INVITE_TARGET) * 100))
    : 0;

  const isGroveElder = data?.isGroveElder ?? false;
  const nftStatus = data?.twinBloomNft?.status ?? "none";

  return (
    <div
      className={`overflow-hidden rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-950/40 via-black/50 to-[#C5FF41]/5 ${
        compact ? "p-5" : "p-6 sm:p-8"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15">
            <Dna className="h-6 w-6 text-violet-300" aria-hidden />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-violet-300/90">
              Culture Grow DNA
            </p>
            <h2 className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">
              Your connection grove
            </h2>
            {!compact ? (
              <p className="mt-2 max-w-xl text-sm text-zinc-400">
                Every newcomer plants a seed. Invite two friends — they invite two more — and your
                mystic tree reveals who chose your path (handles redacted for privacy).
              </p>
            ) : null}
          </div>
        </div>
        {data ? (
          <div className="flex flex-wrap items-center gap-2">
            {isGroveElder ? (
              <div className="flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-4 py-2">
                <Crown className="h-4 w-4 text-amber-300" aria-hidden />
                <span className="text-xs font-medium text-amber-100">Grove Elder</span>
              </div>
            ) : null}
            <div className="flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-2">
              <Sparkles className="h-4 w-4 text-[#C5FF41]" aria-hidden />
              <span className="text-xs font-medium text-violet-100">
                {groveMilestoneLabel(data.directCount, isGroveElder)}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {data?.inviterLabel ? (
        <p className="mt-4 rounded-xl border border-[#C5FF41]/20 bg-[#C5FF41]/5 px-4 py-3 text-sm text-[#C5FF41]/90">
          You were planted by{" "}
          <span className="font-semibold text-[#C5FF41]">{data.inviterLabel}</span>
          {" — "}welcome bonus Culture Points are in your ledger.
        </p>
      ) : null}

      <AsyncSection
        className="mt-6"
        state={loadState === "loading" ? "loading" : loadState === "error" ? "error" : "ready"}
        errorMessage="Could not load your grove. The forest database may be offline."
        onRetry={() => void load()}
        skeleton={<AsyncSectionSpinner label="Reading Culture DNA…" />}
      >
        {data ? (
          <>
            <p className="mb-4 text-center text-sm italic text-zinc-400">
              &ldquo;{data.story}&rdquo;
            </p>
            <CultureGroveTree root={data.self} twinBloomUnlocked={data.twinBloomUnlocked} />
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  Twin Bloom progress
                </span>
                <span className="font-mono text-[#C5FF41]">
                  {data.directCount}/{GROVE_INVITE_TARGET} seeds
                  {data.totalDescendants > data.directCount
                    ? ` · ${data.totalDescendants} in tree`
                    : ""}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-[#C5FF41] transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              {data.twinBloomUnlocked ? (
                <p className="text-center text-xs text-emerald-300/90">
                  Twin Bloom unlocked — +100 Culture Points earned
                  {completedSlugs.includes("daily-invite-friend") ? " · quest +200 claimed" : ""}.
                  {nftStatus === "minted" ? " Anthem NFT minted to your wallet." : ""}
                </p>
              ) : (
                <p className="text-center text-xs text-zinc-500">
                  Invite {GROVE_INVITE_TARGET - data.directCount} more friend
                  {GROVE_INVITE_TARGET - data.directCount === 1 ? "" : "s"} to unlock Twin Bloom.
                </p>
              )}
            </div>

            {data.twinBloomUnlocked ? (
              <div className="mt-6 rounded-2xl border border-violet-400/25 bg-violet-950/30 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C5FF41]/15">
                    <Music className="h-5 w-5 text-[#C5FF41]" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm font-semibold text-white">
                      Twin Bloom Anthem
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
                      Building Culture on IPFS — minted to your wallet at Twin Bloom.
                    </p>
                    <audio
                      className="mt-3 w-full"
                      controls
                      src={twinBloomAudioUrl()}
                      preload="none"
                    >
                      <track kind="captions" />
                    </audio>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <button
                        type="button"
                        className="text-violet-300 hover:text-white"
                        onClick={() => {
                          setTwinBloomAudioMuted(false);
                          playTwinBloomAudio();
                        }}
                      >
                        Replay
                      </button>
                      {nftStatus === "minted" && data.twinBloomNft?.txHash ? (
                        <a
                          href={`https://basescan.org/tx/${data.twinBloomNft.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#C5FF41] hover:underline"
                        >
                          View mint tx
                        </a>
                      ) : nftStatus === "pending" ? (
                        <span className="text-zinc-500">NFT mint pending…</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </AsyncSection>

      {isConnected ? (
        <div className="mt-6 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-black/40 px-3 py-2">
              <p className="truncate font-mono text-[11px] text-zinc-400">{joinUrl}</p>
            </div>
            <button
              type="button"
              onClick={() => void copyLink()}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#C5FF41] px-6 py-3 text-sm font-semibold text-black hover:bg-white"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copied!" : "Copy grove link"}
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <a
              href={farcasterShare}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-violet-400/30 px-4 py-2 text-xs text-violet-200 hover:border-violet-300/50"
            >
              Farcaster
            </a>
            <a
              href={xShare}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-4 py-2 text-xs text-zinc-300 hover:border-white/30"
            >
              X
            </a>
            <a
              href={tgShare}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-4 py-2 text-xs text-zinc-300 hover:border-white/30"
            >
              Telegram
            </a>
            <a
              href={communityTelegramUrl()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-2 text-xs text-zinc-500 hover:text-zinc-300"
            >
              Community
            </a>
          </div>
        </div>
      ) : (
        <p className="mt-6 text-center text-sm text-zinc-500">
          <Link to="/join" className="text-[#C5FF41] underline underline-offset-2">
            Join
          </Link>{" "}
          to plant your grove and earn newcomer rewards.
        </p>
      )}

      {!compact ? (
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-zinc-500">
          <span>+25 pts when friends join your link</span>
          <span>·</span>
          <span>+100 pts at Twin Bloom (2 friends)</span>
          <span>·</span>
          <span>+200 pts invite quest (SIWE)</span>
          <span>·</span>
          <span>Anthem NFT at Twin Bloom</span>
          <span>·</span>
          <Link to="/forest/quests" className="text-violet-300 hover:text-white">
            Quest hub →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
