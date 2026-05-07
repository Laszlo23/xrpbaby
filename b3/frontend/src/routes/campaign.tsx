import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useChainId,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { formatEther } from "viem";
import { Bot, Copy, Gift, Share2, Sparkles, Wallet } from "lucide-react";
import { toast } from "sonner";
import { MarketingHero } from "@/components/MarketingHero";
import { Button } from "@/components/ui/button";
import { agentShareCampaignAbi } from "@/lib/agent-share-abi";
import { getAgentShareCampaignAddress } from "@/lib/agent-share-env";
import { AGENT_SHARE_CATALOG } from "@/lib/agent-share-config";
import {
  getStoredReferrer,
  shareNative,
  twitterIntentUrl,
  warpcastComposeUrl,
} from "@/lib/campaign-share";
import { useCampaignReferral } from "@/hooks/useCampaignReferral";
import { captureMintClicked, captureMintConfirmed, captureShareClicked } from "@/lib/analytics";
import { getDefaultChain, getWagmiChainById } from "@/lib/chains";
import {
  communityTelegramUrl,
  communityXUrl,
  farcasterFollowProfileUrl,
} from "@/lib/community-links";

export const Route = createFileRoute("/campaign")({
  head: () =>
    pageHead({
      title: "Campaign — Agent shares & referrals",
      description:
        "Mint AI agent share NFTs, share on Farcaster and X, earn referral fees — fees route to liquidity and treasury.",
      path: "/campaign",
      keywords: ["Build Culture", "campaign", "referral", "agent NFT", "Farcaster"],
    }),
  validateSearch: (search: Record<string, unknown>) => {
    const ref = typeof search.ref === "string" ? search.ref : undefined;
    const ok = ref && /^0x[a-fA-F0-9]{40}$/i.test(ref) ? ref : undefined;
    return { ref: ok as `0x${string}` | undefined };
  },
  component: CampaignPage,
});

