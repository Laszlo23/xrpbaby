"use client";

import { useCallback, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLinkedWalletAddress } from "@/hooks/useLinkedWalletAddress";
import { usePointsSiweSign } from "@/hooks/usePointsSiweSign";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { farcasterFollowProfileUrl } from "@/lib/community-links";
import { getPublicAppOrigin } from "@/lib/app-origin";
import { warpcastComposeUrl, twitterIntentUrl } from "@/lib/campaign-share";
import {
  postCompleteFarcasterSocialTask,
  postCompleteSocialShareStory,
  postCompleteXProofTask,
} from "@/lib/points-fns";
import {
  EFFORT_TIER_HINT,
  farcasterShareComposeUrl,
  farcasterTagHandle,
  xShareComposeUrl,
  xTagHandles,
  type SocialShareBreakdownDisplay,
} from "@/lib/social/share-quest-config";
import { buildXIntentUrls, extractTweetIdFromUrl } from "@/lib/twitter-intents";
import { cn } from "@/lib/utils";

type Tab = "farcaster" | "x";

function formatXProofError(code?: string): string {
  switch (code) {
    case "x_api_unconfigured":
      return "X target post is not configured on the server.";
    case "x_verify_failed":
      return "We could not verify that tweet yet. Wait a minute and paste your tweet URL.";
    case "x_proof_tweet_not_found":
      return "Tweet not found — check the URL is public.";
    default:
      return code ?? "Could not verify";
  }
}

type Props = {
  completedSlugs: string[];
  onClaimed?: () => void;
  className?: string;
  /** Pre-fill compose text for episode-specific shares. */
  shareComposeOverride?: { farcaster: string; x: string };
};

