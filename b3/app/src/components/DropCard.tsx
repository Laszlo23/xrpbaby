import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link, useNavigate } from "@tanstack/react-router";
import { CountdownTimer } from "./CountdownTimer";
import { Ticket, Users, Loader2, BookOpen, Home, Palette, Sparkles, Share2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Address } from "viem";
import { formatEther, parseEther } from "viem";
import {
  useAccount,
  useChainId,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { raffleCampaignAbi } from "@bc/contracts-sdk";
import { BCD_SYMBOL, getBcdPerWholeEth, showLegacyEthSettlement } from "@/lib/bcd-config";
import { formatEthWeiAsBcd } from "@/lib/bcd-price";
import { explorerTxUrl } from "@/lib/explorer";
import { grantFirstMintBonus, loadProgress } from "@/lib/playerProgress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { captureMintClicked, captureMintConfirmed, captureShareClicked } from "@/lib/analytics";
import { postCreditRaffleReferralMint } from "@/lib/raffle-referral-fns";
import { buildDropShareUrl, getStoredRaffleReferrer } from "@/lib/raffle-referral";
import { warpcastComposeUrl } from "@/lib/campaign-share";

type WinnerMode = "one" | "limited";

type StaticCoverKind = "stay" | "art" | "venue";

interface DropCardProps {
  title: string;
  artist: string;
  /** Reserve / story label when no live pricing */
  assetValueLabel: string;
  /** Hero overlay on media, e.g. WORTH €10K+ */
  worthLabel?: string;
  winnerMode?: WinnerMode;
  winnerCopy?: string;
  /** Story/detail route */
  slug?: string;
  image: string;
  /** Drop lore shown under the artist line */
  story?: string;
  endsAt: Date;
  rarity: "common" | "rare" | "legendary";
  /** Live campaign; omit for demo-only card */
  campaignAddress?: Address;
  /** Demo mode: static counts when `campaignAddress` unset */
  ticketsSold?: number;
  totalTickets?: number;
  ticketPriceLabel?: string;
  /** When true, do not autoplay loop video — featured strip already shows this pool’s clip */
  suppressCoverVideo?: boolean;
  /** Optional still image for cover when video is suppressed */
  posterImage?: string;
  /** Gradient/icon fallback when video suppressed and no poster */
  staticCoverKind?: StaticCoverKind;
  /** Horizontal home strip: denser layout, shorter media */
  variant?: "default" | "strip";
}

function oddsHint(mode: WinnerMode, sold: number, total: number): string | null {
  if (total <= 0) return null;
  const remaining = Math.max(0, total - sold);
  if (mode === "one") {
    if (remaining <= 0) return "Pool closed";
    return `~1 : ${remaining}`;
  }
  if (remaining <= 0) return "Pool closed";
  return "Odds tighten as mint fills";
}

const rarityStyles = {
  common: "border-white/[0.06]",
  rare: "border-neon/25 shadow-[0_0_40px_-16px_rgb(0_82_255/35%)]",
  legendary: "border-white/[0.12] shadow-[0_0_48px_-12px_rgb(196_181_253/25%)]",
};

const rarityBadge = {
  common: "bg-secondary text-secondary-foreground",
  rare: "gradient-neon text-neon-foreground",
  legendary: "gradient-gold text-gold-foreground",
};

const phaseLabel = ["Mint open", "Drawing", "Winner picked"] as const;

function isVideoCoverSrc(src: string) {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(src);
}

/** Parse first decimal in a label like "0.05 ETH" for demo BCD display. */
function ethWeiFromTicketLabel(label: string): bigint | undefined {
  const m = label.match(/(\d+(?:\.\d+)?)/);
  if (!m) return undefined;
  try {
    return parseEther(m[1] as `${number}`);
  } catch {
    return undefined;
  }
}

function StaticDropCover({
  title,
  rarity,
  kind,
}: {
  title: string;
  rarity: keyof typeof rarityStyles;
  kind?: StaticCoverKind;
}) {
  const Icon = kind === "art" ? Palette : kind === "venue" ? Sparkles : Home;
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-black/80 via-black/50 to-[rgb(20_20_28)] ${rarity === "legendary" ? "via-violet-950/40" : rarity === "rare" ? "via-blue-950/35" : ""}`}
      aria-hidden
    >
      <Icon className="h-14 w-14 text-[rgb(212_175_55/0.85)]" />
      <p className="max-w-[90%] text-center font-heading text-base font-semibold leading-snug text-white/90 drop-shadow md:text-lg">
        {title}
      </p>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
        Preview in filmstrip above
      </p>
    </div>
  );
}

function DropCoverMedia({ src, title }: { src: string; title: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isVideoCoverSrc(src)) return;
    const el = videoRef.current;
    if (!el) return;
    const kick = () => void el.play().catch(() => {});
    kick();
    el.addEventListener("loadeddata", kick);
    el.addEventListener("canplay", kick);
    return () => {
      el.removeEventListener("loadeddata", kick);
      el.removeEventListener("canplay", kick);
    };
  }, [src]);

  const mediaClass =
    "pointer-events-none absolute inset-0 z-0 h-full w-full min-h-full min-w-full object-cover";

  if (isVideoCoverSrc(src)) {
    return (
      <video
        ref={videoRef}
        src={src}
        className={mediaClass}
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
        aria-label={title}
      />
    );
  }

  return (
    <img
      src={src}
      alt={title}
      className={mediaClass}
      loading="lazy"
      width={800}
      height={600}
      decoding="async"
    />
  );
}

export function DropCard({
  title,
  artist,
  assetValueLabel,
  worthLabel,
  winnerMode = "one",
  winnerCopy,
  slug,
  image,
  story,
  ticketsSold: demoSold = 0,
  totalTickets: demoTotal = 100,
  endsAt,
  rarity,
  campaignAddress,
  ticketPriceLabel = "0.05 ETH",
  suppressCoverVideo = false,
  posterImage,
  staticCoverKind,
  variant = "default",
}: DropCardProps) {
  const strip = variant === "strip";
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [mintOpen, setMintOpen] = useState(false);
  const [qty, setQty] = useState("1");

  const enabled = !!campaignAddress;

  const { data: phase } = useReadContract({
    address: campaignAddress,
    abi: raffleCampaignAbi,
    functionName: "phase",
    query: { enabled },
  });

  const { data: totalSupply, refetch: refetchSupply } = useReadContract({
    address: campaignAddress,
    abi: raffleCampaignAbi,
    functionName: "totalSupply",
    query: { enabled },
  });

  const { data: maxSupply } = useReadContract({
    address: campaignAddress,
    abi: raffleCampaignAbi,
    functionName: "maxSupply",
    query: { enabled },
  });

  const { data: mintPriceWei } = useReadContract({
    address: campaignAddress,
    abi: raffleCampaignAbi,
    functionName: "mintPriceWei",
    query: { enabled },
  });

  const { data: winningTokenId } = useReadContract({
    address: campaignAddress,
    abi: raffleCampaignAbi,
    functionName: "winningTokenId",
    query: { enabled: enabled && phase === 2 },
  });

  const { data: winnerAddr } = useReadContract({
    address: campaignAddress,
    abi: raffleCampaignAbi,
    functionName: "ownerOf",
    args: winningTokenId !== undefined ? [winningTokenId] : undefined,
    query: {
      enabled: enabled && phase === 2 && winningTokenId !== undefined && winningTokenId > 0n,
    },
  });

  const ticketsSold = enabled ? Number(totalSupply ?? 0n) : demoSold;
  const totalTickets = enabled ? Number(maxSupply ?? 0n) : demoTotal;
  const progress = totalTickets > 0 ? (ticketsSold / totalTickets) * 100 : 0;

  const bcdPerEth = getBcdPerWholeEth();
  const legacySettlement = showLegacyEthSettlement();
  const ticketEthWei =
    enabled && mintPriceWei !== undefined ? mintPriceWei : ethWeiFromTicketLabel(ticketPriceLabel);
  const bcdPerTicket =
    ticketEthWei !== undefined ? formatEthWeiAsBcd(ticketEthWei, bcdPerEth) : null;

  const priceDisplay =
    enabled && mintPriceWei !== undefined ? `${formatEther(mintPriceWei)} ETH` : ticketPriceLabel;

  const { writeContract, data: txHash, error: writeError, isPending } = useWriteContract();

  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const creditRaffleReferral = useServerFn(postCreditRaffleReferralMint);

  useEffect(() => {
    if (!writeError) return;
    toast.error(writeError.message.slice(0, 120));
  }, [writeError]);

  useEffect(() => {
    if (!isSuccess || !txHash) return;
    document.documentElement.classList.add("bcd-mint-celebrate");
    const t = window.setTimeout(() => {
      document.documentElement.classList.remove("bcd-mint-celebrate");
    }, 2400);
    return () => {
      window.clearTimeout(t);
      document.documentElement.classList.remove("bcd-mint-celebrate");
    };
  }, [isSuccess, txHash]);

  useEffect(() => {
    if (!isSuccess || !txHash || !address) return;
    captureMintConfirmed({
      drop_slug: slug,
      tx_hash: txHash,
      product: "raffle",
    });
    const ref = getStoredRaffleReferrer();
    if (ref && address && ref.toLowerCase() !== address.toLowerCase()) {
      void creditRaffleReferral({
        data: {
          txHash,
          referrer: ref,
          buyer: address,
        },
      }).catch(() => {});
    }
    void refetchSupply();
    const xpBefore = loadProgress(address).xp;
    const progressAfter = grantFirstMintBonus(address);
    const xpGain = progressAfter.xp - xpBefore;
    toast.success(
      <span>
        You&apos;re in the draw.{" "}
        <a
          href={explorerTxUrl(chainId, txHash)}
          target="_blank"
          rel="noreferrer"
          className="underline font-semibold"
        >
          View tx
        </a>
      </span>,
    );
    if (xpGain > 0) {
      toast.success(`+${xpGain} XP`, { duration: 2800 });
    }
    setMintOpen(false);
    if (slug) {
      void navigate({ to: "/collections", search: { minted: slug } });
    }
  }, [isSuccess, txHash, chainId, refetchSupply, address, slug, creditRaffleReferral, navigate]);

  function onMint() {
    if (!campaignAddress || !mintPriceWei) return;
    const q = Number(qty);
    if (!Number.isFinite(q) || q < 1 || q > 20) {
      toast.error("Quantity must be 1–20.");
      return;
    }
    const value = mintPriceWei * BigInt(q);
    captureMintClicked({
      drop_slug: slug,
      quantity: q,
      price_wei: value.toString(),
      product: "raffle",
    });
    writeContract({
      address: campaignAddress,
      abi: raffleCampaignAbi,
      functionName: "mint",
      args: [BigInt(q)],
      value,
    });
  }

  const phaseIdx = phase !== undefined ? Number(phase) : 0;
  const showPhase = enabled && phase !== undefined;

  const worthOverlay =
    worthLabel ?? `WORTH · ${assetValueLabel.split("·")[0]?.trim() ?? assetValueLabel}`;
  const winLabel = winnerCopy ?? (winnerMode === "one" ? "1 winner only" : "Limited winners");
  const odds = oddsHint(winnerMode, ticketsSold, totalTickets);

  return (
    <>
      <div
        id={slug ? `drop-${slug}` : undefined}
        className={cn(
          "glass flex h-full flex-col overflow-hidden rounded-3xl border transition-transform duration-300",
          strip ? "hover:scale-100" : "hover:scale-[1.01]",
          rarityStyles[rarity],
        )}
      >
        <div
          className={cn(
            "relative w-full shrink-0 overflow-hidden bg-black/40",
            strip ? "aspect-[16/10]" : "aspect-[4/3]",
          )}
        >
          {suppressCoverVideo ? (
            posterImage ? (
              <img
                src={posterImage}
                alt=""
                className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
                loading="lazy"
                width={800}
                height={600}
                decoding="async"
              />
            ) : (
              <StaticDropCover title={title} rarity={rarity} kind={staticCoverKind} />
            )
          ) : (
            <DropCoverMedia src={image} title={title} />
          )}
          <div className="absolute inset-0 z-[1] bg-gradient-to-t from-background via-background/25 to-transparent" />
          <div className="pointer-events-none absolute left-3 top-3 z-[3] max-w-[85%]">
            <p
              className={cn(
                "font-heading font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_24px_rgb(0_0_0/0.85)]",
                strip ? "text-lg md:text-xl" : "text-xl md:text-2xl",
              )}
            >
              <span className="bg-gradient-to-r from-[var(--vault-gold)] via-amber-100 to-[var(--vault-gold)] bg-clip-text text-transparent">
                {worthOverlay}
              </span>
            </p>
            <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[rgb(212_175_55/0.95)]">
              {winLabel}
            </p>
          </div>
          <span
            className={`absolute top-3 right-3 z-[2] rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${rarityBadge[rarity]}`}
          >
            {rarity}
          </span>
          {showPhase && (
            <span className="absolute top-3 left-3 z-[2] rounded-full bg-background/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald">
              {phaseLabel[phaseIdx] ?? "…"}
            </span>
          )}
          <div
            className={cn(
              "absolute bottom-3 left-3 right-3 z-[2]",
              strip && "bottom-2 left-2 right-2",
            )}
          >
            <CountdownTimer targetDate={endsAt} variant="vault" />
          </div>
        </div>

        <div className={cn("flex flex-1 flex-col", strip ? "p-3 pt-3" : "p-4 pt-4")}>
          <div className={cn("flex min-h-0 flex-1 flex-col", strip ? "gap-2" : "gap-3")}>
            <div>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3
                  className={cn(
                    "font-heading line-clamp-2 flex-1 font-bold leading-snug text-foreground",
                    strip ? "text-base" : "min-h-[2.75rem] text-lg",
                  )}
                >
                  {slug ? (
                    <Link
                      to="/drops/$slug"
                      params={{ slug }}
                      className="transition hover:text-[var(--vault-gold)]"
                    >
                      {title}
                    </Link>
                  ) : (
                    title
                  )}
                </h3>
                {slug ? (
                  <Link
                    to="/drops/$slug"
                    params={{ slug }}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/[0.12] bg-black/35 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-zinc-300 transition hover:border-[rgb(212_175_55/0.4)] hover:text-white"
                  >
                    <BookOpen className="h-3 w-3" aria-hidden />
                    Story
                  </Link>
                ) : null}
              </div>
              <p className={cn("text-muted-foreground", strip ? "text-xs" : "text-sm")}>
                by {artist}
              </p>
              {story ? (
                <p
                  className={cn(
                    "mt-2 leading-relaxed text-muted-foreground/95",
                    strip ? "line-clamp-2 text-xs" : "min-h-[6.25rem] line-clamp-5 text-sm",
                  )}
                >
                  {story}
                </p>
              ) : null}
            </div>

            <div className={cn("flex items-center justify-between gap-3", strip && "gap-2")}>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Prize snapshot
                </p>
                <p
                  className={cn(
                    "font-heading font-bold text-emerald text-glow-emerald",
                    strip ? "text-base" : "text-xl",
                  )}
                >
                  {assetValueLabel}
                </p>
              </div>
              <div className="min-w-0 text-right">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Ticket price
                </p>
                {bcdPerTicket !== null ? (
                  <>
                    <p
                      className={cn(
                        "font-heading font-bold text-emerald text-glow-emerald",
                        strip ? "text-base" : "text-lg",
                      )}
                    >
                      ≈ {bcdPerTicket} {BCD_SYMBOL}
                    </p>
                    <p className="text-[10px] text-zinc-500">per ticket (display)</p>
                  </>
                ) : (
                  <p
                    className={cn(
                      "font-heading font-bold text-foreground",
                      strip ? "text-base" : "text-lg",
                    )}
                  >
                    {priceDisplay}
                  </p>
                )}
                {legacySettlement ? (
                  <p className="mt-1 max-w-[14rem] text-[10px] leading-snug text-zinc-600 sm:ml-auto sm:max-w-none">
                    {enabled && mintPriceWei !== undefined
                      ? `${formatEther(mintPriceWei)} ETH · on-chain settlement (native gas token)`
                      : `${ticketPriceLabel} · demo estimate`}
                  </p>
                ) : null}
              </div>
            </div>

            <div className={cn(!strip && "min-h-[2.75rem]", strip && "min-h-0")}>
              {enabled && phase === 2 && winnerAddr ? (
                <p className="text-[11px] leading-snug text-muted-foreground break-all">
                  Winner (ticket #{String(winningTokenId)}):{" "}
                  <span className="font-mono text-neon">{winnerAddr}</span>
                </p>
              ) : null}
            </div>

            <div className={cn("space-y-1.5", strip && "space-y-1")}>
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-medium text-zinc-300">
                  <Ticket className="h-3 w-3 text-[var(--vault-gold)]" />
                  {ticketsSold}/{totalTickets} tickets sold
                </span>
                <span className="flex items-center gap-1 font-medium text-zinc-300">
                  <Users className="h-3 w-3 text-[var(--vault-gold)]" />
                  {enabled ? `${ticketsSold} entries` : `${demoSold} entries`}
                </span>
              </div>
              {odds ? (
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  Odds preview · {odds}
                </p>
              ) : null}
              <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--base-blue-deep)] to-[var(--b3-purple)] transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className={cn("mt-auto pt-1", strip ? "space-y-2" : "space-y-3")}>
              <button
                type="button"
                disabled={!enabled || phaseIdx !== 0 || !isConnected}
                onClick={() => setMintOpen(true)}
                className={cn(
                  "cta-vault-glow w-full rounded-full bg-[var(--b3-purple)] font-medium text-white transition hover:bg-[var(--base-blue-hover)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
                  strip ? "py-2.5 text-sm" : "py-3.5 text-sm",
                )}
              >
                {!enabled ? "Demo drop" : phaseIdx !== 0 ? "Draw closed" : "Enter draw"}
              </button>
              {slug && enabled && isConnected && address ? (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-zinc-300 transition hover:border-[rgb(212_175_55/0.35)] hover:text-white"
                    onClick={() => {
                      captureShareClicked({
                        channel: "warpcast",
                        context: "drop",
                        drop_slug: slug,
                      });
                      const url = buildDropShareUrl(slug, address as `0x${string}`);
                      window.open(
                        warpcastComposeUrl(`🎟 ${title}\n${url}`),
                        "_blank",
                        "noopener,noreferrer",
                      );
                    }}
                  >
                    <Share2 className="h-3 w-3" aria-hidden />
                    Cast ref
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-zinc-300 transition hover:border-[rgb(212_175_55/0.35)] hover:text-white"
                    onClick={async () => {
                      captureShareClicked({
                        channel: "copy",
                        context: "drop",
                        drop_slug: slug,
                      });
                      try {
                        await navigator.clipboard.writeText(
                          buildDropShareUrl(slug, address as `0x${string}`),
                        );
                        toast.success("Referral link copied");
                      } catch {
                        toast.error("Could not copy");
                      }
                    }}
                  >
                    Copy ref link
                  </button>
                </div>
              ) : null}
              <div
                className={cn(
                  "flex items-center justify-center text-center",
                  strip ? "min-h-[2rem]" : "min-h-[2.75rem]",
                )}
              >
                {!enabled ? (
                  <p className="text-[10px] text-muted-foreground">
                    Set <span className="font-mono">VITE_RAFFLE_CAMPAIGN_ADDRESS</span> for live
                    mint.
                  </p>
                ) : !isConnected ? (
                  <p className="text-[10px] text-muted-foreground">Connect a wallet to mint.</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={mintOpen} onOpenChange={setMintOpen}>
        <DialogContent className="glass border-white/[0.08] sm:max-w-md sm:rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-heading">Enter draw</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label className="text-xs text-muted-foreground" htmlFor="qty">
              Quantity (1–20)
            </label>
            <Input
              id="qty"
              inputMode="numeric"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="font-mono"
            />
            {mintPriceWei !== undefined && (
              <div className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <p className="text-sm text-foreground">
                  Total (display):{" "}
                  <span className="font-semibold text-emerald">
                    ≈{" "}
                    {formatEthWeiAsBcd(
                      mintPriceWei * BigInt(Math.max(0, Math.floor(Number(qty) || 0))),
                      bcdPerEth,
                    )}{" "}
                    {BCD_SYMBOL}
                  </span>
                </p>
                {legacySettlement ? (
                  <p className="text-[11px] leading-snug text-zinc-500">
                    Charged on-chain as{" "}
                    <span className="font-mono text-zinc-300">
                      {formatEther(
                        mintPriceWei * BigInt(Math.max(0, Math.floor(Number(qty) || 0))),
                      )}{" "}
                      ETH
                    </span>{" "}
                    until the raffle accepts {BCD_SYMBOL} directly.
                  </p>
                ) : null}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setMintOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isPending || confirming || !address}
              onClick={onMint}
              className="rounded-full bg-[var(--b3-purple)] px-6 text-white hover:bg-[var(--base-blue-hover)]"
            >
              {isPending || confirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirm…
                </>
              ) : (
                "Confirm entry"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
