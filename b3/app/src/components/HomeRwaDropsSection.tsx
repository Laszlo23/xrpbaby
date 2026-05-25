import type { KeyboardEvent } from "react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { useChainId } from "wagmi";
import { getCampaignAddress } from "@/lib/campaign";
import { explorerAddressUrl } from "@/lib/explorer";
import { useGenesisVaultHighestTier } from "@/hooks/useGenesisVaultHighestTier";
import { DropCard } from "@/components/DropCard";
import {
  HOME_FEATURED_DROP_COUNT,
  homeDrops,
  type ExperienceCategory,
  type HomeDrop,
} from "@/content/home-drops";
import { postMergedHomeDrops } from "@/lib/home-drops-merge";
import { cn } from "@/lib/utils";

const CATEGORY_LABEL: Record<ExperienceCategory, string> = {
  stay: "Stay",
  art: "Art",
  venue: "Venue",
};

function storyExcerpt(story: string | undefined, max = 130): string {
  if (!story?.trim()) return "";
  const s = story.trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut) + "…";
}

function isVideoSrc(src: string) {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(src);
}

function filmstripSrc(drop: HomeDrop): string {
  return drop.filmstripVideo ?? drop.image;
}

const TICKET_CAROUSEL_INTERVAL_MS = 5200;
const MD_MIN_WIDTH = 768;

