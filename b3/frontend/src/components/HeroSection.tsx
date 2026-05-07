import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  ClipboardCheck,
  Clapperboard,
  Frame,
  Gem,
  Heart,
  Home,
  KeyRound,
  Landmark,
  Layers,
  Link2,
  MapPin,
  Palette,
  Radio,
  Scale,
  ScrollText,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
  TicketCheck,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

import heroBg from "@/assets/hero-bg.jpg";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { EliasIntentModal } from "@/components/EliasIntentModal";
import { HeroVaultCtas } from "@/components/HeroVaultCtas";
import { WalletControls } from "@/components/WalletControls";
import { useTypewriter } from "@/hooks/use-typewriter";
import { cn } from "@/lib/utils";

type HeroSlide = {
  /** Served from `/public` (e.g. `/ticketbg.mp4`). */
  videoSrc: string;
  eyebrow: string;
  title: string;
  titleAccent: string;
  description: string;
  /** Tailwind gradient overlay classes */
  overlay: string;
  /** Decorative accent for glow + dots */
  accent: "purple" | "amber" | "cyan" | "rose" | "emerald";
  icon: LucideIcon;
  /** Compact icon + short label chips (replaces long bullet lists). */
  quickHits: { icon: LucideIcon; label: string }[];
};

const ACCENT_RING: Record<HeroSlide["accent"], string> = {
  purple: "shadow-[0_0_24px_rgb(0_82_255/45%)] ring-[rgb(0_82_255/35%)]",
  amber: "shadow-[0_0_24px_rgb(251_191_36/35%)] ring-[rgb(251_191_36/25%)]",
  cyan: "shadow-[0_0_24px_rgb(34_211_238/35%)] ring-[rgb(34_211_238/25%)]",
  rose: "shadow-[0_0_24px_rgb(251_113_133/35%)] ring-[rgb(251_113_133/25%)]",
  emerald: "shadow-[0_0_24px_rgb(52_211_153/40%)] ring-[rgb(52_211_153/30%)]",
};

const ACCENT_DOT: Record<HeroSlide["accent"], string> = {
  purple: "bg-[var(--b3-purple)]",
  amber: "bg-amber-400",
  cyan: "bg-cyan-400",
  rose: "bg-rose-400",
  emerald: "bg-emerald-400",
};

/** Conic fills for the HUD orbit ring — matches slide accent. */
const HUD_ORBIT_BG: Record<HeroSlide["accent"], string> = {
  purple:
    "conic-gradient(from 0deg, rgb(0 82 255 / 0.6), transparent 42%, rgb(0 56 200 / 0.42) 58%, transparent 82%)",
  amber:
    "conic-gradient(from 0deg, rgb(251 191 36 / 0.65), transparent 42%, rgb(245 158 11 / 0.45) 58%, transparent 82%)",
  cyan: "conic-gradient(from 0deg, rgb(34 211 238 / 0.6), transparent 42%, rgb(6 182 212 / 0.4) 58%, transparent 82%)",
  rose: "conic-gradient(from 0deg, rgb(251 113 133 / 0.6), transparent 42%, rgb(244 63 94 / 0.4) 58%, transparent 82%)",
  emerald:
    "conic-gradient(from 0deg, rgb(52 211 153 / 0.6), transparent 42%, rgb(16 185 129 / 0.4) 58%, transparent 82%)",
};

const AUTOPLAY_MS = 7200;

