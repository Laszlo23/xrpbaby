import { Link } from "@tanstack/react-router";
import { motion } from "@/components/landing/motion";
import type { ReactNode } from "react";

import { ECOSYSTEM_MAP, NORTH_STAR_QUESTIONS } from "@/lib/ecosystem-map";

function MapLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={className}>
        {children}
      </a>
    );
  }
  if (href.startsWith("#")) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  );
}

export function LandingEcosystemMap() {
  return (
    <section id="map" className="relative border-b border-white/5 bg-[#050505] py-20 sm:py-28">
      <div className="absolute inset-0 bc-grid opacity-40" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mono-label">BUILDING CULTURE</p>
          <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-5xl">
            Understand it in <span className="bc-text-cyan-gradient">30 seconds.</span>
          </h2>
          <p className="mt-4 text-base text-zinc-400 sm:text-lg">
            Identity, agents, economy, impact, and capital — one digital nation. BCC is the economic
            layer underneath, not the product.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {NORTH_STAR_QUESTIONS.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <MapLink
                href={q.href}
                className="block h-full rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20 hover:bg-white/[0.06]"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  {q.question}
                </p>
                <p className="mt-2 text-sm font-semibold text-white">{q.answer}</p>
              </MapLink>
            </motion.div>
          ))}
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {ECOSYSTEM_MAP.map((pillar, i) => (
            <motion.div
              key={pillar.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
              data-testid={`ecosystem-pillar-${pillar.id}`}
            >
              <MapLink href={pillar.href} className="font-display text-lg font-bold text-white">
                {pillar.label}
              </MapLink>
              <ul className="mt-4 space-y-2">
                {pillar.children?.map((child) => (
                  <li key={child.id}>
                    <MapLink
                      href={child.href}
                      className="text-sm text-zinc-400 transition hover:text-[#00E5FF]"
                    >
                      {child.label}
                    </MapLink>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