export function SocialAmplifyPanel({
  completedSlugs,
  onClaimed,
  className,
  shareComposeOverride,
}: Props) {
  const address = useLinkedWalletAddress();
  const isConnected = Boolean(address);
  const { signSiwe, signing: siweSigning } = usePointsSiweSign();
  const completeFarcaster = useServerFn(postCompleteFarcasterSocialTask);
  const completeXProof = useServerFn(postCompleteXProofTask);
  const completeShareStory = useServerFn(postCompleteSocialShareStory);

  const [tab, setTab] = useState<Tab>("farcaster");
  const [claiming, setClaiming] = useState(false);
  const [proofReply, setProofReply] = useState("");
  const [proofRetweet, setProofRetweet] = useState("");
  const [proofQuote, setProofQuote] = useState("");
  const [shareProofUrl, setShareProofUrl] = useState("");
  const [sharePlatform, setSharePlatform] = useState<Tab>("farcaster");
  const [lastAward, setLastAward] = useState<SocialShareBreakdownDisplay | null>(null);

  const followProfileUrl = farcasterFollowProfileUrl();
  const targetCastUrl =
    typeof import.meta.env.VITE_FARCASTER_TARGET_CAST_URL === "string"
      ? import.meta.env.VITE_FARCASTER_TARGET_CAST_URL
      : undefined;
  const xTargetRaw =
    typeof import.meta.env.VITE_X_TARGET_POST_URL === "string"
      ? import.meta.env.VITE_X_TARGET_POST_URL
      : undefined;
  const xTweetId = xTargetRaw ? extractTweetIdFromUrl(xTargetRaw) : null;
  const xIntents = buildXIntentUrls(xTweetId);
  const origin = getPublicAppOrigin();
  const shareComposeHref = warpcastComposeUrl(
    shareComposeOverride?.farcaster ??
      `Check out ${BRAND_DISPLAY_NAME} — culture you can prove. ${origin}`,
  );
  const episodeFarcasterHref = shareComposeOverride
    ? warpcastComposeUrl(shareComposeOverride.farcaster)
    : farcasterShareComposeUrl();
  const episodeXHref = shareComposeOverride
    ? twitterIntentUrl(shareComposeOverride.x, origin)
    : xShareComposeUrl();

  const taskDone = useCallback((slug: string) => completedSlugs.includes(slug), [completedSlugs]);
  const claimDisabled = !isConnected || claiming || siweSigning;

  async function requireSiwe() {
    const signed = await signSiwe();
    if (!signed) return null;
    return signed;
  }

  async function claimFarcasterTask(
    taskSlug: "follow-farcaster" | "like-cast-farcaster" | "share-app-farcaster",
  ) {
    setClaiming(true);
    try {
      const signed = await requireSiwe();
      if (!signed) return;
      const res = await completeFarcaster({
        data: { message: signed.prepared, signature: signed.signature, taskSlug },
      });
      if (!res.ok) {
        toast.error(res.error ?? "Verification failed");
        return;
      }
      toast.success(res.alreadyCompleted ? "Already credited" : "Culture Points recorded!");
      onClaimed?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Claim failed");
    } finally {
      setClaiming(false);
    }
  }

  async function claimXTask(
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
      toast.success(res.alreadyCompleted ? "Already credited" : "Culture Points recorded!");
      onClaimed?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Claim failed");
    } finally {
      setClaiming(false);
    }
  }

  async function claimShareStory() {
    const trimmed = shareProofUrl.trim();
    if (!trimmed) {
      toast.error("Paste your post URL after sharing.");
      return;
    }
    setClaiming(true);
    try {
      const signed = await requireSiwe();
      if (!signed) return;
      const res = await completeShareStory({
        data: {
          message: signed.prepared,
          signature: signed.signature,
          proofUrl: trimmed,
          platform: sharePlatform,
        },
      });
      if (!res.ok) {
        toast.error(res.error ?? "Could not verify share");
        return;
      }
      if (res.alreadyCompleted) {
        toast.message("Already earned Culture Value for sharing today");
      } else if (res.cultureValue != null) {
        setLastAward({
          cultureValue: res.cultureValue,
          actionType: res.actionType ?? "original",
          breakdown: res.breakdown as SocialShareBreakdownDisplay["breakdown"],
          agentScored: res.agentScored,
        });
        toast.success(`+${res.cultureValue} Culture Value (${res.actionType})`);
      }
      onClaimed?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Claim failed");
    } finally {
      setClaiming(false);
    }
  }

  const fcHandle = farcasterTagHandle();
  const xHandles = xTagHandles();

  return (
    <section
      id="social"
      className={cn(
        "scroll-mt-24 rounded-2xl border border-[#00E5FF]/20 bg-gradient-to-br from-[#00E5FF]/5 via-black/40 to-[#C5FF41]/5 p-6",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mono-label !text-[#00E5FF]">AMPLIFY</p>
          <h2 className="mt-1 font-display text-xl font-bold text-white">
            Share on Farcaster or X
          </h2>
          <p className="mt-2 max-w-xl text-sm text-zinc-400">
            Tag <strong className="text-zinc-300">@{fcHandle}</strong>
            {xHandles.length > 0 ? (
              <>
                {" "}
                and{" "}
                {xHandles.map((h) => (
                  <strong key={h} className="text-zinc-300">
                    @{h}{" "}
                  </strong>
                ))}
              </>
            ) : null}
            — earn Culture Value based on effort. {EFFORT_TIER_HINT}
          </p>
        </div>
        <Share2 className="h-8 w-8 shrink-0 text-[#00E5FF]/60" aria-hidden />
      </div>

      <div className="mt-6 flex gap-2">
        {(["farcaster", "x"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium capitalize transition",
              tab === t
                ? "bg-[#C5FF41] text-black"
                : "border border-white/10 text-zinc-400 hover:text-white",
            )}
          >
            {t === "farcaster" ? "Farcaster" : "X"}
          </button>
        ))}
      </div>

      {tab === "farcaster" ? (
        <ul className="mt-6 space-y-4">
          <SocialTaskRow
            title="Follow @0xleonardo (+35)"
            done={taskDone("follow-farcaster")}
            detail="Follow BuildingCulture on Warpcast, then verify."
            doHref={followProfileUrl}
            doLabel="Do it"
            onVerify={() => void claimFarcasterTask("follow-farcaster")}
            verifyDisabled={claimDisabled || taskDone("follow-farcaster")}
            claiming={claiming}
          />
          <SocialTaskRow
            title="Like our cast (+25)"
            done={taskDone("like-cast-farcaster")}
            detail="Like the target cast, then verify."
            doHref={targetCastUrl}
            doLabel="Do it"
            onVerify={() => void claimFarcasterTask("like-cast-farcaster")}
            verifyDisabled={claimDisabled || taskDone("like-cast-farcaster")}
            claiming={claiming}
          />
          <SocialTaskRow
            title="Share the app (+40)"
            done={taskDone("share-app-farcaster")}
            detail="Cast with a link to this site."
            doHref={shareComposeHref}
            doLabel="Compose"
            onVerify={() => void claimFarcasterTask("share-app-farcaster")}
            verifyDisabled={claimDisabled || taskDone("share-app-farcaster")}
            claiming={claiming}
          />
        </ul>
      ) : (
        <ul className="mt-6 space-y-4">
          <XProofRow
            title="Reply (+30)"
            done={taskDone("x-reply-official")}
            doHref={xIntents.reply}
            proof={proofReply}
            onProofChange={setProofReply}
            onVerify={() => void claimXTask("x-reply-official", proofReply)}
            verifyDisabled={claimDisabled || taskDone("x-reply-official")}
            claiming={claiming}
          />
          <XProofRow
            title="Repost (+35)"
            done={taskDone("x-retweet-official")}
            doHref={xIntents.retweet}
            proof={proofRetweet}
            onProofChange={setProofRetweet}
            onVerify={() => void claimXTask("x-retweet-official", proofRetweet)}
            verifyDisabled={claimDisabled || taskDone("x-retweet-official")}
            claiming={claiming}
          />
          <XProofRow
            title="Quote (+40)"
            done={taskDone("x-quote-official")}
            doHref={xTweetId ? xIntents.openPost : null}
            proof={proofQuote}
            onProofChange={setProofQuote}
            onVerify={() => void claimXTask("x-quote-official", proofQuote)}
            verifyDisabled={claimDisabled || taskDone("x-quote-official")}
            claiming={claiming}
          />
          {!xTweetId ? (
            <p className="text-xs text-amber-400/90">
              Set VITE_X_TARGET_POST_URL for official post intents.
            </p>
          ) : null}
        </ul>
      )}

      <div className="mt-8 rounded-xl border border-[#C5FF41]/25 bg-black/30 p-5">
        <p className="font-display text-lg font-semibold text-white">
          Share your story — daily quest
        </p>
        <p className="mt-1 text-sm text-zinc-400">
          Original posts and quotes earn the most. Agent review may add a bonus for thoughtful
          posts.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSharePlatform("farcaster")}
            className={cn(
              "rounded-full px-3 py-1 text-xs",
              sharePlatform === "farcaster" ? "bg-white/15 text-white" : "text-zinc-500",
            )}
          >
            Farcaster proof
          </button>
          <button
            type="button"
            onClick={() => setSharePlatform("x")}
            className={cn(
              "rounded-full px-3 py-1 text-xs",
              sharePlatform === "x" ? "bg-white/15 text-white" : "text-zinc-500",
            )}
          >
            X proof
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-full" asChild>
            <a href={episodeFarcasterHref} target="_blank" rel="noreferrer">
              Compose on Farcaster
            </a>
          </Button>
          <Button variant="outline" className="rounded-full" asChild>
            <a href={episodeXHref} target="_blank" rel="noreferrer">
              Compose on X
            </a>
          </Button>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Input
            value={shareProofUrl}
            onChange={(e) => setShareProofUrl(e.target.value)}
            placeholder={
              sharePlatform === "farcaster" ? "https://warpcast.com/…" : "https://x.com/…/status/…"
            }
            className="border-white/10 bg-black/40"
          />
          <Button
            type="button"
            className="shrink-0 rounded-full bg-[#C5FF41] text-black hover:bg-[#b8eb3a]"
            disabled={claimDisabled}
            onClick={() => void claimShareStory()}
          >
            {claiming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Verify & earn Culture Value"
            )}
          </Button>
        </div>

        {lastAward ? (
          <div className="mt-4 rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-zinc-400">
            <p className="font-semibold text-[#C5FF41]">
              +{lastAward.cultureValue} Culture Value · {lastAward.actionType}
              {lastAward.agentScored ? " · agent reviewed" : ""}
            </p>
            <p className="mt-1 font-mono text-[10px] text-zinc-500">
              base {lastAward.breakdown.base} + mentions {lastAward.breakdown.mentions} + link{" "}
              {lastAward.breakdown.link} + hashtag {lastAward.breakdown.hashtag} + length{" "}
              {lastAward.breakdown.length} + media {lastAward.breakdown.media} + agent{" "}
              {lastAward.breakdown.agentBonus}
            </p>
          </div>
        ) : null}
      </div>

      {!isConnected ? (
        <p className="mt-4 text-xs text-zinc-500">
          Connect your wallet to verify and claim social quests.
        </p>
      ) : null}
    </section>
  );
}