const slides: HeroSlide[] = [
  {
    videoSrc: "/portfolio.mp4",
    eyebrow: "BUILDING CULTURE",
    title: "We bring forgotten places",
    titleAccent: "back to life.",
    description:
      "Not another real-estate billboard — belong to culture, not just square meters. One living world wired through missions, receipts, stays, and play.",
    overlay:
      "bg-gradient-to-br from-[rgb(6_42_34/0.55)] via-black/50 to-black/78 md:from-[rgb(10_52_42/0.48)]",
    accent: "emerald",
    icon: Heart,
    quickHits: [
      { icon: Building2, label: "Places kept" },
      { icon: Users, label: "Community hubs" },
      { icon: Sparkles, label: "On-chain proof" },
      { icon: MapPin, label: "IRL Vienna + beyond" },
    ],
  },
  {
    videoSrc: "/ticketbg.mp4",
    eyebrow: BRAND_DISPLAY_NAME,
    title: "Win real-world art & stays worth €10k+ —",
    titleAccent: "provably fair, onchain.",
    description: "Tickets, drops, and vault access to real assets — not promises.",
    overlay:
      "bg-gradient-to-br from-[rgb(0_28_90/0.5)] via-black/42 to-black/72 md:from-[rgb(0_20_70/0.45)]",
    accent: "purple",
    icon: Sparkles,
    quickHits: [
      { icon: Ticket, label: "Vault access" },
      { icon: Zap, label: "Live drops" },
      { icon: Scale, label: "Fair odds" },
      { icon: TrendingUp, label: "Real RWAs" },
    ],
  },
  {
    videoSrc: "/portfolio.mp4",
    eyebrow: "REAL ESTATE",
    title: "Properties we actually own.",
    titleAccent: "Community stays and hubs.",
    description:
      "Owned venues—not renders. Wins map to stays and hubs you can actually book and walk into.",
    overlay:
      "bg-gradient-to-t from-black/55 via-black/38 to-[rgb(120_53_15/0.35)] md:bg-gradient-to-br md:from-black/58 md:via-[rgb(69_26_3/0.38)] md:to-black/72",
    accent: "amber",
    icon: Building2,
    quickHits: [
      { icon: Home, label: "Owned assets" },
      { icon: KeyRound, label: "Member access" },
      { icon: MapPin, label: "IRL venues" },
      { icon: Landmark, label: "Verified sites" },
    ],
  },
  {
    videoSrc: "/artbg.mp4",
    eyebrow: "THE VAULT",
    title: "museum-grade pieces.",
    titleAccent: "unlocked onchain.",
    description:
      "Real artworks. Real lineage. Real ownership trails. Every drop is backed by collection-grade pieces — not renders.",
    overlay:
      "bg-gradient-to-br from-[rgb(18_14_8/0.72)] via-black/55 to-black/78 md:from-[rgb(35_28_12/0.55)]",
    accent: "amber",
    icon: Palette,
    quickHits: [
      { icon: Frame, label: "The vault" },
      { icon: Gem, label: "Lineage" },
      { icon: Layers, label: "Rare drops" },
      { icon: ScrollText, label: "IRL proof" },
    ],
  },
  {
    videoSrc: "/lightbg.mp4",
    eyebrow: "LIVE EXPERIENCES",
    title: "Live programs we're wiring.",
    titleAccent: "Moments members can feel.",
    description:
      "Exhibitions and member nights on real calendar dates—not roadmap vapor. Tickets buy scenes you join.",
    overlay: "bg-gradient-to-tl from-black/50 via-[rgb(8_47_42/0.38)] to-black/68 md:via-black/48",
    accent: "cyan",
    icon: Users,
    quickHits: [
      { icon: CalendarDays, label: "Dated events" },
      { icon: Clapperboard, label: "Live drops" },
      { icon: Radio, label: "Community FM" },
      { icon: TicketCheck, label: "Live tickets" },
    ],
  },
  {
    videoSrc: "/diamondbg.mp4",
    eyebrow: "PROOF ON-CHAIN",
    title: "Fair play you can audit.",
    titleAccent: "Payments settled on-chain.",
    description:
      "Contracts route tickets and payouts—see what you funded, what cleared, and where it settled on-chain.",
    overlay:
      "bg-gradient-to-b from-[rgb(6_40_30/0.48)] via-black/48 to-black/68 md:from-[rgb(10_45_35/0.42)]",
    accent: "emerald",
    icon: ShieldCheck,
    quickHits: [
      { icon: Link2, label: "Chain receipts" },
      { icon: Search, label: "Auditable draws" },
      { icon: BadgeCheck, label: "Verifiable" },
      { icon: ClipboardCheck, label: "Audit trail" },
    ],
  },
];

