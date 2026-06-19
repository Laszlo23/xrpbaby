import { Link } from "@tanstack/react-router";
import { motion } from "@/components/landing/motion";
import { ArrowUpRight } from "lucide-react";

import { StatusBadge } from "@/components/landing/StatusBadge";
import { trackLandingEvent } from "@/lib/landing-api";
import { PILLAR_PRODUCTS, PILLARS_SECTION } from "@/lib/landing-copy";

export function LandingProducts() {
  return (
    <section id="products" className="relative w-full overflow-hidden bg-[#050505] py-28 sm:py-36">
      <div className="absolute inset-0 bc-grid opacity-40" />
      <div className="pointer-events-none absolute -top-32 right-0 h-[400px] w-[400px] rounded-full bg-[#C5FF41]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-3xl">
          <p className="mono-label">{PILLARS_SECTION.eyebrow}</p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-4 font-display text-[44px] leading-[1] font-bold tracking-tight text-white sm:text-7xl"
          >
            {PILLARS_SECTION.headline} <br />
            <span className="text-zinc-500">{PILLARS_SECTION.headlineAccent}</span>
          </motion.h2>
          <p className="mt-6 max-w-xl text-base text-zinc-400 sm:text-lg">{PILLARS_SECTION.body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={PILLARS_SECTION.ctas.claim.href}
              className="inline-flex items-center gap-2 rounded-full bg-[#C5FF41] px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-white"
            >
              {PILLARS_SECTION.ctas.claim.label}
              <ArrowUpRight size={14} />
            </Link>
            <Link
              to={PILLARS_SECTION.ctas.credentials.href}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-[#00E5FF]/60"
            >
              {PILLARS_SECTION.ctas.credentials.label}
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-2">
          {PILLAR_PRODUCTS.map((product, i) => (
            <motion.div
              key={product.id}
              id={product.sectionId}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="group relative scroll-mt-32 overflow-hidden rounded-3xl bc-glass p-7 transition-all hover:bc-glass-strong sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="text-3xl" aria-hidden>
                  {product.emoji}
                </span>
                <StatusBadge status={product.status} />
              </div>
              <p className="mt-4 font-mono text-[11px] tracking-[0.2em] text-zinc-500 uppercase">
                {product.question}
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
                {product.name}
              </h3>
              <p className="mt-2 text-base text-zinc-400">{product.tagline}</p>
              <ul className="mt-6 space-y-2">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-zinc-300">
                    <span className="h-1 w-1 shrink-0 rounded-full bg-[#C5FF41]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to={product.productPageHref}
                  onClick={() =>
                    void trackLandingEvent("pillar_click", "products", {
                      id: product.id,
                      cta: "learn",
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-[#00E5FF]/60"
                >
                  Learn more
                  <ArrowUpRight size={14} />
                </Link>
                <Link
                  to={product.primaryActionHref}
                  onClick={() =>
                    void trackLandingEvent("pillar_click", "products", {
                      id: product.id,
                      cta: "primary",
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-full bg-[#C5FF41] px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-white"
                >
                  {product.primaryCta}
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
