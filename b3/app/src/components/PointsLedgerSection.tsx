import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useAccount } from "wagmi";
import { Check, Loader2, MessageSquareQuote, Shield } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  postCompleteFarcasterSocialTask,
  postCompleteTaskWithSiwe,
  postCompleteTelegramProofTask,
  postCompleteXProofTask,
  postPointsBalance,
} from "@/lib/points-fns";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { communityTelegramUrl, farcasterFollowProfileUrl } from "@/lib/community-links";
import { getPublicAppOrigin } from "@/lib/app-origin";
import { warpcastComposeUrl } from "@/lib/campaign-share";
import { buildXIntentUrls, extractTweetIdFromUrl } from "@/lib/twitter-intents";
import { DailyOnChainCheckIn } from "@/components/DailyOnChainCheckIn";
import { usePointsSiweSign } from "@/hooks/usePointsSiweSign";
import { SupportScorePanel } from "@/components/SupportScorePanel";
import { SupportSuggestions } from "@/components/SupportSuggestions";
import { SupporterLeaderboard } from "@/components/SupporterLeaderboard";
import { ConnectFarcasterButton } from "@bc/culture-auth/react";
import { NeynarConnectBoundary } from "@/components/NeynarConnectBoundary";
import { Input } from "@/components/ui/input";
import { PointsRedeemSection } from "@/components/PointsRedeemSection";

function formatXProofError(code?: string): string {
  switch (code) {
    case "x_api_unconfigured":
      return "X target post is not configured on the server — try again after the next deploy.";
    case "x_verify_failed":
      return "We could not verify that tweet yet. Use the Do it intent, wait a minute, then paste your tweet URL.";
    case "x_proof_tweet_not_found":
      return "Tweet not found — check the URL is public and uses x.com/…/status/…";
    default:
      return code ?? "Could not verify";
  }
}