function HeroHudAside({
  slideIndex,
  total,
  accent,
  eyebrow,
  pauseCarousel,
  reduceMotion,
}: {
  slideIndex: number;
  total: number;
  accent: HeroSlide["accent"];
  eyebrow: string;
  pauseCarousel: boolean;
  reduceMotion: boolean;
}) {
  const n = slideIndex + 1;
  const orbitBackground = HUD_ORBIT_BG[accent];

  return (
    <aside
      className="relative mt-6 hidden w-full max-w-[17rem] shrink-0 flex-col self-center lg:mt-0 lg:flex lg:max-w-[15.25rem] xl:max-w-[16.5rem]"
      aria-hidden
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.12] bg-black/55 p-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.07),0_0_48px_-18px_rgb(0_82_255/0.22)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 border-l border-t border-white/45" />
        <div className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 border-r border-t border-white/45" />
        <div className="pointer-events-none absolute bottom-2.5 left-2.5 h-3.5 w-3.5 border-b border-l border-white/30" />
        <div className="pointer-events-none absolute bottom-2.5 right-2.5 h-3.5 w-3.5 border-b border-r border-white/30" />

        <p className="pl-0.5 font-mono text-[9px] uppercase tracking-[0.38em] text-zinc-500">
          Deck
        </p>
        <p className="mt-0.5 pl-0.5 font-mono text-[9px] uppercase tracking-[0.38em] text-zinc-600">
          Signal
        </p>

        <div className="relative mx-auto mt-5 flex h-[7.75rem] w-[7.75rem] items-center justify-center sm:h-[8.25rem] sm:w-[8.25rem]">
          <div
            className={cn(
              "absolute inset-0 rounded-full opacity-[0.85]",
              !reduceMotion && "motion-safe:animate-spin motion-safe:[animation-duration:14s]",
              pauseCarousel && "motion-safe:[animation-play-state:paused]",
            )}
            style={{ background: orbitBackground }}
          />
          <div className="absolute inset-[5px] rounded-full bg-[rgb(6_6_8/0.92)] ring-1 ring-inset ring-white/[0.08] backdrop-blur-md" />
          <span className="font-hero-display relative z-10 text-[2.35rem] font-bold leading-none tabular-nums tracking-[0.06em] text-white sm:text-[2.6rem]">
            {String(n).padStart(2, "0")}
            <sup className="ml-0.5 text-base font-semibold text-zinc-500 sm:text-lg">/{total}</sup>
          </span>
        </div>

        <p className="mt-5 line-clamp-2 text-center font-mono text-[10px] uppercase leading-relaxed tracking-[0.22em] text-zinc-400">
          {eyebrow}
        </p>

        <div className="mt-4 flex justify-center gap-1.5">
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-colors duration-300",
                i === slideIndex ? ACCENT_DOT[accent] : "bg-white/20",
              )}
            />
          ))}
        </div>

        <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:repeating-linear-gradient(0deg,transparent,transparent_3px,rgb(255_255_255/0.5)_3px,rgb(255_255_255/0.5)_4px)]" />
      </div>

      <p className="mt-3 hidden text-right font-mono text-[9px] uppercase leading-relaxed tracking-[0.28em] text-zinc-600 xl:block">
        Swipe · arrows · pause on hover
      </p>
    </aside>
  );
}

function SlideBackgroundVideo({
  src,
  poster,
  isActive,
  reduceMotion,
}: {
  src: string;
  poster: string;
  isActive: boolean;
  reduceMotion: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || reduceMotion) return;
    if (isActive) {
      void el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [isActive, reduceMotion, src]);

  if (reduceMotion) {
    return (
      <img
        src={poster}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-[0.56]"
        width={1920}
        height={1080}
        aria-hidden
      />
    );
  }

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload={isActive ? "auto" : "metadata"}
      aria-hidden
      className="absolute inset-0 z-0 h-full w-full scale-[1.02] object-cover opacity-[0.68]"
    />
  );
}

function splitHeadline(title: string, accent: string, visiblePrefix: string) {
  const full = `${title} ${accent}`;
  if (visiblePrefix.length >= full.length) {
    return { titleShown: title, accentShown: accent };
  }
  const afterTitle = title.length + 1;
  if (visiblePrefix.length <= title.length) {
    return { titleShown: title.slice(0, visiblePrefix.length), accentShown: "" };
  }
  return {
    titleShown: title,
    accentShown: accent.slice(0, Math.max(0, visiblePrefix.length - afterTitle)),
  };
}