function CampaignPage() {
  const search = Route.useSearch();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: switching } = useSwitchChain();
  const { effectiveReferrer, shareLink } = useCampaignReferral(search);
  const campaignAddr = getAgentShareCampaignAddress();
  const wantChain = getDefaultChain();
  const wrongChain = isConnected && chainId !== wantChain.id;

  const [agentPick, setAgentPick] = useState(0);

  const { data: priceWei } = useReadContract({
    address: campaignAddr,
    abi: agentShareCampaignAbi,
    functionName: "mintPriceWei",
    query: { enabled: !!campaignAddr },
  });
  const { data: mintsToday } = useReadContract({
    address: campaignAddr,
    abi: agentShareCampaignAbi,
    functionName: "mintsToday",
    query: { enabled: !!campaignAddr },
  });
  const { data: dailyCap } = useReadContract({
    address: campaignAddr,
    abi: agentShareCampaignAbi,
    functionName: "dailyMintCap",
    query: { enabled: !!campaignAddr },
  });
  const { data: liqBps } = useReadContract({
    address: campaignAddr,
    abi: agentShareCampaignAbi,
    functionName: "liquidityBps",
    query: { enabled: !!campaignAddr },
  });
  const { data: refBps } = useReadContract({
    address: campaignAddr,
    abi: agentShareCampaignAbi,
    functionName: "referrerBps",
    query: { enabled: !!campaignAddr },
  });
  const { data: claimable, refetch: refetchClaim } = useReadContract({
    address: campaignAddr,
    abi: agentShareCampaignAbi,
    functionName: "referralClaimable",
    args: address ? [address] : undefined,
    query: { enabled: !!campaignAddr && !!address },
  });

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      if (hash) {
        captureMintConfirmed({ tx_hash: hash, product: "ags" });
      }
      toast.success("Transaction confirmed");
      void refetchClaim();
    }
  }, [isSuccess, refetchClaim, hash]);

  useEffect(() => {
    if (writeError) toast.error(writeError.message);
  }, [writeError]);

  const shareText = useMemo(() => {
    return `Building onchain with Build Culture — agent shares, daily mints, referrals. ${shareLink || ""}`;
  }, [shareLink]);

  const onShareWarpcast = () => {
    captureShareClicked({ channel: "warpcast", context: "campaign" });
    window.open(warpcastComposeUrl(shareText), "_blank", "noopener,noreferrer");
  };
  const onShareX = () => {
    captureShareClicked({ channel: "twitter", context: "campaign" });
    window.open(twitterIntentUrl(shareText, shareLink), "_blank", "noopener,noreferrer");
  };
  const onShareSystem = async () => {
    captureShareClicked({ channel: "native", context: "campaign" });
    const ok = await shareNative({
      title: "Build Culture campaign",
      text: shareText,
      url: shareLink || window.location.origin + "/campaign",
    });
    if (!ok) await copyLink();
  };
  const copyLink = async () => {
    captureShareClicked({ channel: "copy", context: "campaign" });
    try {
      await navigator.clipboard.writeText(shareLink || window.location.href);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  const onMint = () => {
    if (!campaignAddr || !priceWei || wrongChain) return;
    captureMintClicked({
      quantity: 1,
      price_wei: priceWei.toString(),
      product: "ags",
      agent_type_id: agentPick,
    });
    const refArg = effectiveReferrer ?? "0x0000000000000000000000000000000000000000";
    writeContract({
      address: campaignAddr,
      abi: agentShareCampaignAbi,
      functionName: "mint",
      args: [agentPick, refArg],
      value: priceWei,
    });
  };

  const onWithdrawRef = () => {
    if (!campaignAddr) return;
    writeContract({
      address: campaignAddr,
      abi: agentShareCampaignAbi,
      functionName: "withdrawReferral",
    });
  };

  const chainLabel = getWagmiChainById(chainId)?.name ?? "Unknown";

  return (
    <div className="min-h-screen pb-nav-safe">
      <MarketingHero
        eyebrow="Onchain growth"
        tone="purple"
        size="compact"
        title={
          <>
            Agent shares, referrals, <span className="text-zinc-100">social velocity</span>
          </>
        }
        subtitle="Mint compact ERC-721 shares tied to agent archetypes. A slice of every mint routes to your liquidity vault; referrers claim in one transaction."
      />

      <div className="border-y border-white/[0.06] bg-gradient-to-r from-black/50 via-[rgb(0_82_255/8%)] to-black/50">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-2 px-4 py-3.5 md:gap-3">
          <span className="w-full pb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500 md:w-auto md:pb-0 md:pr-2">
            Community
          </span>
          <a
            href={communityXUrl()}
            className="rounded-full border border-white/12 bg-black/35 px-4 py-2 text-sm font-medium text-zinc-100 transition-colors hover:border-[var(--base-blue)]/45 hover:text-white"
            target="_blank"
            rel="noreferrer"
          >
            X — @buildingcultu3
          </a>
          <a
            href={communityTelegramUrl()}
            className="rounded-full border border-white/12 bg-black/35 px-4 py-2 text-sm font-medium text-zinc-100 transition-colors hover:border-[var(--base-blue)]/45 hover:text-white"
            target="_blank"
            rel="noreferrer"
          >
            Telegram
          </a>
          <a
            href={farcasterFollowProfileUrl()}
            className="rounded-full border border-white/12 bg-black/35 px-4 py-2 text-sm font-medium text-zinc-100 transition-colors hover:border-[var(--base-blue)]/45 hover:text-white"
            target="_blank"
            rel="noreferrer"
          >
            Farcaster — @0xleonardo
          </a>
          <a
            href="/profile"
            className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200 transition-colors hover:bg-emerald-500/15"
          >
            Points & quests →
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-10 px-4 py-10 md:px-8">
        <section className="glass rounded-2xl border border-white/[0.08] p-6 space-y-4">
          <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
            <Share2 className="h-5 w-5 text-[var(--base-blue)]" aria-hidden />
            Share & earn
          </h2>
          <p className="text-sm text-muted-foreground">
            Your personal link encodes <span className="font-mono text-xs">?ref=</span> your wallet.
            Farcaster and X open in compose with copy ready; mobile can use the native share sheet.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" className="gap-2" onClick={copyLink}>
              <Copy className="h-4 w-4" />
              Copy link
            </Button>
            <Button
              type="button"
              className="gap-2 bg-[var(--base-blue)] text-white hover:bg-[var(--base-blue-hover)]"
              onClick={onShareWarpcast}
            >
              <span className="font-semibold">Cast</span>
            </Button>
            <Button type="button" variant="outline" className="gap-2" onClick={onShareX}>
              Post on X
            </Button>
            <Button type="button" variant="ghost" className="gap-2" onClick={onShareSystem}>
              Share…
            </Button>
          </div>
          {shareLink ? (
            <p className="break-all font-mono text-[11px] text-zinc-500">{shareLink}</p>
          ) : null}
          {effectiveReferrer ? (
            <p className="text-xs text-emerald-400/90">
              Referrer attached: <span className="font-mono">{effectiveReferrer}</span> (or from
              storage: {getStoredReferrer() ?? "—"})
            </p>
          ) : (
            <p className="text-xs text-zinc-500">
              No referrer (direct visit). Share your link to earn.
            </p>
          )}
        </section>

        <section className="glass rounded-2xl border border-white/[0.08] p-6 space-y-4">
          <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
            <Bot className="h-5 w-5 text-[var(--base-blue)]" aria-hidden />
            AI agent lineup
          </h2>
          <p className="text-sm text-muted-foreground">
            Each mint passes an <span className="font-mono">agentTypeId</span> (0–255). Metadata
            JSON per token should describe the agent (Clanker-style launches, traders, researchers).
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {AGENT_SHARE_CATALOG.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAgentPick(a.id)}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  agentPick === a.id
                    ? "border-[var(--base-blue)] bg-[var(--base-blue)]/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <p className="font-mono text-[10px] text-zinc-500">id {a.id}</p>
                <p className="font-heading text-sm font-semibold text-foreground">{a.name}</p>
                <p className="text-xs text-muted-foreground">{a.tagline}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="glass rounded-2xl border border-white/[0.08] p-6 space-y-4">
          <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
            <Wallet className="h-5 w-5 text-[var(--base-blue)]" aria-hidden />
            Mint agent share
          </h2>

          {!campaignAddr && (
            <p className="text-sm text-amber-200/90">
              Set <span className="font-mono">VITE_AGENT_SHARE_CAMPAIGN_ADDRESS</span> after
              deploying <span className="font-mono">AgentShareCampaign</span>.
            </p>
          )}

          {campaignAddr && priceWei !== undefined && (
            <ul className="text-sm text-zinc-400 space-y-1">
              <li>
                Price: <span className="text-foreground">{formatEther(priceWei)} ETH</span>
              </li>
              <li>
                Today: {mintsToday !== undefined ? String(mintsToday) : "…"} /{" "}
                {dailyCap !== undefined ? String(dailyCap) : "…"} mints
              </li>
              <li>
                Fee split:{" "}
                {liqBps !== undefined && refBps !== undefined
                  ? `${(Number(liqBps) / 100).toFixed(1)}% liquidity · ${(Number(refBps) / 100).toFixed(1)}% referrer · remainder treasury`
                  : "…"}
              </li>
              <li>Network: {chainLabel}</li>
            </ul>
          )}

          {wrongChain && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm">
              Switch to <strong>{wantChain.name}</strong> to mint.
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="ml-3"
                disabled={switching}
                onClick={() => switchChain({ chainId: wantChain.id })}
              >
                {switching ? "Switching…" : "Switch"}
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={
                !campaignAddr ||
                !isConnected ||
                wrongChain ||
                isPending ||
                confirming ||
                priceWei === undefined
              }
              onClick={onMint}
              className="gap-2 bg-[var(--base-blue)] text-white hover:bg-[var(--base-blue-hover)]"
            >
              <Sparkles className="h-4 w-4" />
              {isPending || confirming ? "Confirm…" : "Mint agent share"}
            </Button>
          </div>

          {hash ? (
            <p className="font-mono text-[10px] text-zinc-500 break-all">Tx: {hash}</p>
          ) : null}
        </section>

        <section className="glass rounded-2xl border border-white/[0.08] p-6 space-y-4">
          <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
            <Gift className="h-5 w-5 text-[var(--base-blue)]" aria-hidden />
            Referral balance
          </h2>
          <p className="text-sm text-muted-foreground">
            Referrers accrue ETH on-chain; claim pulls to your wallet (gas minimal on mint path).
          </p>
          {campaignAddr && address && claimable !== undefined ? (
            <p className="text-sm">
              Claimable: <span className="font-mono text-neon">{formatEther(claimable)} ETH</span>
            </p>
          ) : (
            <p className="text-sm text-zinc-500">Connect to view claimable fees.</p>
          )}
          <Button
            type="button"
            variant="secondary"
            disabled={
              !campaignAddr ||
              !isConnected ||
              wrongChain ||
              !claimable ||
              claimable === 0n ||
              isPending
            }
            onClick={onWithdrawRef}
          >
            Withdraw referral ETH
          </Button>
        </section>

        <section className="rounded-xl border border-white/[0.06] bg-black/30 p-5 text-xs text-zinc-500 leading-relaxed">
          Agent shares are experimental NFTs referencing agent archetypes; “Clanker” and similar
          names are illustrative. Liquidity vault receives ETH for your treasury to pair with
          project tokens on a DEX — not automated LP inside this contract. Not investment advice.
        </section>
      </div>
    </div>
  );
}