export function PointsLedgerSection() {
  const { address, isConnected } = useAccount();
  const { signSiwe, signing: siweSigning } = usePointsSiweSign();
  const fetchBalance = useServerFn(postPointsBalance);
  const completeTask = useServerFn(postCompleteTaskWithSiwe);
  const completeFarcasterTask = useServerFn(postCompleteFarcasterSocialTask);
  const completeXProof = useServerFn(postCompleteXProofTask);
  const completeTelegramProof = useServerFn(postCompleteTelegramProofTask);

  const followProfileUrl = farcasterFollowProfileUrl();
  const telegramInviteUrl = communityTelegramUrl();
  const targetCastUrl =
    typeof import.meta.env.VITE_FARCASTER_TARGET_CAST_URL === "string"
      ? import.meta.env.VITE_FARCASTER_TARGET_CAST_URL
      : undefined;

  const xTargetRaw =
    typeof import.meta.env.VITE_X_TARGET_POST_URL === "string"
      ? import.meta.env.VITE_X_TARGET_POST_URL
      : "";
  const xTweetId = extractTweetIdFromUrl(xTargetRaw);
  const xIntents = buildXIntentUrls(xTweetId);

  const [proofReply, setProofReply] = useState("");
  const [proofRetweet, setProofRetweet] = useState("");
  const [proofQuote, setProofQuote] = useState("");
  const [proofTelegram, setProofTelegram] = useState("");

  const [balance, setBalance] = useState<number | null>(null);
  const [completedSlugs, setCompletedSlugs] = useState<string[]>([]);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [backendDown, setBackendDown] = useState(false);

  const taskDone = useCallback((slug: string) => completedSlugs.includes(slug), [completedSlugs]);
  const claimDisabled = claiming || siweSigning;

  async function requireSiwe() {
    const signed = await signSiwe();
    if (!signed) {
      toast.error("Wallet signature required — connect on Base and approve the sign-in prompt.");
    }
    return signed;
  }

  const refresh = useCallback(async () => {
    if (!address) return;
    setBalanceLoading(true);
    try {
      const r = await fetchBalance({ data: { address } });
      if (!r.ok && r.reason === "no_database") {
        setBackendDown(true);
        setBalance(null);
        setCompletedSlugs([]);
        return;
      }
      setBackendDown(false);
      setBalance(r.balance);
      setCompletedSlugs(r.completedSlugs ?? []);
    } catch {
      setBackendDown(true);
    } finally {
      setBalanceLoading(false);
    }
  }, [address, fetchBalance]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function claimVisitMarketplaceTask() {
    setClaiming(true);
    try {
      const signed = await requireSiwe();
      if (!signed) return;
      const res = await completeTask({
        data: {
          message: signed.prepared,
          signature: signed.signature,
          taskSlug: "visit-marketplace",
        },
      });
      if (!res.ok) {
        toast.error(res.error ?? "Could not record points");
        return;
      }
      if (res.alreadyCompleted) {
        toast.message("Already credited for this task");
      } else {
        toast.success("Points recorded");
      }
      setBalance(res.balance);
      setCompletedSlugs((prev) => [...new Set([...prev, "visit-marketplace"])]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign failed");
    } finally {
      setClaiming(false);
    }
  }

  async function claimConnectTask() {
    setClaiming(true);
    try {
      const signed = await requireSiwe();
      if (!signed) return;
      const res = await completeTask({
        data: {
          message: signed.prepared,
          signature: signed.signature,
          taskSlug: "connect-wallet",
        },
      });
      if (!res.ok) {
        toast.error(res.error ?? "Could not record points");
        return;
      }
      if (res.alreadyCompleted) {
        toast.message("Already credited for this task");
      } else {
        toast.success("Points recorded");
      }
      setBalance(res.balance);
      setCompletedSlugs((prev) => [...new Set([...prev, "connect-wallet"])]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign failed");
    } finally {
      setClaiming(false);
    }
  }

  async function claimXProofTask(
    taskSlug: "x-reply-official" | "x-retweet-official" | "x-quote-official",
    proofUrl: string,
  ) {
    const trimmed = proofUrl.trim();
    if (!trimmed) {
      toast.error("Paste your tweet URL after completing the action.");
      return;
    }
    setClaiming(true);
    try {
      const signed = await requireSiwe();
      if (!signed) return;
      const res = await completeXProof({
        data: {
          message: signed.prepared,
          signature: signed.signature,
          taskSlug,
          proofUrl: trimmed,
        },
      });
      if (!res.ok) {
        toast.error(formatXProofError(res.error));
        return;
      }
      if (res.alreadyCompleted) {
        toast.message("Already credited for this task");
      } else {
        toast.success("Points recorded");
      }
      setBalance(res.balance);
      setCompletedSlugs((prev) => [...new Set([...prev, taskSlug])]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Claim failed");
    } finally {
      setClaiming(false);
    }
  }

  async function claimTelegramTask(proofUrl: string) {
    const trimmed = proofUrl.trim();
    if (!trimmed) {
      toast.error("Paste a Telegram proof link (e.g. t.me/…).");
      return;
    }
    setClaiming(true);
    try {
      const signed = await requireSiwe();
      if (!signed) return;
      const res = await completeTelegramProof({
        data: {
          message: signed.prepared,
          signature: signed.signature,
          taskSlug: "telegram-join-buildingculture",
          proofUrl: trimmed,
        },
      });
      if (!res.ok) {
        toast.error(res.error ?? "Could not verify");
        return;
      }
      if (res.alreadyCompleted) {
        toast.message("Already credited for this task");
      } else {
        toast.success("Points recorded");
      }
      setBalance(res.balance);
      setCompletedSlugs((prev) => [...new Set([...prev, "telegram-join-buildingculture"])]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Claim failed");
    } finally {
      setClaiming(false);
    }
  }

  async function claimFarcasterTask(
    taskSlug: "follow-farcaster" | "like-cast-farcaster" | "share-app-farcaster",
  ) {
    setClaiming(true);
    try {
      const signed = await requireSiwe();
      if (!signed) return;
      const res = await completeFarcasterTask({
        data: {
          message: signed.prepared,
          signature: signed.signature,
          taskSlug,
        },
      });
      if (!res.ok) {
        toast.error(res.error ?? "Verification failed");
        return;
      }
      if (res.alreadyCompleted) {
        toast.message("Already credited for this task");
      } else {
        toast.success("Points recorded");
      }
      setBalance(res.balance);
      setCompletedSlugs((prev) => [...new Set([...prev, taskSlug])]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Claim failed");
    } finally {
      setClaiming(false);
    }
  }

  const shareComposeHref = warpcastComposeUrl(
    `Building with ${BRAND_DISPLAY_NAME} — ${getPublicAppOrigin()}/`,
  );

  if (!isConnected || !address) {
    return (
      <section className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 md:p-10">
        <div className="flex items-start gap-3">
          <Shield className="mt-1 h-6 w-6 shrink-0 text-[var(--base-blue)]" aria-hidden />
          <div className="space-y-2">
            <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
              {BRAND_DISPLAY_NAME} points
            </h2>
            <p className="text-sm text-zinc-500">
              Connect a wallet to load your ledger balance and claim SIWE tasks.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (backendDown) {
    return (
      <section className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 md:p-10">
        <div className="flex items-start gap-3">
          <Shield className="mt-1 h-6 w-6 shrink-0 text-zinc-600" aria-hidden />
          <div className="space-y-2">
            <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
              {BRAND_DISPLAY_NAME} points
            </h2>
            <p className="text-sm text-zinc-500">
              Points database not configured. Set{" "}
              <span className="font-mono text-xs">DATABASE_URL</span> (Postgres) on the server and
              run <span className="font-mono text-xs">npx prisma migrate deploy</span>.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 md:p-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Shield className="mt-1 h-6 w-6 shrink-0 text-[var(--base-blue)]" aria-hidden />
          <div className="space-y-2">
            <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
              {BRAND_DISPLAY_NAME} points
            </h2>
            <p className="text-sm text-zinc-500">
              Server-backed ledger for supporters and future rewards. We&apos;re in an active{" "}
              <strong className="text-zinc-300">fundraising &amp; growth</strong> phase — social
              tasks below help spread the story and credit early believers. Sign once per task with
              SIWE (same wallet as connected).
            </p>
            <p className="font-mono text-2xl font-semibold text-neon tabular-nums">
              {balanceLoading && balance === null ? (
                <span className="inline-flex items-center gap-2 text-sm text-zinc-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                </span>
              ) : (
                <>{balance ?? 0} pts</>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <Button
            type="button"
            variant={taskDone("connect-wallet") ? "outline" : "secondary"}
            size="sm"
            disabled={claimDisabled || taskDone("connect-wallet")}
            className="rounded-full border-emerald-500/30"
            onClick={() => void claimConnectTask()}
          >
            {taskDone("connect-wallet") ? (
              <span className="inline-flex items-center gap-2 text-emerald-400">
                <Check className="h-4 w-4 shrink-0" aria-hidden />
                Wallet connected (+25)
              </span>
            ) : siweSigning ? (
              "Signing…"
            ) : (
              "Sign for connect bonus (+25)"
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-zinc-500"
            onClick={() => void refresh()}
          >
            Refresh balance
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
        <p className="mono-label text-zinc-500">Redeem for BCC</p>
        <div className="mt-3">
          <PointsRedeemSection />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-[rgb(212_175_55/0.22)] bg-gradient-to-br from-[rgb(212_175_55/0.07)] via-black/50 to-black/80 p-5 md:p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--vault-gold)]">
          Fundraising season · long-term build
        </p>
        <p className="mt-2 font-heading text-base font-semibold text-white md:text-lg">
          This is not a one-day launch — it&apos;s how we operate
        </p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400">
          {BRAND_DISPLAY_NAME} is raising and growing in public: drops, vault assets, and product
          ship on a continuous rhythm. Social quests exist to{" "}
          <strong className="text-zinc-200">fund visibility and community</strong> while we build —
          not as a stunt. Points record who showed up early; we keep shipping because{" "}
          <strong className="text-zinc-200">progress never stops</strong> — that&apos;s the mindset
          behind everything here.
        </p>
      </div>

      <div className="mt-8 border-t border-white/10 pt-8 space-y-10">
        <div className="space-y-5">
          <div>
            <h3 className="font-heading text-lg font-semibold text-white md:text-xl">
              Starter quest
            </h3>
            <p className="mt-2 max-w-2xl text-sm text-zinc-500">
              Open <strong className="text-zinc-300">Project shares</strong>, then sign once — same
              ledger we use as we fundraise and ship new pools.
            </p>
          </div>
          <div
            className={`flex flex-col gap-5 rounded-3xl border p-5 md:flex-row md:items-center md:justify-between md:p-7 ${
              taskDone("visit-marketplace")
                ? "border-emerald-500/25 bg-emerald-500/[0.04]"
                : "border-white/[0.08] bg-black/25"
            }`}
          >
            <div className="min-w-0 flex-1 space-y-1">
              <p className="flex flex-wrap items-center gap-2 text-lg font-semibold text-white md:text-xl">
                Visit marketplace (+15)
                {taskDone("visit-marketplace") ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                    <Check className="h-3.5 w-3.5" aria-hidden /> Done
                  </span>
                ) : null}
              </p>
              <p className="text-sm text-zinc-400">
                Browse listings, then claim — points are stored with your wallet address.
              </p>
            </div>
            <div className="flex flex-shrink-0 flex-wrap gap-3">
              <Button variant="outline" className="min-h-11 rounded-full px-6" asChild>
                <Link to="/marketplace">Open marketplace</Link>
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="min-h-11 rounded-full px-6"
                disabled={claimDisabled || taskDone("visit-marketplace")}
                onClick={() => void claimVisitMarketplaceTask()}
              >
                {taskDone("visit-marketplace") ? "Credited" : "Sign & claim (+15)"}
              </Button>
            </div>
          </div>
        </div>

        <div
          className="flex flex-col gap-5 rounded-3xl border border-[rgb(212_175_55/0.25)] bg-gradient-to-br from-[rgb(212_175_55/0.06)] to-black/40 p-5 md:flex-row md:items-center md:justify-between md:p-7"
        >
          <div className="min-w-0 flex-1 space-y-1">
            <p className="flex flex-wrap items-center gap-2 text-lg font-semibold text-white md:text-xl">
              <MessageSquareQuote className="h-5 w-5 text-gold-400" aria-hidden />
              Builder Voice (+5–75)
            </p>
            <p className="text-sm text-zinc-400">
              Submit specific product feedback — praise-only replies don&apos;t qualify. Useful and
              Gold tiers are reviewed by the team within 7 days.
            </p>
          </div>
          <Button variant="secondary" className="min-h-11 shrink-0 rounded-full px-6" asChild>
            <Link to="/voice">Open Builder Voice</Link>
          </Button>
        </div>

        <DailyOnChainCheckIn
          signSiwe={signSiwe}
          signingDisabled={claimDisabled}
          onBalance={(b) => setBalance(b)}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <NeynarConnectBoundary>
            <ConnectFarcasterButton
              label="Link Farcaster for verified quests"
              onLinked={() => void refresh()}
            />
          </NeynarConnectBoundary>
          <SupportScorePanel />
          <SupportSuggestions />
          <SupporterLeaderboard />
        </div>

        <div className="space-y-5">
          <div>
            <h3 className="font-heading text-lg font-semibold text-white md:text-xl">
              Farcaster · grow the round
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
              Link Farcaster above, then follow, like, and cast to help people discover{" "}
              {BRAND_DISPLAY_NAME} while we&apos;re in active fundraising — each step is a real
              signal, not throwaway engagement. Tap <strong className="text-zinc-300">Do it</strong>
              , finish in Warpcast, then{" "}
              <strong className="text-zinc-300">Verify &amp; claim</strong>. Your wallet must appear
              as a <strong className="text-zinc-300">verified address</strong> on your Farcaster
              profile so we can match you fairly.
            </p>
          </div>

          <ul className="space-y-5">
            <li
              className={`flex flex-col gap-5 rounded-3xl border p-5 md:flex-row md:items-center md:justify-between md:p-7 ${
                taskDone("follow-farcaster")
                  ? "border-emerald-500/25 bg-emerald-500/[0.04]"
                  : "border-white/[0.08] bg-black/25"
              }`}
            >
              <div className="min-w-0 flex-1 space-y-1">
                <p className="flex flex-wrap items-center gap-2 text-lg font-semibold text-white md:text-xl">
                  Follow us (+35)
                  {taskDone("follow-farcaster") ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                      <Check className="h-3.5 w-3.5" aria-hidden /> Done
                    </span>
                  ) : null}
                </p>
                <p className="text-sm text-zinc-400">
                  Follow <strong className="text-zinc-300">@0xleonardo</strong> (BuildingCulture),
                  then verify — server resolves{" "}
                  <span className="font-mono text-xs text-zinc-500">FARCASTER_FOLLOW_URL</span> /
                  Neynar.
                </p>
              </div>
              <div className="flex flex-shrink-0 flex-wrap gap-3">
                <Button variant="outline" className="min-h-11 rounded-full px-6" asChild>
                  <a href={followProfileUrl} target="_blank" rel="noreferrer">
                    Do it
                  </a>
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-11 rounded-full px-6"
                  disabled={claimDisabled || taskDone("follow-farcaster")}
                  onClick={() => void claimFarcasterTask("follow-farcaster")}
                >
                  {taskDone("follow-farcaster") ? "Credited" : "Verify & claim"}
                </Button>
              </div>
            </li>

            <li
              className={`flex flex-col gap-5 rounded-3xl border p-5 md:flex-row md:items-center md:justify-between md:p-7 ${
                taskDone("like-cast-farcaster")
                  ? "border-emerald-500/25 bg-emerald-500/[0.04]"
                  : "border-white/[0.08] bg-black/25"
              }`}
            >
              <div className="min-w-0 flex-1 space-y-1">
                <p className="flex flex-wrap items-center gap-2 text-lg font-semibold text-white md:text-xl">
                  Like our cast (+25)
                  {taskDone("like-cast-farcaster") ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                      <Check className="h-3.5 w-3.5" aria-hidden /> Done
                    </span>
                  ) : null}
                </p>
                <p className="text-sm text-zinc-400">
                  {targetCastUrl
                    ? "Like the target cast, then verify."
                    : "Like the latest cast from @0xleonardo (auto-resolved via Neynar), then verify."}
                </p>
              </div>
              <div className="flex flex-shrink-0 flex-wrap gap-3">
                {targetCastUrl ? (
                  <Button variant="outline" className="min-h-11 rounded-full px-6" asChild>
                    <a href={targetCastUrl} target="_blank" rel="noreferrer">
                      Do it
                    </a>
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-11 rounded-full px-6"
                  disabled={claimDisabled || taskDone("like-cast-farcaster")}
                  onClick={() => void claimFarcasterTask("like-cast-farcaster")}
                >
                  {taskDone("like-cast-farcaster") ? "Credited" : "Verify & claim"}
                </Button>
              </div>
            </li>

            <li
              className={`flex flex-col gap-5 rounded-3xl border p-5 md:flex-row md:items-center md:justify-between md:p-7 ${
                taskDone("share-app-farcaster")
                  ? "border-emerald-500/25 bg-emerald-500/[0.04]"
                  : "border-white/[0.08] bg-black/25"
              }`}
            >
              <div className="min-w-0 flex-1 space-y-1">
                <p className="flex flex-wrap items-center gap-2 text-lg font-semibold text-white md:text-xl">
                  Share the app (+40)
                  {taskDone("share-app-farcaster") ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                      <Check className="h-3.5 w-3.5" aria-hidden /> Done
                    </span>
                  ) : null}
                </p>
                <p className="text-sm text-zinc-400">
                  Cast something that links to this site (embed URL or mention your domain). Uses{" "}
                  <span className="font-mono text-xs text-zinc-500">NEYNAR_SHARE_HOST</span> or your
                  deployed hostname.
                </p>
              </div>
              <div className="flex flex-shrink-0 flex-wrap gap-3">
                <Button variant="outline" className="min-h-11 rounded-full px-6" asChild>
                  <a href={shareComposeHref} target="_blank" rel="noreferrer">
                    Compose in Warpcast
                  </a>
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-11 rounded-full px-6"
                  disabled={claimDisabled || taskDone("share-app-farcaster")}
                  onClick={() => void claimFarcasterTask("share-app-farcaster")}
                >
                  {taskDone("share-app-farcaster") ? "Credited" : "Verify & claim"}
                </Button>
              </div>
            </li>
          </ul>
        </div>

        <div className="space-y-5">
          <div>
            <h3 className="font-heading text-lg font-semibold text-white md:text-xl">
              X · amplify the story
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
              Reply, repost, and quote our official posts so the raise and roadmap reach people off
              Farcaster — sustained visibility matters while we keep building. Ops: set{" "}
              <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-xs text-zinc-300">
                VITE_X_TARGET_POST_URL
              </span>{" "}
              to an <code className="text-xs text-zinc-500">x.com/…/status/…</code> link. Use{" "}
              <strong className="text-zinc-300">Do it</strong> for intents, then paste{" "}
              <strong className="text-zinc-300">your</strong> tweet URL as proof.
            </p>

            {xTweetId && xTargetRaw ? (
              <p className="mt-3 text-sm text-zinc-500">
                Official post:{" "}
                <a
                  href={xTargetRaw.split("?")[0]}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--base-blue)] underline underline-offset-2"
                >
                  view on X
                </a>
              </p>
            ) : (
              <p className="mt-3 text-sm text-amber-400/90">
                Add VITE_X_TARGET_POST_URL so X intents target our fundraising posts.
              </p>
            )}
          </div>

          <ul className="space-y-5">
            <li
              className={`space-y-4 rounded-3xl border p-5 md:p-7 ${
                taskDone("x-reply-official")
                  ? "border-emerald-500/25 bg-emerald-500/[0.04]"
                  : "border-white/[0.08] bg-black/25"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="flex flex-wrap items-center gap-2 text-lg font-semibold text-white md:text-xl">
                    Reply (+30)
                    {taskDone("x-reply-official") ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                        <Check className="h-3.5 w-3.5" aria-hidden /> Done
                      </span>
                    ) : null}
                  </p>
                  <p className="text-sm text-zinc-400">Opens reply intent with #BuildCulture.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {xIntents.reply ? (
                    <Button variant="outline" className="min-h-11 rounded-full px-6" asChild>
                      <a href={xIntents.reply} target="_blank" rel="noreferrer">
                        Do it
                      </a>
                    </Button>
                  ) : null}
                </div>
              </div>
              <Input
                placeholder="https://x.com/yourhandle/status/…"
                value={proofReply}
                onChange={(e) => setProofReply(e.target.value)}
                className="h-12 bg-black/40 border-white/10 text-base"
              />
              <Button
                type="button"
                variant="secondary"
                className="min-h-11 rounded-full px-6"
                disabled={claimDisabled || taskDone("x-reply-official")}
                onClick={() => void claimXProofTask("x-reply-official", proofReply)}
              >
                {taskDone("x-reply-official") ? "Credited" : "Verify & claim"}
              </Button>
            </li>

            <li
              className={`space-y-4 rounded-3xl border p-5 md:p-7 ${
                taskDone("x-retweet-official")
                  ? "border-emerald-500/25 bg-emerald-500/[0.04]"
                  : "border-white/[0.08] bg-black/25"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="flex flex-wrap items-center gap-2 text-lg font-semibold text-white md:text-xl">
                    Repost (+35)
                    {taskDone("x-retweet-official") ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                        <Check className="h-3.5 w-3.5" aria-hidden /> Done
                      </span>
                    ) : null}
                  </p>
                  <p className="text-sm text-zinc-400">Opens official repost intent.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {xIntents.retweet ? (
                    <Button variant="outline" className="min-h-11 rounded-full px-6" asChild>
                      <a href={xIntents.retweet} target="_blank" rel="noreferrer">
                        Do it
                      </a>
                    </Button>
                  ) : null}
                  {xIntents.openPost ? (
                    <Button variant="ghost" className="min-h-11 rounded-full px-6" asChild>
                      <a href={xIntents.openPost} target="_blank" rel="noreferrer">
                        Open post
                      </a>
                    </Button>
                  ) : null}
                </div>
              </div>
              <Input
                placeholder="Paste your repost permalink (x.com/…/status/…)"
                value={proofRetweet}
                onChange={(e) => setProofRetweet(e.target.value)}
                className="h-12 bg-black/40 border-white/10 text-base"
              />
              <Button
                type="button"
                variant="secondary"
                className="min-h-11 rounded-full px-6"
                disabled={claimDisabled || taskDone("x-retweet-official")}
                onClick={() => void claimXProofTask("x-retweet-official", proofRetweet)}
              >
                {taskDone("x-retweet-official") ? "Credited" : "Verify & claim"}
              </Button>
            </li>

            <li
              className={`space-y-4 rounded-3xl border p-5 md:p-7 ${
                taskDone("x-quote-official")
                  ? "border-emerald-500/25 bg-emerald-500/[0.04]"
                  : "border-white/[0.08] bg-black/25"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="flex flex-wrap items-center gap-2 text-lg font-semibold text-white md:text-xl">
                    Quote post (+40)
                    {taskDone("x-quote-official") ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                        <Check className="h-3.5 w-3.5" aria-hidden /> Done
                      </span>
                    ) : null}
                  </p>
                  <p className="text-sm text-zinc-400">
                    Open the post, quote it with your take, then paste proof.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {xIntents.openPost ? (
                    <Button variant="outline" className="min-h-11 rounded-full px-6" asChild>
                      <a href={xIntents.openPost} target="_blank" rel="noreferrer">
                        Do it
                      </a>
                    </Button>
                  ) : null}
                </div>
              </div>
              <Input
                placeholder="Paste your quote tweet URL"
                value={proofQuote}
                onChange={(e) => setProofQuote(e.target.value)}
                className="h-12 bg-black/40 border-white/10 text-base"
              />
              <Button
                type="button"
                variant="secondary"
                className="min-h-11 rounded-full px-6"
                disabled={claimDisabled || taskDone("x-quote-official")}
                onClick={() => void claimXProofTask("x-quote-official", proofQuote)}
              >
                {taskDone("x-quote-official") ? "Credited" : "Verify & claim"}
              </Button>
            </li>
          </ul>
        </div>

        <div className="space-y-5">
          <div>
            <h3 className="font-heading text-lg font-semibold text-white md:text-xl">
              Telegram · stay close to the raise
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
              The group is where we share funding milestones, ship notes, and what&apos;s next —{" "}
              <strong className="text-zinc-300">we&apos;re in this for the long haul</strong>, not a
              quick flip. Join <strong className="text-zinc-300">BuildingCulture</strong>, then
              paste a <span className="font-mono text-xs text-zinc-500">t.me</span> proof link
              (invite, share message, or permalink).
            </p>
          </div>

          <ul className="space-y-5">
            <li
              className={`space-y-4 rounded-3xl border p-5 md:p-7 ${
                taskDone("telegram-join-buildingculture")
                  ? "border-emerald-500/25 bg-emerald-500/[0.04]"
                  : "border-white/[0.08] bg-black/25"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="flex flex-wrap items-center gap-2 text-lg font-semibold text-white md:text-xl">
                    Join Telegram (+45)
                    {taskDone("telegram-join-buildingculture") ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                        <Check className="h-3.5 w-3.5" aria-hidden /> Done
                      </span>
                    ) : null}
                  </p>
                  <p className="text-sm text-zinc-400">
                    Opens our invite. After joining, paste any Telegram share URL you get from the
                    app.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" className="min-h-11 rounded-full px-6" asChild>
                    <a href={telegramInviteUrl} target="_blank" rel="noreferrer">
                      Join group
                    </a>
                  </Button>
                </div>
              </div>
              <Input
                placeholder="https://t.me/…"
                value={proofTelegram}
                onChange={(e) => setProofTelegram(e.target.value)}
                className="h-12 bg-black/40 border-white/10 text-base"
              />
              <Button
                type="button"
                variant="secondary"
                className="min-h-11 rounded-full px-6"
                disabled={claimDisabled || taskDone("telegram-join-buildingculture")}
                onClick={() => void claimTelegramTask(proofTelegram)}
              >
                {taskDone("telegram-join-buildingculture") ? "Credited" : "Verify & claim"}
              </Button>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
