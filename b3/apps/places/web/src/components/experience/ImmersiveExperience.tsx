"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ExperienceSocialLinks } from "@/components/experience/ExperienceSocialLinks";
import { TypewriterQuotes } from "@/components/experience/TypewriterQuotes";
import {
  DEMO_PROPERTY_DETAILS,
  REFERENCE_YIELD_BAND_LABEL,
  formatAnnualRentEur,
  formatIllustrativeEconomics,
  formatSquareMeters,
  getEstimatedYieldPercent,
} from "@/lib/demo-properties";
import { getCultureLandDisplayForDemoPropertyId } from "@/lib/culture-land-portfolio";
import {
  EUR_USD_TEASER,
  formatEurReferenceCompact,
  formatLettableM2Compact,
  formatUsdTeaserApprox,
} from "@/lib/experience-portfolio-totals";
import { flagshipCampaign, FLAGSHIP_PROPERTY_ID } from "@/lib/flagship-campaign";
import { getExperienceSlides } from "@/lib/experience-slides";
import { getIntroPortfolioBeats, getStoryBeatsForProperty } from "@/lib/experience-story-beats";
import { markIntroSeen } from "@/lib/first-visit-intro";
import {
  BUILDING_CULTURE_PILLARS_TAGLINE,
  getBuildingCulturePillar,
  getBuildingCulturePillarLabel,
} from "@/lib/building-culture-pillars";

const BEAT_MS = 11500;
const BEAT_MS_REDUCED = 21000;
const PROJECT_PAUSE_MS = 3200;

const flagshipId = Number(FLAGSHIP_PROPERTY_ID);