function subscribeMdBreakpoint(cb: () => void) {
  const mq = window.matchMedia(`(min-width: ${MD_MIN_WIDTH}px)`);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getMdBreakpointSnapshot() {
  return (
    typeof window !== "undefined" && window.matchMedia(`(min-width: ${MD_MIN_WIDTH}px)`).matches
  );
}

function getMdBreakpointServerSnapshot() {
  return false;
}

function useDesktopThreeUp() {
  return useSyncExternalStore(
    subscribeMdBreakpoint,
    getMdBreakpointSnapshot,
    getMdBreakpointServerSnapshot,
  );
}

/** Auto-advance carousel: 1 card on mobile, 3 on md+; no scrollbar; arrows, dots, swipe; pauses on hover/focus. */
function TicketPoolsCarousel({ drops }: { drops: HomeDrop[] }) {
  const count = drops.length;
  const isDesktopThreeUp = useDesktopThreeUp();
  const maxIndex = isDesktopThreeUp ? Math.max(0, count - 3) : Math.max(0, count - 1);
  const pages = maxIndex + 1;

  const [activeIndex, setActiveIndex] = useState(0);
  const [pauseHover, setPauseHover] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (pauseHover || reduceMotion || maxIndex <= 0) return;
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, TICKET_CAROUSEL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [pauseHover, reduceMotion, maxIndex]);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i >= maxIndex ? 0 : i + 1));
  }, [maxIndex]);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i <= 0 ? maxIndex : i - 1));
  }, [maxIndex]);

  const trackWidthPercent = isDesktopThreeUp ? (count * 100) / 3 : count * 100;
  const slideShare = 100 / count;

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    },
    [goNext, goPrev],
  );

  return (
    <div className="relative pt-1">
      <div
        ref={regionRef}
        role="region"
        aria-label="Live ticket pools"
        aria-roledescription="carousel"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onMouseEnter={() => setPauseHover(true)}
        onMouseLeave={() => setPauseHover(false)}
        onFocusCapture={() => setPauseHover(true)}
        onBlurCapture={(ev) => {
          if (!regionRef.current?.contains(ev.relatedTarget as Node)) setPauseHover(false);
        }}
        className="ticket-carousel-frame rounded-2xl border border-white/[0.08] bg-black/25 outline-none ring-offset-2 ring-offset-black focus-visible:ring-2 focus-visible:ring-[rgb(212_175_55/0.45)]"
      >
        <div className="overflow-hidden">
          <div
            className={cn(
              "flex",
              !reduceMotion &&
                "transition-transform duration-[680ms] motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]",
            )}
            style={{
              width: `${trackWidthPercent}%`,
              transform: `translateX(-${activeIndex * slideShare}%)`,
            }}
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              if (touchStartX.current == null) return;
              const dx = e.changedTouches[0].clientX - touchStartX.current;
              touchStartX.current = null;
              if (dx < -44) goNext();
              else if (dx > 44) goPrev();
            }}
          >
            {drops.map((drop, slideIdx) => {
              const visibleDesktop = slideIdx >= activeIndex && slideIdx <= activeIndex + 2;
              const ariaHidden = isDesktopThreeUp ? !visibleDesktop : slideIdx !== activeIndex;
              return (
                <div
                  key={drop.slug}
                  className="flex shrink-0 justify-center px-2 py-3 sm:px-3 md:px-2 md:py-3 lg:px-3"
                  style={{ width: `${slideShare}%` }}
                  aria-hidden={ariaHidden}
                >
                  <div className="w-full max-w-[340px] md:max-w-none">
                    <DropCard
                      slug={drop.slug}
                      title={drop.title}
                      artist={drop.artist}
                      assetValueLabel={drop.assetValueLabel}
                      worthLabel={drop.worthLabel}
                      winnerMode={drop.winnerMode}
                      winnerCopy={drop.winnerCopy}
                      image={drop.image}
                      story={drop.story}
                      ticketsSold={drop.ticketsSold}
                      totalTickets={drop.totalTickets}
                      endsAt={drop.endsAt}
                      rarity={drop.rarity}
                      campaignAddress={drop.campaignAddress}
                      posterImage={drop.posterImage}
                      variant="strip"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {maxIndex > 0 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous pool"
              className="absolute left-1 top-1/2 z-[2] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/55 text-zinc-100 shadow-lg backdrop-blur-md transition hover:border-[rgb(212_175_55/0.45)] hover:bg-black/75 hover:text-white active:scale-95 sm:left-2 md:h-11 md:w-11"
            >
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" aria-hidden />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next pool"
              className="absolute right-1 top-1/2 z-[2] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/55 text-zinc-100 shadow-lg backdrop-blur-md transition hover:border-[rgb(212_175_55/0.45)] hover:bg-black/75 hover:text-white active:scale-95 sm:right-2 md:h-11 md:w-11"
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6" aria-hidden />
            </button>
          </>
        ) : null}
      </div>

      {maxIndex > 0 ? (
        <div
          className="mt-4 flex justify-center gap-2"
          role="tablist"
          aria-label="Choose a pool group"
        >
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`${drops[i]?.title ?? "Pool"}, group ${i + 1} of ${pages}`}
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                i === activeIndex
                  ? "w-9 bg-[var(--vault-gold)] motion-safe:animate-pulse"
                  : "w-2 bg-zinc-600 hover:bg-zinc-500",
              )}
              onClick={() => setActiveIndex(i)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FeaturedRwaTile({
  drop,
  excerpt,
  expanded,
  onToggle,
  tileId,
}: {
  drop: HomeDrop;
  excerpt: string;
  expanded: boolean;
  onToggle: () => void;
  tileId: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cat = drop.experienceCategory;
  const stripSrc = filmstripSrc(drop);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !isVideoSrc(stripSrc)) return;
    const kick = () => void el.play().catch(() => {});
    kick();
    el.addEventListener("loadeddata", kick);
    return () => el.removeEventListener("loadeddata", kick);
  }, [stripSrc]);

  const categoryChip =
    cat != null ? (
      <span className="rounded-full bg-black/70 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[rgb(212_175_55/0.95)] backdrop-blur-sm">
        {CATEGORY_LABEL[cat]}
      </span>
    ) : null;

  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          "group relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/[0.1] bg-black/50 vault-spotlight shadow-[0_0_48px_-20px_rgb(212_175_55/0.12)]",
          "focus-within:ring-2 focus-within:ring-[rgb(212_175_55/0.35)]",
        )}
      >
        {isVideoSrc(stripSrc) ? (
          <video
            ref={videoRef}
            src={stripSrc}
            muted
            loop
            playsInline
            autoPlay
            className="h-full w-full object-cover opacity-95 motion-reduce:opacity-80"
            aria-hidden
          />
        ) : (
          <img src={stripSrc} alt="" className="h-full w-full object-cover" loading="lazy" />
        )}

        {/* Persistent bottom strip — always visible */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-black via-black/85 to-transparent px-3 pb-3 pt-16">
          <div className="pointer-events-auto flex flex-wrap items-center gap-2">
            {categoryChip}
            <span className="rounded-full bg-black/60 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-white/95">
              {drop.worthLabel}
            </span>
          </div>
          <p className="pointer-events-auto mt-1.5 font-heading text-sm font-semibold leading-snug text-white drop-shadow md:text-base">
            {drop.title}
          </p>
          <p className="pointer-events-auto mt-1 text-[11px] leading-snug text-zinc-400 md:hidden">
            {excerpt || drop.assetValueLabel}
          </p>
        </div>

        {/* Hover / focus / expanded overlay */}
        <div
          className={cn(
            "absolute inset-0 z-[3] flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/55 to-black/25 p-4 transition-opacity duration-200",
            "pointer-events-none opacity-0 md:group-hover:pointer-events-auto md:group-hover:opacity-100 md:group-focus-within:pointer-events-auto md:group-focus-within:opacity-100",
            expanded && "pointer-events-auto opacity-100",
            "motion-reduce:md:pointer-events-auto motion-reduce:md:opacity-100",
          )}
        >
          <div className="pointer-events-auto flex min-h-0 flex-col gap-3">
            <p className="text-[11px] leading-relaxed text-zinc-300 md:text-xs">{excerpt}</p>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/drops/$slug"
                params={{ slug: drop.slug }}
                className="inline-flex items-center justify-center rounded-full border border-[rgb(212_175_55/0.4)] bg-black/50 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm transition hover:border-[rgb(212_175_55/0.7)] hover:bg-black/70"
              >
                View pool
              </Link>
              <a
                href={`#drop-${drop.slug}`}
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-xs font-medium text-zinc-100 transition hover:border-white/25 hover:bg-white/[0.12]"
              >
                Jump to tickets
              </a>
            </div>
          </div>
        </div>

        {/* Mobile: expand details */}
        <button
          type="button"
          id={tileId}
          aria-expanded={expanded}
          aria-controls={`${tileId}-panel`}
          onClick={onToggle}
          className="absolute right-2 top-2 z-[4] rounded-full border border-white/15 bg-black/55 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-zinc-200 backdrop-blur-md md:hidden"
        >
          {expanded ? "Close" : "Details"}
        </button>
        <div id={`${tileId}-panel`} className="sr-only" aria-live="polite">
          {expanded ? `${drop.title}. ${excerpt}` : ""}
        </div>
      </div>
    </div>
  );
}

