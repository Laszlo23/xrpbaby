import { createFileRoute, Link } from "@tanstack/react-router";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { WalletControls } from "@/components/WalletControls";
import { pageHead } from "@/lib/seo";
import { LevelBadge, getLevel } from "@/components/LevelBadge";
import { Wallet, Ticket, Trophy, Flame, Star, TrendingUp, Gem } from "lucide-react";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { useCallback, useEffect, useState } from "react";
import { raffleCampaignAbi } from "@bc/contracts-sdk";
import { getCampaignAddress } from "@/lib/campaign";
import { erc20Abi } from "@/lib/bcd-abi";
import { bcdGenesisClaimAbi } from "@/lib/bcd-genesis-abi";
import {
  grantBcdHolderQuest,
  grantGenesisClaimQuest,
  grantGenesisVaultPassHolderQuest,
  loadProgress,
  claimDaily,
  completeQuestWithXp,
  mergeGuestIntentIntoWallet,
  tryCompleteDailyCultureChallenge,
  type PlayerProgress,
} from "@/lib/playerProgress";
import { getBcdGenesisClaimAddress, getBcdTokenAddress } from "@/lib/bcd-config";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { explorerAddressUrl } from "@/lib/explorer";
import { CommunityProfilePanel } from "@/components/community-profile/CommunityProfilePanel";
import { PointsLedgerSection } from "@/components/PointsLedgerSection";
import { WalletPortfolio } from "@/components/wallet-portfolio/WalletPortfolio";
import { dailyCultureChallenge } from "@/lib/daily-culture-challenge";
import {
  dailyXpBonusForGenesisVaultTier,
  getDistinctLegacyGenesisDistrictAddress,
  getGenesisVaultPassPhase0Address,
  getGenesisVaultPassPhase1Address,
  getGenesisVaultPassPhase2Address,
  resolveHighestGenesisVaultTier,
  type GenesisVaultTier,
} from "@/lib/genesis-district-config";
import { erc721MinimalAbi } from "@/lib/erc721-minimal-abi";
import { getDefaultChain } from "@/lib/chains";
import { intentById } from "@/lib/elias-intents";

export const Route = createFileRoute("/profile")({
  head: () =>
    pageHead({
      title: "Profile",
      description:
        "Your Build Culture profile — quests, points, and progression while we fundraise and ship continuously.",
      path: "/profile",
      keywords: ["Build Culture", "profile", "quests", "wallet", "fundraising"],
    }),
  component: ProfilePage,
});

const QUESTS = [
  { id: "visit_mission", label: "Read Building Culture mission (/mission)", xp: 20 },
  { id: "view_collections", label: "Open Collections tab once", xp: 15 },
  { id: "view_leaderboard", label: "Check the leaderboard", xp: 15 },
  {
    id: "share_build",
    label: "Tell someone we're fundraising & building long-term",
    xp: 25,
  },
] as const;

