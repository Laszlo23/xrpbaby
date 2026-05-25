import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { trackLandingEvent } from "@/lib/landing-api";
import { LANDING_MEDIA } from "@/lib/landing-media";
import { plainLabels } from "@/lib/plain-labels";

export function LandingHero() {
  const ref = useRef(null);
  const [reveal, setReveal] = useState(50);

  useEffect(() => {
    let dir = 1;
    let val = 50;
    const id = setInterval(() => {
      val += dir * 0.6;
      if (val >= 78) dir = -1;
      if (val <= 22) dir = 1;
      setReveal(val);
    }, 60);
    return () => clearInterval(id);
  }, []);

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 120]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0.2]);

  return (
    <section id="top" ref={ref} className="relative min-h-screen w-full overflow-hidden bg-black">
      <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
        <div className="absolute inset-0">
          <img
            src={LANDING_MEDIA.heroBefore}
            alt="Abandoned building"
            className="h-full w-full object-cover opacity-90"
          />
        </div>
        <motion.div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 0 0 ${reveal}%)` }}
        >
          <img
            src={LANDING_MEDIA.heroAfter}
            alt="Thriving community"
            className="h-full w-full object-cover"
          />
        </motion.div>
        <motion.div
          className="absolute top-0 bottom-0 z-10 w-px bg-white/60"
          style={{ left: `${reveal}%` }}
        >
          <div className="absolute top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bc-glass-strong">
            <motion.div className="h-2 w-2 rounded-full bg-[#C5FF41]" />
          </div>
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/90" />
        <div className="absolute inset-0 bc-spotlight" />
      </motion.div>
      <div className="absolute inset-0 bc-noise z-[1]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-end px-5 pt-32 pb-20 sm:px-8 sm:pb-28">
        <div className="mb-10 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 rounded-full bc-glass px-3 py-1.5"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#C5FF41] opacity-75" />
              <span className="relative h-2 w-2 rounded-full bg-[#C5FF41]" />
            </span>
            <span className="mono-label !text-[10px] !text-zinc-300">ECOSYSTEM · LIVE · BETA</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="hidden items-center gap-2 font-mono text-xs text-zinc-500 sm:flex"
          >
            <Sparkles size={12} className="text-[#C47C59]" />
            BEFORE → AFTER
          </motion.div>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display max-w-5xl text-[44px] leading-[0.95] font-bold tracking-[-0.045em] text-white sm:text-7xl lg:text-[120px] lg:leading-[0.92]"
        >
          We Bring <br />
          <span className="bc-text-gradient">Places Back</span> <br />
          To Life.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-8 max-w-xl text-base leading-relaxed text-zinc-300/90 sm:text-lg"
        >
          Building Culture is creating a new way to fund, build, own and experience real-world
          communities.
          <span className="mt-2 block text-zinc-400">{plainLabels.landing.heroSubtitle}</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <a
            href="#ecosystem"
            onClick={() => void trackLandingEvent("hero_cta_click", "hero", { cta: "explore" })}
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#C5FF41] px-7 py-4 text-[15px] font-semibold text-black transition-all hover:scale-[1.02] hover:bg-white"
          >
            {plainLabels.landing.ctaExplore}
            <ArrowDown size={16} className="transition-transform group-hover:translate-y-0.5" />
          </a>
          <Link
            to="/join"
            onClick={() => void trackLandingEvent("hero_cta_click", "hero", { cta: "join" })}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-4 text-[15px] font-semibold text-white backdrop-blur-md transition-all hover:border-[#00E5FF]/60 hover:bg-white/10"
          >
            {plainLabels.landing.ctaJoin}
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-16 flex items-center gap-6 font-mono text-[11px] tracking-[0.2em] text-zinc-500 uppercase"
        >
          <span>Web2 · Web3</span>
          <span className="bc-divider max-w-[80px] flex-1" />
          <span>Built By People</span>
        </motion.div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-zinc-500 sm:flex">
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <div className="h-10 w-px bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
}