export function HeroSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 28 });
  const [selected, setSelected] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [pauseCarousel, setPauseCarousel] = useState(false);
  const [parallaxY, setParallaxY] = useState(0);
  const [intentOpen, setIntentOpen] = useState(false);

  const activeSlide = slides[selected];
  const headlineFull = `${activeSlide.title} ${activeSlide.titleAccent}`;
  const { visibleStr, done: headlineDone } = useTypewriter(headlineFull, {
    enabled: !reduceMotion,
    resetKey: selected,
    msPerChar: 20,
    startDelayMs: 160,
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setParallaxY(0);
      return;
    }
    const onScroll = () => setParallaxY(Math.min(56, window.scrollY * 0.11));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduceMotion]);

  useEffect(() => {
    if (!emblaApi || reduceMotion || pauseCarousel) return;
    const t = window.setInterval(() => emblaApi.scrollNext(), AUTOPLAY_MS);
    return () => window.clearInterval(t);
  }, [emblaApi, reduceMotion, pauseCarousel]);

  const scrollTo = (i: number) => emblaApi?.scrollTo(i);
  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <>
      <EliasIntentModal open={intentOpen} onOpenChange={setIntentOpen} />
    <section
      id="connect"
      className="relative flex min-h-[58svh] scroll-mt-24 flex-col overflow-hidden sm:min-h-[62svh] md:min-h-[65svh] md:scroll-mt-28 lg:min-h-[min(72vh,760px)]"
      onMouseEnter={() => setPauseCarousel(true)}
      onMouseLeave={() => setPauseCarousel(false)}
      aria-roledescription="carousel"
    >
      <div className="pointer-events-none absolute inset-0 z-[1] opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:56px_56px]" />

      <div
        className="pointer-events-none absolute inset-0 z-[4] hero-vault-film motion-safe:animate-gold-drift"
        aria-hidden
      />

      <div className="absolute right-4 top-4 z-30 hidden md:block">
        <WalletControls className="justify-end" />
      </div>

      <div
        className="relative z-[2] overflow-hidden"
        ref={emblaRef}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            scrollPrev();
          }
          if (e.key === "ArrowRight") {
            e.preventDefault();
            scrollNext();
          }
        }}
        role="region"
        aria-label="Platform overview"
        tabIndex={0}
      >
        <div className="flex">
          {slides.map((slide, index) => {
            const Icon = slide.icon;
            const isActive = index === selected;
            const fullHeadline = `${slide.title} ${slide.titleAccent}`;
            const prefix = isActive && !reduceMotion ? visibleStr : fullHeadline;
            const { titleShown, accentShown } = splitHeadline(
              slide.title,
              slide.titleAccent,
              prefix,
            );
            const showBody = !isActive || reduceMotion || headlineDone;

            return (
              <div
                key={`${slide.videoSrc}-${index}`}
                className="relative min-h-[58svh] w-full min-w-0 shrink-0 grow-0 basis-full sm:min-h-[62svh] md:min-h-[65svh] lg:min-h-[min(72vh,760px)]"
                aria-hidden={!isActive}
              >
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <SlideBackgroundVideo
                    src={slide.videoSrc}
                    poster={heroBg}
                    isActive={isActive}
                    reduceMotion={reduceMotion}
                  />
                </div>
                <div className={cn("pointer-events-none absolute inset-0 z-[1]", slide.overlay)} />
                <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-black/10 to-black/72" />
                <div className="pointer-events-none absolute inset-0 z-[1] ring-1 ring-inset ring-white/[0.04]" />

                <div className="relative z-10 mx-auto flex min-h-full w-full max-w-6xl flex-col justify-center px-4 pb-[calc(9.5rem+env(safe-area-inset-bottom))] pt-12 sm:px-6 sm:pb-[calc(10rem+env(safe-area-inset-bottom))] sm:pt-14 md:px-10 md:pb-[calc(9.5rem+env(safe-area-inset-bottom))] md:pt-12 lg:pt-10">
                  <div className="mb-4 flex justify-center md:hidden">
                    <WalletControls className="justify-center" />
                  </div>

                  <div
                    className="flex flex-col gap-3 md:gap-4 lg:flex-row lg:items-center lg:gap-8 xl:gap-12 will-change-transform"
                    style={{
                      transform: reduceMotion ? undefined : `translate3d(0, ${parallaxY}px, 0)`,
                    }}
                  >
                    <div className="min-w-0 max-w-2xl flex-1 text-left">
                      <div
                        className={cn(
                          "flex flex-wrap items-center gap-3 transition-opacity duration-500",
                          isActive ? "opacity-100" : "opacity-90",
                        )}
                      >
                        <span
                          className={cn(
                            "inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] ring-1 backdrop-blur-xl",
                            ACCENT_RING[slide.accent],
                          )}
                        >
                          <Icon className="h-5 w-5 text-white/95" aria-hidden />
                        </span>
                        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-zinc-400">
                          {slide.eyebrow}
                        </p>
                      </div>

                      <h1 className="font-hero-display mt-4 text-[1.75rem] font-bold leading-[1.06] tracking-[0.02em] sm:mt-5 sm:text-[2.15rem] md:text-[2.75rem] md:leading-[1.04] md:tracking-[0.025em] lg:text-[3.25rem] lg:tracking-[0.03em]">
                        <span className="sr-only">
                          {slide.title} {slide.titleAccent}
                        </span>
                        <span
                          aria-hidden
                          className={cn(
                            "hero-headline-reveal block",
                            isActive && "hero-headline-active",
                          )}
                          key={isActive ? `h-${selected}` : `inactive-${index}`}
                        >
                          <span className="text-balance text-zinc-100">{titleShown}</span>{" "}
                          <span className="hero-accent-shimmer bg-gradient-to-r from-white via-[#c4b5fd] to-zinc-300 bg-[length:220%_auto] bg-clip-text text-transparent">
                            {accentShown}
                          </span>
                          {isActive && !reduceMotion && !headlineDone ? (
                            <span
                              className="ml-1 inline-block h-[0.72em] w-[2px] animate-pulse bg-[var(--b3-purple)] align-middle opacity-95"
                              aria-hidden
                            />
                          ) : null}
                        </span>
                      </h1>

                      <p
                        className={cn(
                          "mt-4 max-w-xl text-pretty text-[15px] leading-relaxed text-zinc-400 transition-all duration-700 ease-out sm:text-base md:mt-5 md:text-lg",
                          isActive &&
                            !reduceMotion &&
                            !headlineDone &&
                            "translate-y-3 opacity-0 blur-[3px]",
                          showBody && "translate-y-0 opacity-100 blur-0",
                        )}
                      >
                        {slide.description}
                      </p>

                      <div
                        className={cn(
                          "mt-3 flex flex-wrap justify-center gap-1.5 transition-all duration-500 sm:mt-3.5 sm:gap-2 md:justify-start",
                          isActive &&
                            !reduceMotion &&
                            !headlineDone &&
                            "translate-y-2 opacity-0 blur-[2px]",
                          showBody && "translate-y-0 opacity-100 blur-0",
                        )}
                      >
                        {slide.quickHits.map(({ icon: HitIcon, label }) => (
                          <span
                            key={label}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full border border-white/[0.12] bg-black/35 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-300 backdrop-blur-md sm:gap-1.5 sm:px-2.5 sm:text-[11px]",
                              "shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]",
                            )}
                          >
                            <HitIcon
                              className="h-3 w-3 shrink-0 text-zinc-200 sm:h-3.5 sm:w-3.5"
                              aria-hidden
                            />
                            {label}
                          </span>
                        ))}
                      </div>

                      <HeroVaultCtas onBeginJourney={() => setIntentOpen(true)} />
                    </div>

                    <HeroHudAside
                      slideIndex={index}
                      total={slides.length}
                      accent={slide.accent}
                      eyebrow={slide.eyebrow}
                      pauseCarousel={pauseCarousel}
                      reduceMotion={reduceMotion}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-3 pb-5 sm:gap-4 sm:pb-6 md:pb-8">
        <div className="pointer-events-auto flex w-full max-w-6xl flex-col gap-4 px-4 sm:px-6 md:flex-row md:items-end md:justify-between md:gap-6 md:px-10">
          <div className="flex items-center justify-center gap-2 md:justify-start">
            {slides.map((slide, i) => (
              <button
                key={`carousel-dot-${i}`}
                type="button"
                onClick={() => scrollTo(i)}
                className={cn(
                  "group relative h-2 rounded-full transition-all duration-300",
                  selected === i ? "w-10" : "w-2 hover:bg-white/40",
                  selected === i ? ACCENT_DOT[slide.accent] : "bg-white/20",
                )}
                aria-label={`Go to slide ${i + 1}: ${slide.eyebrow}`}
                aria-current={selected === i ? "true" : undefined}
              />
            ))}
          </div>

          <div className="pointer-events-auto flex items-center justify-center gap-2 md:justify-end">
            <button
              type="button"
              onClick={scrollPrev}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/18 bg-black/55 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] backdrop-blur-xl transition hover:bg-white/10"
              aria-label="Previous slide"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/18 bg-black/55 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] backdrop-blur-xl transition hover:bg-white/10"
              aria-label="Next slide"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="pointer-events-none w-full max-w-4xl border-t border-white/[0.08] px-4 pt-4 shadow-[0_-1px_0_rgb(255_255_255/0.04)] sm:px-6 sm:pt-5 md:mx-auto md:px-10">
          <div className="mx-auto grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4 md:gap-x-8">
            {[
              { label: "Total won", value: "$2.4M" },
              { label: "Builders", value: "12.8K" },
              { label: "Drops", value: "47" },
              { label: "Experiences", value: "120+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-heading text-lg font-semibold tabular-nums tracking-tight text-white md:text-xl">
                  {stat.value}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