function SocialTaskRow({
  title,
  detail,
  done,
  doHref,
  doLabel,
  onVerify,
  verifyDisabled,
  claiming,
}: {
  title: string;
  detail: string;
  done: boolean;
  doHref?: string;
  doLabel: string;
  onVerify: () => void;
  verifyDisabled: boolean;
  claiming: boolean;
}) {
  return (
    <li
      className={cn(
        "flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between",
        done ? "border-emerald-500/25 bg-emerald-500/[0.04]" : "border-white/10 bg-black/25",
      )}
    >
      <div>
        <p className="flex items-center gap-2 font-medium text-white">
          {title}
          {done ? <Check className="h-4 w-4 text-emerald-400" aria-hidden /> : null}
        </p>
        <p className="mt-1 text-sm text-zinc-500">{detail}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {doHref ? (
          <Button variant="outline" size="sm" className="rounded-full" asChild>
            <a href={doHref} target="_blank" rel="noreferrer">
              {doLabel}
            </a>
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="rounded-full"
          disabled={verifyDisabled}
          onClick={onVerify}
        >
          {claiming ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : done ? (
            "Credited"
          ) : (
            "Verify & claim"
          )}
        </Button>
      </div>
    </li>
  );
}

function XProofRow({
  title,
  done,
  doHref,
  proof,
  onProofChange,
  onVerify,
  verifyDisabled,
  claiming,
}: {
  title: string;
  done: boolean;
  doHref: string | null;
  proof: string;
  onProofChange: (v: string) => void;
  onVerify: () => void;
  verifyDisabled: boolean;
  claiming: boolean;
}) {
  return (
    <li
      className={cn(
        "space-y-3 rounded-xl border p-4",
        done ? "border-emerald-500/25 bg-emerald-500/[0.04]" : "border-white/10 bg-black/25",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-medium text-white">
          {title}
          {done ? <Check className="h-4 w-4 text-emerald-400" aria-hidden /> : null}
        </p>
        {doHref ? (
          <Button variant="outline" size="sm" className="rounded-full" asChild>
            <a href={doHref} target="_blank" rel="noreferrer">
              Do it
            </a>
          </Button>
        ) : null}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={proof}
          onChange={(e) => onProofChange(e.target.value)}
          placeholder="Paste your tweet URL"
          className="border-white/10 bg-black/40 text-sm"
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="shrink-0 rounded-full"
          disabled={verifyDisabled}
          onClick={onVerify}
        >
          {claiming ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : done ? (
            "Credited"
          ) : (
            "Verify & claim"
          )}
        </Button>
      </div>
    </li>
  );
}