export function ImmersiveExperience() {
  const projects = useMemo(() => getExperienceSlides(), []);
  const n = projects.length;

  const [projectIndex, setProjectIndex] = useState(0);
  const [beatIndex, setBeatIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  /** Mobile: hero first; desktop: always expanded. Synced in useLayoutEffect. */
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [storyDetailsOpen, setStoryDetailsOpen] = useState(true);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const goProjectRef = useRef<(d: number) => void>(() => {});
  const innerAdvanceRef = useRef<number | undefined>(undefined);

  const slide = projects[projectIndex]!;
  const storyBeats = useMemo(() => {
    if (slide.kind === "intro") return getIntroPortfolioBeats();
    return getStoryBeatsForProperty(slide.propertyId);
  }, [slide]);
  const beat = storyBeats[beatIndex] ?? storyBeats[0]!;
  const beatCount = storyBeats.length;
  const slideVisualKey = slide.kind === "intro" ? "intro" : slide.propertyId;

  const collapseMobileHero = useCallback(() => {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) {
      setStoryDetailsOpen(false);
    }
  }, []);

  const goProject = useCallback(
    (delta: number) => {
      setProjectIndex((i) => (i + delta + n) % n);
      setBeatIndex(0);
      collapseMobileHero();
    },
    [collapseMobileHero, n],
  );

  goProjectRef.current = (d: number) => goProject(d);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => {
      const m = mq.matches;
      setIsMobileViewport(m);
      setStoryDetailsOpen(!m);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goProjectRef.current(-1);
      if (e.key === "ArrowRight") goProjectRef.current(1);
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setBeatIndex((b) => (b - 1 + beatCount) % beatCount);
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setBeatIndex((b) => (b + 1) % beatCount);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [beatCount]);

  useEffect(() => {
    if (beatCount === 0) return;
    if (isMobileViewport && !storyDetailsOpen) {
      return;
    }
    const ms = reduceMotion ? BEAT_MS_REDUCED : BEAT_MS;
    innerAdvanceRef.current = undefined;

    const id = window.setTimeout(() => {
      if (beatIndex < beatCount - 1) {
        setBeatIndex((b) => b + 1);
        return;
      }

      innerAdvanceRef.current = window.setTimeout(() => {
        innerAdvanceRef.current = undefined;
        setProjectIndex((p) => (p + 1) % n);
        setBeatIndex(0);
        collapseMobileHero();
      }, PROJECT_PAUSE_MS);
    }, ms);

    return () => {
      window.clearTimeout(id);
      if (innerAdvanceRef.current) window.clearTimeout(innerAdvanceRef.current);
    };
  }, [projectIndex, beatIndex, beatCount, n, reduceMotion, storyDetailsOpen, isMobileViewport, collapseMobileHero]);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.changedTouches[0];
    touchStartX.current = t?.clientX ?? null;
    touchStartY.current = t?.clientY ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const startX = touchStartX.current;
    const startY = touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    const t = e.changedTouches[0];
    const endX = t?.clientX;
    const endY = t?.clientY;
    if (startX == null || startY == null || endX == null || endY == null) return;
    const dx = endX - startX;
    const dy = endY - startY;
    if (Math.abs(dx) < 50 || Math.abs(dx) <= Math.abs(dy)) return;
    if (dx < 0) goProject(1);
    else goProject(-1);
  };

  const detail = slide.kind === "property" ? DEMO_PROPERTY_DETAILS[slide.propertyId] : undefined;
  const isFlagship = slide.kind === "property" && slide.propertyId === flagshipId;

  const progress = Math.min(1, flagshipCampaign.raisedEur / flagshipCampaign.targetRaiseEur);
  const targetFmt = new Intl.NumberFormat("de-AT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(flagshipCampaign.targetRaiseEur);
  const raisedFmt = new Intl.NumberFormat("de-AT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(flagshipCampaign.raisedEur);

  const idStr = slide.kind === "property" ? slide.propertyId.toString() : "";
  const yieldPct = detail ? getEstimatedYieldPercent(detail) : 0;
  const economicsLine = detail ? formatIllustrativeEconomics(detail) : null;

  const goBeat = (delta: number) => {
    setBeatIndex((b) => (b + delta + beatCount) % beatCount);
  };

  const showFullStoryChrome = !isMobileViewport || storyDetailsOpen;
  const clDisplay =
    slide.kind === "property" ? getCultureLandDisplayForDemoPropertyId(slide.propertyId) : null;
  const pillarLabel =
    slide.kind === "property" ? getBuildingCulturePillarLabel(getBuildingCulturePillar(slide.propertyId)) : null;
  const isFactsBeat = beat.role === "facts";

  const introTotals = slide.kind === "intro" ? slide.totals : null;
  const heroHeadline =
    slide.kind === "intro"
      ? beat.title
      : (clDisplay?.title ?? detail?.headline ?? slide.title);
  const heroSupporting =
    slide.kind === "intro" && introTotals
      ? beat.subtitle
      : clDisplay
        ? `${clDisplay.region} · ${clDisplay.tagline}`
        : (detail?.location ?? (slide.kind === "property" ? slide.subtitle : ""));

  return (
    <div
      className="fixed inset-0 z-[40] bg-black"
      role="region"
      aria-roledescription="carousel"
      aria-label={`Immersive stories — slide ${projectIndex + 1} of ${n}, beat ${beatIndex + 1} of ${beatCount}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="absolute inset-0 max-md:fixed max-md:inset-0 max-md:z-0 max-md:h-[100dvh]">
        {storyBeats.map((b, i) => {
          const active = i === beatIndex;
          const layerMotion = reduceMotion
            ? "transition-opacity duration-300 ease-out"
            : "transition-[opacity,filter,-webkit-filter] duration-[2000ms] ease-[cubic-bezier(0.22,0.94,0.36,1)]";
          return (
            <div
              key={`${slideVisualKey}-${i}-${b.role}`}
              className={`absolute inset-0 ${layerMotion} ${
                active
                  ? "z-[1] opacity-100 blur-0"
                  : `z-0 opacity-0 pointer-events-none ${reduceMotion ? "blur-0" : "blur-[2px] md:blur-[3px]"}`
              }`}
              aria-hidden={!active}
            >
              <div
                key={active ? `enter-${projectIndex}-${beatIndex}-${i}` : `idle-${slideVisualKey}-${i}`}
                className={`absolute inset-0 ${active && !reduceMotion ? "immersive-bg-enter" : ""}`}
              >
                <div
                  key={active ? `ken-${projectIndex}-${beatIndex}-${i}` : `idle-k-${slideVisualKey}-${i}`}
                  className={`absolute inset-0 ${active ? "immersive-ken-burns" : ""}`}
                >
                  <Image
                    src={b.imageSrc}
                    alt={b.imageAlt}
                    fill
                    className="object-cover object-center"
                    sizes="100vw"
                    priority={projectIndex === 0 && i === 0}
                    draggable={false}
                  />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/25 md:from-black/45 md:via-black/12 md:to-black/30" />
            </div>
          );
        })}
      </div>

      <div className="pointer-events-auto absolute inset-0 z-[2] isolate flex min-h-0 flex-col gap-4 overflow-hidden p-4 max-md:h-[100dvh] sm:p-8 md:min-h-0 md:overflow-visible md:gap-6 md:pb-40 md:pl-10 md:pr-10 md:pt-8">
        <div className="pointer-events-auto fixed top-3 right-3 z-[50] md:hidden">
          <ExperienceSocialLinks size="compact" />
        </div>

        {isMobileViewport && !storyDetailsOpen && (
          <div className="pointer-events-auto flex min-h-0 min-w-0 flex-1 flex-col justify-end gap-4 pb-3">
            <div className="rounded-2xl border border-white/20 bg-white/5 px-4 py-5 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/80">Immersive story</p>
              <h1 className="mt-2 text-3xl font-semibold leading-[1.1] tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.85)]">
                {heroHeadline}
              </h1>
              <p
                className={`mt-2 text-sm leading-relaxed text-white/85 drop-shadow-md ${
                  slide.kind === "intro" ? "line-clamp-6" : "line-clamp-3"
                }`}
              >
                {heroSupporting}
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <button
                  type="button"
                  className="inline-flex w-full min-h-[48px] items-center justify-center gap-2 rounded-full border border-white/30 bg-white px-4 text-sm font-semibold text-zinc-900 shadow-lg transition hover:bg-zinc-100 active:bg-zinc-200"
                  aria-expanded={storyDetailsOpen}
                  aria-controls="immersive-story-details"
                  onClick={() => setStoryDetailsOpen(true)}
                >
                  <span>Explore the story</span>
                  <span aria-hidden className="text-lg leading-none">
                    ↓
                  </span>
                </button>
                <Link
                  href="/"
                  onClick={() => markIntroSeen()}
                  className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-gradient-to-r from-gold-600 to-gold-500 px-6 py-4 text-center text-base font-semibold text-black shadow-xl shadow-black/40 transition hover:opacity-95"
                >
                  Enter the Site
                </Link>
              </div>
            </div>
          </div>
        )}

        <div
          id="immersive-story-details"
          className={`flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden max-md:min-h-0 md:gap-6 ${showFullStoryChrome ? "" : "hidden"}`}
          aria-hidden={!showFullStoryChrome}
          role="region"
          aria-label="Story details"
        >
        {/* Band 1–2: brand + quotes (stacked on mobile; row on md) */}
        <header className="pointer-events-auto flex shrink-0 flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
          <div className="flex w-full min-w-0 flex-col gap-3 pr-[7.25rem] md:block md:w-auto md:max-w-[220px] md:pr-0">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white drop-shadow-md">Building Culture</p>
              <p className="mt-1 text-[10px] leading-snug text-white/55 drop-shadow">{BUILDING_CULTURE_PILLARS_TAGLINE}</p>
            </div>
          </div>

          <div className="relative z-10 flex min-w-0 w-full flex-col items-stretch justify-center px-0 md:flex-1 md:items-center md:px-4">
            <TypewriterQuotes />
          </div>

          <div className="hidden min-w-[240px] flex-col items-stretch gap-3 md:flex">
            <ExperienceSocialLinks />
            <Link
              href="/"
              onClick={() => markIntroSeen()}
              className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-gradient-to-r from-gold-600 to-gold-500 px-8 py-4 text-center text-lg font-semibold text-black shadow-xl shadow-black/45 transition hover:opacity-95"
            >
              Enter the Site
            </Link>
          </div>
        </header>

        {/* Band 3: story + panel — on mobile only this region scrolls (app shell: fixed header + bottom chrome) */}
        <div
          className={
            slide.kind === "intro"
              ? "pointer-events-auto touch-pan-y flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto overscroll-y-contain md:flex-row md:justify-between md:gap-10 md:items-start md:overflow-visible md:pt-2 md:pb-6"
              : "pointer-events-auto touch-pan-y flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden overscroll-y-contain md:flex-row md:justify-between md:gap-10 md:items-end md:overflow-visible"
          }
        >
          <div
            key={`story-${slideVisualKey}-${beatIndex}`}
            className={`pointer-events-auto relative z-20 max-w-2xl space-y-3 rounded-2xl immersive-beat-enter ${
              slide.kind === "intro"
                ? "bg-black/85 px-4 py-4 shadow-[0_8px_40px_rgba(0,0,0,0.75)] backdrop-blur-md md:bg-black/[0.82] md:px-5 md:py-4 md:shadow-[0_8px_40px_rgba(0,0,0,0.75)] md:ring-1 md:ring-white/10"
                : "bg-black/85 px-3 py-3 shadow-[0_8px_40px_rgba(0,0,0,0.75)] backdrop-blur-md md:bg-transparent md:px-0 md:py-0 md:shadow-none md:backdrop-blur-none md:ring-0"
            }`}
          >
            {slide.kind === "intro" ? (
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-eco-light drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]">
                Immersive intro · City · Land · Water · 7–10% ref. band
              </p>
            ) : (
              <div className="flex flex-col items-start gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
                {pillarLabel ? (
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-400/95 drop-shadow">
                    {pillarLabel}
                  </p>
                ) : null}
                <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-eco-light drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]">
                  {beat.roleLabel}
                </p>
                <span className="hidden text-[10px] text-white/45 sm:inline">·</span>
                <p className="text-[10px] uppercase tracking-widest text-white/80 drop-shadow sm:text-[10px]">
                  Property #{idStr}
                </p>
              </div>
            )}

            {beatCount > 1 && (
              <div className="flex items-center gap-2" role="tablist" aria-label="Story beats">
                {storyBeats.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={i === beatIndex}
                    aria-label={`${storyBeats[i]!.roleLabel}, beat ${i + 1} of ${beatCount}`}
                    onClick={() => setBeatIndex(i)}
                    className={`h-1 flex-1 max-w-[4rem] rounded-full transition sm:h-1.5 ${i === beatIndex ? "bg-eco-light shadow-[0_0_12px_rgba(63,143,107,0.5)]" : "bg-white/25 hover:bg-white/45"}`}
                  />
                ))}
              </div>
            )}

            <div className={beatCount > 1 ? "flex items-start gap-2" : ""}>
              {beatCount > 1 && (
                <button
                  type="button"
                  onClick={() => goBeat(-1)}
                  className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/90 backdrop-blur-sm transition hover:bg-white/10"
                  aria-label="Previous story beat"
                >
                  <span aria-hidden className="text-sm">
                    ↑
                  </span>
                </button>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-semibold leading-[1.08] tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)] sm:text-3xl md:text-4xl lg:text-5xl">
                  {beat.title}
                </h1>
                <p className="mt-2 max-w-xl text-base leading-relaxed text-white/95 drop-shadow-[0_1px_12px_rgba(0,0,0,0.95)] sm:text-lg">
                  {beat.subtitle}
                </p>
                {isFactsBeat && beat.factsRows && beat.factsRows.length > 0 ? (
                  <dl className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
                    {beat.factsRows.map((row) => (
                      <div
                        key={row.label}
                        className="rounded-xl border border-white/15 bg-black/50 px-3 py-2.5 shadow-inner shadow-black/40 backdrop-blur-sm"
                      >
                        <dt className="text-[9px] font-medium uppercase tracking-wider text-white/55">{row.label}</dt>
                        <dd className="mt-1 font-mono text-sm font-semibold tabular-nums text-white sm:text-base">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                {beat.partnerLinks && beat.partnerLinks.length > 0 && (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-2">
                    {beat.partnerLinks.map((pl) =>
                      pl.href.startsWith("/") ? (
                        <Link
                          key={pl.href}
                          href={pl.href}
                          className="text-sm font-medium text-eco-light/95 underline decoration-white/25 underline-offset-[3px] transition hover:text-white hover:decoration-eco-light/80"
                        >
                          {pl.label}
                        </Link>
                      ) : (
                        <a
                          key={pl.href}
                          href={pl.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-eco-light/95 underline decoration-white/25 underline-offset-[3px] transition hover:text-white hover:decoration-eco-light/80"
                        >
                          {pl.label}
                        </a>
                      ),
                    )}
                  </div>
                )}
              </div>
              {beatCount > 1 && (
                <button
                  type="button"
                  onClick={() => goBeat(1)}
                  className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/90 backdrop-blur-sm transition hover:bg-white/10"
                  aria-label="Next story beat"
                >
                  <span aria-hidden className="text-sm">
                    ↓
                  </span>
                </button>
              )}
            </div>

            {detail && (
              <p className="text-[11px] text-white/70 drop-shadow">
                {detail.location} ·{" "}
                <Link href={`/properties/${idStr}`} className="font-medium text-white underline underline-offset-2 hover:text-eco-light">
                  Open full brief
                </Link>
              </p>
            )}
          </div>

          <aside
            key={`panel-${slideVisualKey}`}
            className={`pointer-events-auto relative z-20 mt-0 w-full max-w-md shrink-0 rounded-2xl border border-white/12 bg-black/70 shadow-2xl shadow-black/50 backdrop-blur-md immersive-panel-enter md:mt-0 md:w-[min(100%,380px)] md:bg-black/55 ${
              slide.kind === "intro"
                ? "overflow-visible px-4 py-4 md:self-start md:ring-1 md:ring-white/10"
                : "px-5 py-5"
            }`}
          >
            {slide.kind === "intro" && introTotals ? (
              <>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-action-light/90">
                  Reference snapshot
                </p>
                <p className="mt-1 text-base font-semibold leading-snug text-white">Catalogue + partner pipeline</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-gold-500/40 bg-gold-500/[0.1] px-2.5 py-2.5 shadow-inner shadow-black/20">
                    <p className="text-[8px] font-semibold uppercase tracking-wider text-gold-400/95">ROI band</p>
                    <p className="mt-0.5 font-mono text-xl font-bold tabular-nums text-white">7–10%</p>
                    <p className="text-[9px] text-zinc-500">p.a. · ref.</p>
                  </div>
                  <div className="rounded-xl border border-eco/30 bg-eco/[0.08] px-2.5 py-2.5 shadow-inner shadow-black/20">
                    <p className="text-[8px] font-semibold uppercase tracking-wider text-eco-light/90">Lettable</p>
                    <p className="mt-0.5 font-mono text-xl font-bold tabular-nums text-white">
                      {formatLettableM2Compact(introTotals.combinedLettableM2)}
                    </p>
                    <p className="text-[9px] text-zinc-500">combined</p>
                  </div>
                </div>
                <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-2.5">
                  <p className="text-[8px] font-semibold uppercase tracking-wider text-zinc-400">Pipeline (EUR)</p>
                  <p className="mt-1 font-mono text-base font-semibold leading-tight text-white">
                    {formatEurReferenceCompact(introTotals.pipelineIndicativePurchaseEur)}
                  </p>
                  <p className="font-mono text-sm font-semibold text-eco-light/95">
                    {formatEurReferenceCompact(introTotals.pipelineIndicativeRentEur)} p.a.
                  </p>
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-black/30 px-2 py-2">
                    <dt className="text-[8px] uppercase tracking-wider text-zinc-500">Catalogue value</dt>
                    <dd className="mt-0.5 font-mono text-sm font-semibold text-white">
                      {formatUsdTeaserApprox(introTotals.sumReferenceValueUsdApprox)}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-black/30 px-2 py-2">
                    <dt className="text-[8px] uppercase tracking-wider text-zinc-500">Gross rent</dt>
                    <dd className="mt-0.5 font-mono text-sm font-semibold text-eco-light">
                      {formatUsdTeaserApprox(introTotals.sumAnnualRentUsdApprox)}
                    </dd>
                  </div>
                </dl>
                <p className="mt-2 text-[10px] leading-snug text-zinc-500">
                  Cat. {formatLettableM2Compact(introTotals.catalogueLettableM2)} · Pipe{" "}
                  {formatLettableM2Compact(introTotals.pipelineLettableM2)} · {EUR_USD_TEASER} USD/EUR teaser
                </p>
                <p className="mt-1.5 text-[11px] leading-snug text-zinc-400">
                  <span className="text-zinc-500">Featured:</span>{" "}
                  <Link
                    href="/culture-land#bcw-green-lake-suites"
                    className="font-medium text-gold-400/95 underline decoration-gold-500/35 underline-offset-2 hover:text-gold-300"
                  >
                    GREEN &amp; LAKE · SUITES
                  </Link>
                </p>
              </>
            ) : isFlagship ? (
              <>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Flagship round</p>
                <p className="mt-1 text-lg font-semibold text-white">{flagshipCampaign.displayName}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{flagshipCampaign.projectType}</p>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-[9px] uppercase tracking-wider text-zinc-500">Raised</dt>
                    <dd className="font-mono text-base text-eco-light">{raisedFmt}</dd>
                  </div>
                  <div>
                    <dt className="text-[9px] uppercase tracking-wider text-zinc-500">Target</dt>
                    <dd className="font-mono text-base text-white">{targetFmt}</dd>
                  </div>
                  <div>
                    <dt className="text-[9px] uppercase tracking-wider text-zinc-500">Investors</dt>
                    <dd className="font-mono text-base text-white">{flagshipCampaign.investors.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-[9px] uppercase tracking-wider text-zinc-500">Min (ref.)</dt>
                    <dd className="font-mono text-base text-white">${flagshipCampaign.minInvestmentUsd.toLocaleString()}</dd>
                  </div>
                </dl>

                <div className="mt-3">
                  <div className="flex justify-between text-[9px] text-zinc-500">
                    <span>Progress</span>
                    <span className="font-mono">{Math.round(progress * 100)}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-eco to-action"
                      style={{ width: `${Math.round(progress * 100)}%` }}
                    />
                  </div>
                </div>
              </>
            ) : detail ? (
                isFactsBeat ? (
                  <>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Issuer data room</p>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                      Full terms and filings supersede on-screen reference figures.
                    </p>
                    {economicsLine ? (
                      <p className="mt-2 text-[10px] leading-relaxed text-zinc-500">{economicsLine}</p>
                    ) : null}
                    <Link
                      href={`/properties/${idStr}`}
                      className="mt-3 inline-flex text-sm font-medium text-gold-400/95 underline underline-offset-2 hover:text-gold-300"
                    >
                      Open full brief →
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Culture Land listing</p>
                    <p className="mt-1 text-lg font-semibold leading-snug text-white">{detail.headline}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">{detail.propertyType}</p>
                    {economicsLine && <p className="mt-2 text-[10px] leading-relaxed text-zinc-500">{economicsLine}</p>}
                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-[9px] uppercase tracking-wider text-zinc-500">Reference yield band</dt>
                        <dd className="font-mono text-base text-eco-light">{REFERENCE_YIELD_BAND_LABEL} p.a.</dd>
                        <p className="mt-0.5 text-[8px] text-zinc-500">Modelled: {yieldPct.toFixed(1)}% gross</p>
                      </div>
                      <div>
                        <dt className="text-[9px] uppercase tracking-wider text-zinc-500">Annual rental income</dt>
                        <dd className="font-mono text-base text-white">{formatAnnualRentEur(detail.annualRentalIncomeEur)}</dd>
                      </div>
                      <div>
                        <dt className="text-[9px] uppercase tracking-wider text-zinc-500">Residential units</dt>
                        <dd className="font-mono text-base text-white">{detail.unitCountLabel ?? detail.units}</dd>
                      </div>
                      <div>
                        <dt className="text-[9px] uppercase tracking-wider text-zinc-500">Gross floor area</dt>
                        <dd className="font-mono text-base text-white">{formatSquareMeters(detail.squareMeters)}</dd>
                      </div>
                    </dl>
                  </>
                )
              )
            : null}

            {slide.kind === "intro" ? (
              <div className="mt-3 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => goProject(1)}
                  className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-gradient-to-r from-gold-600 to-gold-500 px-4 text-center text-sm font-semibold text-black shadow-lg transition hover:opacity-95"
                >
                  Continue to property stories
                </button>
                <Link
                  href="/culture-land"
                  className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-gold-500/45 bg-gold-500/10 px-4 text-center text-sm font-semibold text-gold-100 shadow-sm backdrop-blur-sm transition hover:bg-gold-500/15"
                >
                  {"Culture Land · listings & PDFs"}
                </Link>
              </div>
            ) : (
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Link
                  href={`/trade?property=${idStr}`}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-gradient-to-r from-gold-600 to-gold-500 px-4 text-center text-sm font-semibold text-black shadow-lg transition hover:opacity-95"
                >
                  Invest in this building
                </Link>
                <Link
                  href={`/properties/${idStr}`}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-white/40 bg-black/35 px-4 text-center text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition hover:bg-black/50"
                >
                  View property details
                </Link>
              </div>
            )}

            <p className="mt-3 text-[10px] leading-relaxed text-zinc-500">
              {slide.kind === "intro"
                ? "Catalogue + pipeline figures from listings and partner diligence — on-chain TVL when contracts are live. "
                : isFlagship
                  ? "Campaign figures — on-chain TVL when live. "
                  : "Financials — issuer data room and Legal. "}
              <Link href="/legal/risk" className="underline underline-offset-2 hover:text-zinc-400">
                Risks
              </Link>
            </p>
          </aside>
        </div>
        </div>

      <div className="pointer-events-auto relative z-[3] flex w-full shrink-0 flex-col items-center gap-3 max-md:pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] md:absolute md:bottom-8 md:left-0 md:right-0 md:pb-3">
        <p className="text-[9px] uppercase tracking-widest text-zinc-600">Swipe · Projects</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goProject(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-white/5 text-white shadow-md shadow-black/30 backdrop-blur-sm transition hover:bg-white/10 md:h-11 md:w-11 md:shadow-lg md:shadow-black/40"
            aria-label="Previous project"
          >
            <span className="text-base md:text-lg" aria-hidden>
              ‹
            </span>
          </button>
          <div
            className="flex max-w-[min(100vw-8rem,28rem)] flex-wrap justify-center gap-2 px-2"
            role="tablist"
            aria-label="Project indicators"
          >
            {projects.map((s, i) => (
              <button
                key={s.kind === "intro" ? "intro" : s.propertyId}
                type="button"
                role="tab"
                aria-selected={i === projectIndex}
                aria-label={
                  s.kind === "intro"
                    ? `Portfolio intro, ${i + 1} of ${n}`
                    : `Project ${s.propertyId}, ${i + 1} of ${n}`
                }
                onClick={() => {
                  setProjectIndex(i);
                  setBeatIndex(0);
                  collapseMobileHero();
                }}
                className={`h-2.5 w-2.5 shrink-0 rounded-full transition ${i === projectIndex ? "scale-125 bg-white" : "bg-white/35 hover:bg-white/60"}`}
                title={s.kind === "intro" ? "Portfolio intro" : `#${s.propertyId}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => goProject(1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-white/5 text-white shadow-md shadow-black/30 backdrop-blur-sm transition hover:bg-white/10 md:h-11 md:w-11 md:shadow-lg md:shadow-black/40"
            aria-label="Next project"
          >
            <span className="text-base md:text-lg" aria-hidden>
              ›
            </span>
          </button>
        </div>
        <p className="text-[10px] text-zinc-500">
          <Link href="/start" className="hover:text-zinc-400">
            Simple explanation
          </Link>
          <span className="mx-2 text-zinc-600">·</span>
          <Link href="/mission" className="hover:text-zinc-400">
            Mission
          </Link>
          <span className="mx-2 text-zinc-600">·</span>
          <Link href="/legal/risk" className="hover:text-zinc-400">
            Legal
          </Link>
          <span className="mx-2 text-zinc-600">·</span>
          <Link href="/" className="hover:text-zinc-400" onClick={() => markIntroSeen()}>
            Home
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}