function ProfilePage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const campaign = getCampaignAddress();
  const genesis = getBcdGenesisClaimAddress();
  const tokenBcd = getBcdTokenAddress();
  const deployChainId = getDefaultChain().id;
  const gvpPhase0 = getGenesisVaultPassPhase0Address();
  const gvpPhase1 = getGenesisVaultPassPhase1Address();
  const gvpPhase2 = getGenesisVaultPassPhase2Address();
  const legacyGenesisDistinct = getDistinctLegacyGenesisDistrictAddress();
  const [progress, setProgress] = useState<PlayerProgress | null>(null);

  const { data: ticketBal } = useReadContract({
    address: campaign,
    abi: raffleCampaignAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!campaign && !!address },
  });

  const tickets = Number(ticketBal ?? 0n);

  const { data: genesisDone } = useReadContract({
    address: genesis,
    abi: bcdGenesisClaimAbi,
    functionName: "claimed",
    args: address ? [address] : undefined,
    query: { enabled: !!genesis && !!address },
  });

  const { data: bcdWei } = useReadContract({
    address: tokenBcd,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!tokenBcd && !!address },
  });

  const q0 = useReadContract({
    chainId: deployChainId,
    address: gvpPhase0,
    abi: erc721MinimalAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!gvpPhase0 && !!address },
  });

  const qLeg = useReadContract({
    chainId: deployChainId,
    address: legacyGenesisDistinct,
    abi: erc721MinimalAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!legacyGenesisDistinct && !!address },
  });

  const q1 = useReadContract({
    chainId: deployChainId,
    address: gvpPhase1,
    abi: erc721MinimalAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!gvpPhase1 && !!address },
  });

  const q2 = useReadContract({
    chainId: deployChainId,
    address: gvpPhase2,
    abi: erc721MinimalAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!gvpPhase2 && !!address },
  });

  const genesisReadsPending =
    (!!gvpPhase0 && q0.isPending) ||
    (!!legacyGenesisDistinct && qLeg.isPending) ||
    (!!gvpPhase1 && q1.isPending) ||
    (!!gvpPhase2 && q2.isPending);

  const balPhase0 = q0.data as bigint | undefined;
  const balLegacyPhase0 = qLeg.data as bigint | undefined;
  const balPhase1 = q1.data as bigint | undefined;
  const balPhase2 = q2.data as bigint | undefined;

  const phase0Combined =
    (gvpPhase0 ? (balPhase0 ?? 0n) : 0n) + (legacyGenesisDistinct ? (balLegacyPhase0 ?? 0n) : 0n);
  const phase1Bal = gvpPhase1 ? (balPhase1 ?? 0n) : 0n;
  const phase2Bal = gvpPhase2 ? (balPhase2 ?? 0n) : 0n;

  const highestGenesisTier: GenesisVaultTier | null = genesisReadsPending
    ? null
    : resolveHighestGenesisVaultTier({
        balancePhase0: phase0Combined,
        balancePhase1: phase1Bal,
        balancePhase2: phase2Bal,
      });

  const genesisDailyBonus =
    highestGenesisTier !== null ? dailyXpBonusForGenesisVaultTier(highestGenesisTier) : 0;

  const holdsPhase0 = phase0Combined > 0n;
  const holdsPhase1 = phase1Bal > 0n;
  const holdsPhase2 = phase2Bal > 0n;

  const refresh = useCallback(() => {
    if (!address) {
      setProgress(null);
      return;
    }
    setProgress(loadProgress(address));
  }, [address]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!address) return;
    const merged = mergeGuestIntentIntoWallet(address);
    if (merged) refresh();
  }, [address, refresh]);

  const xp = progress?.xp ?? 0;
  const lvl = getLevel(xp);

  function onDaily() {
    if (!address) return;
    const bonus = genesisReadsPending ? 0 : genesisDailyBonus;
    const r = claimDaily(address, { genesisVaultBonusXp: bonus });
    if (!r.ok) toast.message("Already claimed today.");
    else {
      const total = 50 + bonus;
      const tierWord =
        highestGenesisTier === "phase0"
          ? "Phase 0"
          : highestGenesisTier === "phase1"
            ? "Phase 1"
            : highestGenesisTier === "phase2"
              ? "Phase 2"
              : "";
      toast.success(
        bonus > 0
          ? `Daily bonus: +${total} XP (includes +${bonus} vault · ${tierWord})`
          : "Daily bonus: +50 XP",
      );
    }
    refresh();
  }

  function onQuest(questId: string, xpReward: number) {
    if (!address) return;
    const ok = completeQuestWithXp(address, questId, xpReward);
    if (!ok) toast.message("Quest already completed.");
    else toast.success(`Quest done — +${xpReward} XP`);
    refresh();
  }

  useEffect(() => {
    if (!address || !isConnected) return;
    if (completeQuestWithXp(address, "link_wallet", 25)) refresh();
  }, [address, isConnected, refresh]);

  useEffect(() => {
    if (!address || genesisDone !== true) return;
    const before = loadProgress(address);
    grantGenesisClaimQuest(address);
    const after = loadProgress(address);
    if (before.questsCompleted.length !== after.questsCompleted.length) refresh();
  }, [address, genesisDone, refresh]);

  useEffect(() => {
    if (!address || !tokenBcd || bcdWei === undefined) return;
    if ((bcdWei as bigint) <= 0n) return;
    const before = loadProgress(address);
    grantBcdHolderQuest(address);
    const after = loadProgress(address);
    if (before.questsCompleted.length !== after.questsCompleted.length) refresh();
  }, [address, tokenBcd, bcdWei, refresh]);

  useEffect(() => {
    if (!address || genesisReadsPending || !holdsPhase0) return;
    const before = loadProgress(address);
    grantGenesisVaultPassHolderQuest(address, "phase0");
    const after = loadProgress(address);
    if (before.questsCompleted.length !== after.questsCompleted.length) refresh();
  }, [address, genesisReadsPending, holdsPhase0, refresh]);

  useEffect(() => {
    if (!address || genesisReadsPending || !holdsPhase1) return;
    const before = loadProgress(address);
    grantGenesisVaultPassHolderQuest(address, "phase1");
    const after = loadProgress(address);
    if (before.questsCompleted.length !== after.questsCompleted.length) refresh();
  }, [address, genesisReadsPending, holdsPhase1, refresh]);

  useEffect(() => {
    if (!address || genesisReadsPending || !holdsPhase2) return;
    const before = loadProgress(address);
    grantGenesisVaultPassHolderQuest(address, "phase2");
    const after = loadProgress(address);
    if (before.questsCompleted.length !== after.questsCompleted.length) refresh();
  }, [address, genesisReadsPending, holdsPhase2, refresh]);

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen pb-nav-safe px-4 pt-10 md:pt-14">
        <div className="mx-auto max-w-2xl space-y-10">
          <div className="glass rounded-2xl border border-white/[0.08] bg-black/30 p-8 md:p-10 text-center space-y-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
              {BRAND_DISPLAY_NAME}
            </p>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Your builder profile
            </h1>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
              Sign in or connect a wallet to earn Culture Points, buy packs, complete quests, and
              unlock Genesis vault phases.
            </p>
            <div className="flex justify-center pt-2">
              <WalletControls />
            </div>
            <p className="text-[11px] text-zinc-500">
              Prefer the homepage?{" "}
              <Link to="/play" hash="connect" className="text-neon underline underline-offset-2">
                Jump to connect
              </Link>
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              to="/marketplace"
              className="glass rounded-xl border border-white/10 p-5 transition hover:border-[rgb(212_175_55/0.35)]"
            >
              <p className="font-heading font-semibold text-foreground">Marketplace</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Browse NFT listings and sell approved ERC-721s on Base.
              </p>
            </Link>
            <Link
              to="/mission"
              className="glass rounded-xl border border-white/10 p-5 transition hover:border-[rgb(212_175_55/0.35)]"
            >
              <p className="font-heading font-semibold text-foreground">Mission</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Quests and cadence while we fundraise and ship.
              </p>
            </Link>
            <Link
              to="/genesis-district"
              className="glass rounded-xl border border-white/10 p-5 transition hover:border-[rgb(212_175_55/0.35)]"
            >
              <p className="font-heading font-semibold text-foreground">Genesis District</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Vault passes and phased access — unlock after you connect.
              </p>
            </Link>
            <Link
              to="/wallet/packs"
              className="glass rounded-xl border border-white/10 p-5 transition hover:border-[#C5FF41]/35 sm:col-span-3"
            >
              <p className="font-heading font-semibold text-foreground">Culture packs</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Buy Culture Points with card ($0.70–$7.7M tiers) after you sign in.
              </p>
            </Link>
          </div>

          <p className="text-center text-[11px] text-zinc-600">
            Community profile and social layers stay gated until you connect — no wallet reads on
            this screen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-nav-safe px-4 pt-12 max-w-5xl mx-auto space-y-8">
      <CommunityProfilePanel evmAddress={address} />

      <WalletPortfolio address={address} />

      <div className="glass rounded-2xl p-6 text-center space-y-4">
        <div className="mx-auto h-20 w-20 rounded-full gradient-neon flex items-center justify-center glow-neon">
          <span className="text-2xl font-heading font-bold text-neon-foreground">
            {address.slice(2, 4).toUpperCase()}
          </span>
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Builder</h1>
          {highestGenesisTier === "phase0" ? (
            <p className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-200/95">
              <Gem className="h-3.5 w-3.5 text-emerald-300" aria-hidden />
              Genesis vault · Phase 0
            </p>
          ) : null}
          {highestGenesisTier === "phase1" ? (
            <p className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full border border-cyan-500/35 bg-cyan-500/10 px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-cyan-200/95">
              <Gem className="h-3.5 w-3.5 text-cyan-300" aria-hidden />
              Early builder · Phase 1
            </p>
          ) : null}
          {highestGenesisTier === "phase2" ? (
            <p className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full border border-violet-500/35 bg-violet-500/10 px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-violet-200/95">
              <Gem className="h-3.5 w-3.5 text-violet-300" aria-hidden />
              Vault access · Phase 2
            </p>
          ) : null}
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
            <Wallet className="h-3 w-3" />
            <a
              href={explorerAddressUrl(chainId, address)}
              target="_blank"
              rel="noreferrer"
              className="font-mono hover:text-neon"
            >
              {address.slice(0, 6)}…{address.slice(-4)}
            </a>
          </p>
        </div>
        <LevelBadge xp={xp} />

        {progress?.eliasPrimaryIntent ? (
          <p className="text-xs font-mono text-emerald-200/90">
            Elias lane · priority{" "}
            <span className="text-white">
              {intentById(progress.eliasPrimaryIntent)?.label ?? progress.eliasPrimaryIntent}
            </span>
          </p>
        ) : null}

        {progress?.bcBadges?.length ? (
          <div className="flex flex-wrap justify-center gap-1.5">
            {progress.bcBadges.map((b) => (
              <span
                key={b}
                className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-0.5 text-[10px] font-mono uppercase tracking-wide text-zinc-300"
              >
                {b.replace(/intent:/i, "").replace(/_/g, " ")}
              </span>
            ))}
          </div>
        ) : null}

        {progress?.bcdTutorialSeen ? (
          <p className="text-xs font-mono text-amber-200/85">
            Building Culture cadence · opened Get BCD
          </p>
        ) : null}

        <div className="space-y-1">
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full gradient-emerald transition-all duration-500"
              style={{ width: `${lvl.progress}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            {lvl.progress >= 100 ? "Max tier" : `${Math.round(lvl.progress)}% to next rank`}
          </p>
        </div>
      </div>

      <PointsLedgerSection />

      <div className="grid grid-cols-2 gap-3">
        <Stat
          icon={<Ticket className="h-4 w-4 text-neon" />}
          label="Tickets"
          value={String(tickets)}
        />
        <Stat icon={<Trophy className="h-4 w-4 text-gold" />} label="Wins" value="—" />
        <Stat icon={<Flame className="h-4 w-4 text-orange-400" />} label="Streak" value="local" />
        <Stat
          icon={<TrendingUp className="h-4 w-4 text-emerald" />}
          label="XP"
          value={String(xp)}
        />
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-gold" />
          <h2 className="font-heading text-lg font-bold text-foreground">Daily & quests</h2>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Progress is stored in your browser per wallet — not synced across devices.
        </p>
        <Button
          type="button"
          onClick={onDaily}
          className="w-full gradient-neon text-neon-foreground font-heading uppercase tracking-wider"
        >
          {genesisReadsPending
            ? "Claim daily (+50 XP)"
            : genesisDailyBonus > 0
              ? `Claim daily (+50 + ${genesisDailyBonus} vault XP)`
              : "Claim daily (+50 XP)"}
        </Button>

        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3 space-y-2">
          <p className="text-[11px] font-semibold text-emerald-100/95">
            Daily culture pulse (local)
          </p>
          <p className="text-xs text-zinc-400 leading-snug">{dailyCultureChallenge().title}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full border-emerald-500/35 text-emerald-100 hover:bg-emerald-500/10"
            onClick={() => {
              if (!address) return;
              const ch = dailyCultureChallenge();
              if (tryCompleteDailyCultureChallenge(address)) {
                toast.success(`Pulse logged · +${ch.xpReward} XP`);
              } else {
                toast.message("Already credited for today’s pulse.");
              }
              refresh();
            }}
          >
            Complete pulse (+10 XP · UTC day)
          </Button>
        </div>

        <div className="space-y-2">
          {QUESTS.map((q) => {
            const done = progress?.questsCompleted.includes(q.id) ?? false;
            return (
              <div
                key={q.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2"
              >
                <span className="text-sm text-foreground">{q.label}</span>
                <Button
                  type="button"
                  size="sm"
                  variant={done ? "outline" : "secondary"}
                  disabled={done}
                  onClick={() => onQuest(q.id, q.xp)}
                >
                  {done ? "Done" : `+${q.xp} XP`}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[10px] text-center text-muted-foreground">
        Campaign owner tools:{" "}
        <Link to="/admin" className="text-neon underline">
          /admin
        </Link>
      </p>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass rounded-xl p-4 flex items-center gap-3">
      <div className="rounded-lg bg-secondary p-2">{icon}</div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="font-heading font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}
