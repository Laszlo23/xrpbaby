import { Link } from "@tanstack/react-router";
import { motion } from "@/components/landing/motion";
import { ArrowUpRight, Layers } from "lucide-react";

export function LandingEcosystemTeaser() {
  return (
    <section
      id="ecosystem-teaser"
      className="relative w-full overflow-hidden bg-[#070707] py-20 sm:py-28"
    >
      <div className="absolute inset-0 bc-grid opacity-30" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-start justify-between gap-8 rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:flex-row sm:items-center sm:p-10"
        >
          <div className="max-w-2xl">
            <p className="mono-label">ECOSYSTEM</p>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Places, art, AI apps, and more — discover when you&apos;re ready.
            </h2>
            <p className="mt-4 text-base text-zinc-400">
              Places, art, AI apps, and capital tools — explore the full ecosystem when you&apos;re
              ready.
            </p>
          </div>
          <Link
            to="/ecosystem"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#C5FF41] px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-white"
          >
            <Layers size={16} aria-hidden />
            Explore ecosystem
            <ArrowUpRight size={14} aria-hidden />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
