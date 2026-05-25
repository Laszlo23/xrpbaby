"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { HeroAmbientDecor } from "@/components/HeroAmbientDecor";
import { BERGGASSE_HERO_OBJECT_POSITION_CLASS, BERGGASSE_HERO_STILL } from "@/lib/bergasse-assets";

/** Default ambient clip under `public/` (URL-encoded spaces/parens). Override with `NEXT_PUBLIC_HERO_VIDEO`. */
const DEFAULT_HERO_VIDEO =
  "/grok-video-920c4f79-1b3a-435f-a428-e34fa644b2a0%20(1).mp4";

/**
 * Eco real-estate backdrop: optional ambient video, property still, gradients + skyline.
 * Set `NEXT_PUBLIC_HERO_VIDEO` to a path under `public/` (e.g. `/hero-ambient.webm`) to replace the default.
 */
export function HeroBackground() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const envVideo =
    typeof process.env.NEXT_PUBLIC_HERO_VIDEO === "string"
      ? process.env.NEXT_PUBLIC_HERO_VIDEO.trim()
      : "";
  const videoSrc = envVideo || DEFAULT_HERO_VIDEO;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const showVideo = !reduceMotion;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Base wash — fills letterbox around 16:9 video */}
      {showVideo ? (
        <div className="absolute inset-0 bg-gradient-to-b from-forest-deep/90 via-surface to-surface" />
      ) : null}

      {/* Property still (reduced motion) or 16:9 hero video (centered, more visible) */}
      <div className={showVideo ? "absolute inset-0" : "absolute inset-0 opacity-[0.22]"}>
        {showVideo ? (
          <div className="absolute inset-x-0 top-0 flex justify-center px-3 pt-5 sm:px-5 sm:pt-8 md:pt-10">
            <div className="relative aspect-video w-full max-w-[min(92vw,56rem)] overflow-hidden rounded-2xl border border-white/10 bg-forest-deep/30 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.65)] saturate-[0.96]">
              <video
                className={`absolute inset-0 h-full w-full ${BERGGASSE_HERO_OBJECT_POSITION_CLASS}`}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster={BERGGASSE_HERO_STILL}
                aria-hidden
              >
                <source src={videoSrc} type="video/mp4" />
              </video>
              {/* Light edge soften — keeps the frame readable without hiding the clip */}
              <div
                className="absolute inset-0 bg-[radial-gradient(ellipse_95%_85%_at_50%_48%,transparent_40%,rgba(8,22,17,0.2)_100%)]"
                aria-hidden
              />
            </div>
          </div>
        ) : (
          <div className="relative h-full min-h-[480px] w-full sm:min-h-[560px]">
            <Image
              src={BERGGASSE_HERO_STILL}
              alt=""
              fill
              className={BERGGASSE_HERO_OBJECT_POSITION_CLASS}
              sizes="100vw"
              priority
            />
          </div>
        )}
      </div>
      <div
        className={
          showVideo
            ? "absolute inset-0 bg-gradient-to-b from-surface/32 via-surface/52 to-surface/88"
            : "absolute inset-0 bg-gradient-to-b from-surface/80 via-surface/70 to-surface"
        }
      />
      <HeroAmbientDecor />
      <div className="hero-grid absolute inset-0 opacity-70" />
      <div
        className="absolute inset-0 opacity-[0.35] motion-reduce:animate-none animate-mesh-pan"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(63,143,107,0.18) 0%, transparent 40%, rgba(30,77,58,0.25) 50%, transparent 60%)",
          backgroundSize: "220% 220%",
        }}
      />
      <div className="absolute -left-[18%] top-[12%] h-[min(90vw,560px)] w-[min(90vw,560px)] rounded-full bg-gradient-to-br from-eco/30 via-forest-deep/20 to-transparent blur-[118px] motion-reduce:animate-none animate-aurora" />
      <div
        className="absolute -left-1/4 top-0 h-[420px] w-[70%] rounded-full bg-action/8 blur-[100px] animate-pulse-soft motion-reduce:animate-none"
        style={{ animationDuration: "6s" }}
      />
      <div className="absolute -right-1/4 top-24 h-[320px] w-[55%] rounded-full bg-eco/10 blur-[90px] animate-float motion-reduce:animate-none" />
      <div className="skyline absolute bottom-0 left-0 right-0 flex h-32 items-end justify-center gap-1 px-8 opacity-35 sm:h-40">
        {[28, 42, 36, 52, 38, 45, 32, 48, 34, 40].map((h, i) => (
          <div
            key={i}
            className="w-full max-w-[8%] rounded-t-sm bg-gradient-to-t from-forest-deep to-eco/40"
            style={{ height: `${h}%`, animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
