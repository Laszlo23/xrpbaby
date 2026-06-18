import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, Bot, Coins, Fingerprint, Shield, Target } from "lucide-react";

import type { ReactNode } from "react";

import type { PillarProductCopy } from "@/lib/landing-copy";
import { LANDING_TAGLINE } from "@/lib/landing-copy";
import { StatusBadge } from "@/components/landing/StatusBadge";

const PILLAR_ICONS = {
  "culture-id": Fingerprint,
  "campaign-hub": Target,
  "ai-agents": Bot,
  "bcc": Coins,
  "grant-proof": Shield,
} as const;

type ProductPageLayoutProps = {
  pillar: PillarProductCopy;
  children?: ReactNode;
};

export function ProductPageLayout({ pillar, children }: ProductPageLayoutProps) {
  const Icon = PILLAR_ICONS[pillar.id];

  return (
    <div className="bc-surface min-h-screen">
      <section className="relative overflow-hidden bg-black pt-28 pb-20 sm:pt-36 sm:pb-28">
        <div className="absolute inset-0 bc-grid opacity-30" />
        <div className="relative mx-auto max-w-4xl px-5 sm:px-8">
          <p className="mono-label">{LANDING_TAGLINE}</p>
          <div className="mt-6 flex items-start justify-between gap-4">
            <span className="text-4xl" aria-hidden>
              {pillar.emoji}
            </span>
            <StatusBadge status={pillar.status} />
          </div>
          <h1 className="mt-6 font-display text-[40px] leading-[1] font-bold tracking-tight text-white sm:text-6xl">
            {pillar.name}
          </h1>
          <p className="mt-4 text-xl text-zinc-300">{pillar.tagline}</p>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            {pillar.features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-3 rounded-2xl bc-glass px-4 py-3 text-sm text-zinc-200"
              >
                <Icon size={16} className="shrink-0 text-[#C5FF41]" aria-hidden />
                {feature}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to={pillar.primaryActionHref}
              className="inline-flex items-center gap-2 rounded-full bg-[#C5FF41] px-7 py-4 text-[15px] font-semibold text-black transition-colors hover:bg-white"
            >
              {pillar.primaryCta}
              <ArrowUpRight size={16} />
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-4 text-[15px] font-semibold text-white hover:border-[#00E5FF]/60"
            >
              All products
            </Link>
          </div>
        </div>
      </section>

      {children ? (
        <section className="border-t border-white/5 bg-[#050505] py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-5 sm:px-8">{children}</div>
        </section>
      ) : null}

      <section className="border-t border-white/5 bg-[#070707] py-16">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-zinc-400"
          >
            Part of the Building Culture community OS — portable reputation, verifiable impact,
            owned by contributors.
          </motion.p>
          <Link
            to="/join"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black hover:bg-[#C5FF41]"
          >
            Join Building Culture
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
