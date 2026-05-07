import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import heroBg from "@/assets/hero-bg.jpg";
import heroVideo from "@/assets/hero-bg.mp4.asset.json";

const lines = ["we are building culture.", "not talking. building."];

export const Hero = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowCta(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <section ref={ref} className="relative h-screen w-full overflow-hidden">
      <motion.div style={{ scale, y }} className="absolute inset-0">
        <video
          src={heroVideo.url}
          poster={heroBg}
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background" />
      </motion.div>

      <div className="absolute inset-0 grid-bg opacity-60" />

      {/* particles */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 26 }).map((_, i) => (
          <span
            key={i}
            className="absolute block h-[3px] w-[3px] rounded-full bg-primary/70"
            style={{
              left: `${(i * 53) % 100}%`,
              bottom: `-${(i * 7) % 30}px`,
              animation: `particle ${14 + (i % 8)}s linear ${i * 0.6}s infinite`,
              filter: "blur(0.5px)",
            }}
          />
        ))}
      </div>

      <motion.div style={{ opacity }} className="relative z-10 flex h-full flex-col items-start justify-center px-6 md:px-16 lg:px-24">
        <div className="mb-8 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary-glow animate-pulse-glow" />
          live ecosystem · v1
        </div>

        <h1 className="font-display text-5xl leading-[0.95] text-balance md:text-7xl lg:text-[8rem] max-w-5xl">
          {lines.map((line, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: i * 0.6 + 0.2, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="block"
            >
              {i === 0 ? (
                <>we are <span className="italic text-gold">building</span> culture.</>
              ) : (
                <span className="text-muted-foreground">not talking. building.</span>
              )}
            </motion.span>
          ))}
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showCta ? 1 : 0, y: showCta ? 0 : 20 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 flex flex-col items-start gap-6 sm:flex-row sm:items-center"
        >
          <a
            href="#ecosystem"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-primary/40 bg-primary/5 px-7 py-4 font-mono text-sm uppercase tracking-[0.25em] text-foreground transition-all duration-500 hover:border-primary hover:bg-primary/10 hover:glow-gold"
          >
            <span className="relative z-10">enter ecosystem</span>
            <span className="relative z-10 transition-transform duration-500 group-hover:translate-x-1">→</span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
          </a>
          <motion.span
            animate={{ y: [0, 6, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground"
          >
            scroll ↓
          </motion.span>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-background" />
    </section>
  );
};