/** Merged “real assets” trust narrative + featured video filmstrip + live drop cards + on-chain footer. */
export function HomeRwaDropsSection() {
  const chainId = useChainId();
  const campaign = getCampaignAddress();
  const explorer = campaign ? explorerAddressUrl(chainId, campaign) : null;
  const { holdsAny, isPending, highestTier } = useGenesisVaultHighestTier();

  const fetchMergedDrops = useServerFn(postMergedHomeDrops);
  const { data: mergedResult } = useQuery({
    queryKey: ["home-drops-merged"],
    queryFn: async () => fetchMergedDrops({ data: {} }),
    staleTime: 60_000,
  });
  const drops = mergedResult?.drops ?? homeDrops;
  const featured = useMemo(() => drops.slice(0, HOME_FEATURED_DROP_COUNT), [drops]);

  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const baseId = useId();

  const tierLabel =
    highestTier === "phase0"
      ? "Phase 0"
      : highestTier === "phase1"
        ? "Phase 1"
        : highestTier === "phase2"
          ? "Phase 2"
          : null;

  return (
    <section
      id="drops"
      className="scroll-mt-24 border-b border-[rgb(212_175_55/0.12)] bg-gradient-to-b from-black via-[rgb(12_12_14)] to-black px-4 py-12 md:scroll-mt-28 md:px-8 md:py-16"
      aria-labelledby="rwa-drops-heading"
    >
      <div className="mx-auto max-w-6xl space-y-10 md:space-y-12">
        <div id="vault" className="scroll-mt-24 space-y-3 md:scroll-mt-28">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-600">
            Live pools · real-world prizes
          </p>
          <h2
            id="rwa-drops-heading"
            className="font-heading text-2xl font-semibold tracking-[0.08em] text-[var(--vault-gold)] md:text-3xl"
          >
            REAL ASSETS. REAL OWNERSHIP.
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
            The clips in the row below explain what kind of real-world prize each pool is about. The
            cards further down show your ticket artwork — buy there after you connect a wallet.
          </p>
          <div className="max-w-2xl rounded-2xl border border-white/[0.08] bg-black/35 px-4 py-3 text-left">
            <p className="font-heading text-sm font-semibold text-white">
              Never used crypto draws?
            </p>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[13px] leading-relaxed text-zinc-400">
              <li>
                Use the wallet buttons at the top of the page (MetaMask, Coinbase, etc.) — same as
                “sign up” for on-chain apps.
              </li>
              <li>
                Pick a pool, read the prize, hit <span className="text-zinc-300">Enter draw</span> —
                you buy tickets; each ticket is one entry when the pool is live on-chain.
              </li>
              <li>
                You don&apos;t need to understand block explorers to play; use{" "}
                <span className="text-zinc-300">View pool</span> for the full story anytime.
              </li>
            </ol>
          </div>
          {!isPending && holdsAny && tierLabel ? (
            <p className="max-w-2xl text-xs text-emerald-400/90">
              Genesis vault pass · {tierLabel} — early positioning active on your wallet.
            </p>
          ) : !isPending && !holdsAny ? (
            <p className="max-w-2xl text-xs text-zinc-500">
              <Link
                to="/genesis-district"
                className="text-zinc-300 underline underline-offset-2 hover:text-white"
              >
                Unlock vault access
              </Link>{" "}
              with the on-chain pass (optional).
            </p>
          ) : null}
        </div>

        <div>
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
                Featured filmstrip
              </p>
              <p className="mt-1 font-heading text-lg font-semibold text-white md:text-xl">
                What you&apos;re playing for (real assets)
              </p>
              <p className="mt-1 max-w-xl text-xs text-zinc-500">
                Hover for details, or tap Details on your phone. Loops here are RWA explainers;
                ticket loops are on the cards below.
              </p>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
              {featured.length} highlights
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {featured.map((drop, i) => (
              <FeaturedRwaTile
                key={drop.slug}
                drop={drop}
                excerpt={storyExcerpt(drop.story)}
                expanded={expandedSlug === drop.slug}
                onToggle={() => setExpandedSlug((s) => (s === drop.slug ? null : drop.slug))}
                tileId={`${baseId}-tile-${i}`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-600">
                All pools
              </p>
              <h3 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-white md:text-3xl">
                Buy tickets (your entries)
              </h3>
              <p className="mt-2 max-w-xl text-sm text-zinc-400">
                Pools rotate automatically — use the arrows or dots to jump. Connect your wallet,
                then Enter draw to buy; your ticket NFT is your entry receipt.
              </p>
              <p className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-[var(--vault-gold)]">
                enter → compete → win → flex
              </p>
            </div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-600">
              {drops.length} live
            </span>
          </div>

          <TicketPoolsCarousel drops={drops} />
        </div>

        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-5 py-4 md:flex-row md:px-6">
          <div className="flex items-start gap-3 text-left">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[rgb(212_175_55/0.25)] bg-black/40 text-[var(--vault-gold)]">
              <ImageIcon className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                Onchain surface
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Draws and ticket balances settle on-chain — receipts you can audit from your wallet.
              </p>
            </div>
          </div>
          {explorer ? (
            <a
              href={explorer}
              target="_blank"
              rel="noreferrer noopener"
              className="shrink-0 rounded-full border border-white/[0.12] bg-black/40 px-5 py-2.5 font-mono text-[11px] text-zinc-200 transition hover:border-[rgb(212_175_55/0.35)] hover:text-white"
            >
              View raffle contract ↗
            </a>
          ) : (
            <Link
              to="/faq"
              className="shrink-0 rounded-full border border-white/[0.12] px-5 py-2.5 font-mono text-[11px] text-zinc-400 hover:text-zinc-200"
            >
              How draws work →
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
