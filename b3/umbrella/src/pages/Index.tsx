import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Send } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Story } from "@/components/sections/Story";
import { Ecosystem } from "@/components/sections/Ecosystem";
import { TokenLayer } from "@/components/sections/TokenLayer";
import { MiniApps } from "@/components/sections/MiniApps";
import { Momentum } from "@/components/sections/Momentum";
import { WhatsNext } from "@/components/sections/WhatsNext";
import { FinalCta } from "@/components/sections/FinalCta";
import { Footer } from "@/components/sections/Footer";
import { Parallax } from "@/components/Parallax";

const X_URL = "https://x.com/buildingcultu3";
const TG_URL = "https://t.me/+4zFH7-2tyW0yOTBk";

const XIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M18.244 2H21.5l-7.5 8.57L23 22h-6.873l-5.39-6.62L4.5 22H1.244l8.04-9.18L1 2h7.043l4.86 6.04L18.244 2zm-2.41 18h1.85L7.27 4h-1.94l10.504 16z" />
  </svg>
);

const Index = () => {
  // Global scroll progress bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  // Subtle drift for ambient bg orbs
  const bgY1 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const bgY2 = useTransform(scrollYProgress, [0, 1], [0, 200]);

  return (
    <main className="relative overflow-x-hidden bg-background text-foreground">
      {/* scroll progress */}
      <motion.div
        style={{ scaleX }}
        className="fixed left-0 right-0 top-0 z-[60] h-[2px] origin-left bg-gold-gradient"
      />

      {/* ambient parallax background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          style={{ y: bgY1 }}
          className="absolute -left-40 top-[20%] h-[40rem] w-[40rem] rounded-full bg-gold-gradient opacity-[0.06] blur-3xl"
        />
        <motion.div
          style={{ y: bgY2 }}
          className="absolute -right-40 top-[60%] h-[36rem] w-[36rem] rounded-full bg-eco-gradient opacity-[0.08] blur-3xl"
        />
      </div>

      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-5 md:px-16 lg:px-24"
      >
        <a href="#" className="font-display text-lg tracking-tight">
          building<span className="text-gold">·</span>culture
        </a>
        <div className="flex items-center gap-2">
          <a
            href={X_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/40 text-muted-foreground backdrop-blur transition-colors hover:border-primary/60 hover:text-foreground"
          >
            <XIcon className="h-3.5 w-3.5" />
          </a>
          <a
            href={TG_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/40 text-muted-foreground backdrop-blur transition-colors hover:border-secondary-glow hover:text-foreground"
          >
            <Send className="h-3.5 w-3.5" />
          </a>
          <a
            href="https://0x.buildingculture.capital"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 hidden items-center gap-2 rounded-full border border-border/60 bg-background/40 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/80 backdrop-blur transition-colors hover:border-primary/60 hover:text-foreground sm:inline-flex"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-secondary-glow animate-pulse-glow" />
            launch app
          </a>
        </div>
      </motion.nav>

      <Hero />
      <Parallax offset={60}><Story /></Parallax>
      <Parallax offset={40}><Ecosystem /></Parallax>
      <Parallax offset={70}><TokenLayer /></Parallax>
      <Parallax offset={50}><MiniApps /></Parallax>
      <Parallax offset={40}><Momentum /></Parallax>
      <Parallax offset={60}><WhatsNext /></Parallax>
      <FinalCta />
      <Footer />
    </main>
  );
};

export default Index;
