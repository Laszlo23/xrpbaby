import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useScroll } from "framer-motion";
import { ArrowDown, Sparkles } from "lucide-react";
import { MEDIA, ECOSYSTEM_EXTERNAL_CTA } from "../lib/media";
import { trackEvent } from "../lib/bcApi";

export const Hero = () => {
  const ref = useRef(null);
  const [reveal, setReveal] = useState(50); // before/after slider percentage

  // Auto-animate the reveal on load
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
    <section
      id="top"
      ref={ref}
      data-testid="hero-section"
      className="relative min-h-screen w-full overflow-hidden bg-black"
    >
      {/* Before / After visual */}
      <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
        <div className="absolute inset-0">
          <img
            src={MEDIA.heroBefore}
            alt="Abandoned building"
            className="h-full w-full object-cover opacity-90"
          />
        </div>
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 0 0 ${reveal}%)` }}
        >
          <img
            src={MEDIA.heroAfter}
            alt="Thriving community"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Reveal handle line */}
        <div
          className="absolute top-0 bottom-0 w-px bg-white/60 z-10"
          style={{ left: `${reveal}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-10 w-10 rounded-full bc-glass-strong flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-[#C5FF41]" />
          </div>
        </div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/90" />
        <div className="absolute inset-0 bc-spotlight" />
      </motion.div>

      {/* Noise */}
      <div className="absolute inset-0 bc-noise z-[1]" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-end px-5 pb-20 pt-32 sm:px-8 sm:pb-28">
        <div className="flex items-center justify-between mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 rounded-full bc-glass px-3 py-1.5"
            data-testid="hero-badge"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-[#C5FF41] animate-ping opacity-75" />
              <span className="relative h-2 w-2 rounded-full bg-[#C5FF41]" />
            </span>
            <span className="mono-label !text-zinc-300 !text-[10px]">
              ECOSYSTEM · LIVE · BETA
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="hidden sm:flex items-center gap-2 text-xs text-zinc-500 font-mono"
          >
            <Sparkles size={12} className="text-[#C47C59]" />
            BEFORE → AFTER
          </motion.div>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display font-bold text-white text-[44px] leading-[0.95] sm:text-7xl lg:text-[120px] lg:leading-[0.92] tracking-[-0.045em] max-w-5xl"
          data-testid="hero-headline"
        >
          We Bring <br />
          <span className="bc-text-gradient">Places Back</span> <br />
          To Life.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-8 max-w-xl text-base sm:text-lg text-zinc-300/90 leading-relaxed"
          data-testid="hero-subheadline"
        >
          Building Culture is creating a new way to fund, build, own and experience real-world communities.
          <span className="block mt-2 text-zinc-400">Not through banks. Through people.</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row gap-3"
        >
          <a
            href="#ecosystem"
            onClick={() => trackEvent("hero_cta_click", "hero", { cta: "explore" })}
            data-testid="hero-cta-explore"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#C5FF41] px-7 py-4 text-[15px] font-semibold text-black transition-all hover:scale-[1.02] hover:bg-white"
          >
            Explore The Ecosystem
            <ArrowDown size={16} className="transition-transform group-hover:translate-y-0.5" />
          </a>
          <a
            href={ECOSYSTEM_EXTERNAL_CTA}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("hero_cta_click", "hero", { cta: "join" })}
            data-testid="hero-cta-join"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md px-7 py-4 text-[15px] font-semibold text-white transition-all hover:border-[#00E5FF]/60 hover:bg-white/10"
          >
            Join The Community
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-16 flex items-center gap-6 text-[11px] text-zinc-500 font-mono uppercase tracking-[0.2em]"
        >
          <span>Web2 · Web3</span>
          <span className="bc-divider flex-1 max-w-[80px]" />
          <span>Built By People</span>
        </motion.div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center gap-2 text-zinc-500">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Scroll</span>
        <div className="h-10 w-px bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
};

export default Hero;
