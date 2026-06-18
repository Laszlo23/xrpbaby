import { Link } from "@tanstack/react-router";

import { motion } from "@/components/landing/motion";
import { TRUST_LAYER_SECTION } from "@/lib/landing-copy";

export function LandingTrustLayer() {
  return (
    <section
      id="trust-layer"
      className="relative border-b border-white/5 bg-[#050505] py-16 sm:py-24"
      aria-label="Building Culture trust layer"
    >
      <div className="absolute inset-0 bc-grid opacity-20" />
      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="mono-label">{TRUST_LAYER_SECTION.eyebrow}</p>
          <h2 className="mt-4 font-display text-2xl font-bold text-white sm:text-4xl">
            {TRUST_LAYER_SECTION.headline}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            {TRUST_LAYER_SECTION.body}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={TRUST_LAYER_SECTION.ctas.claim.href}
              className="rounded-full bg-[#C5FF41] px-6 py-2.5 text-sm font-bold text-black transition hover:bg-[#d4ff6a]"
            >
              {TRUST_LAYER_SECTION.ctas.claim.label}
            </Link>
            <Link
              to={TRUST_LAYER_SECTION.ctas.credentials.href}
              className="rounded-full border border-white/15 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5"
            >
              {TRUST_LAYER_SECTION.ctas.credentials.label}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
