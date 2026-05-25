import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { getLayerAccent, getLayerIcon } from "@/lib/ecosystem-layers";
import {
  ecosystemLink,
  isExternalEcosystemLink,
  type LandingEcosystemApp,
} from "@/lib/landing-ecosystem";
import { trackLandingEvent } from "@/lib/landing-api";
import { StatusBadge } from "@/components/landing/StatusBadge";

type ModuleBentoGridProps = {
  apps: LandingEcosystemApp[];
  section?: string;
  /** Bento spans for first cards (landing layout) */
  bento?: boolean;
};

function cardSpan(index: number, bento: boolean): string {
  if (!bento) return "";
  if (index === 0) return "sm:col-span-2 sm:row-span-2";
  if (index === 3) return "sm:col-span-2";
  return "";
}

function ModuleCard({
  app,
  index,
  bento,
  section,
}: {
  app: LandingEcosystemApp;
  index: number;
  bento: boolean;
  section: string;
}) {
  const Icon = getLayerIcon(app.layer);
  const accent = getLayerAccent(app.layer);
  const href = ecosystemLink(app);
  const external = isExternalEcosystemLink(app);
  const span = cardSpan(index, bento);

  const onClick = () => {
    void trackLandingEvent("ecosystem_click", section, { id: app.id });
  };

  const inner = (
    <>
      <motion.div
        className={`absolute -top-20 -right-20 h-48 w-48 rounded-full blur-3xl opacity-0 transition-opacity duration-700 group-hover:opacity-60`}
        style={{ background: accent }}
      />
      <div className="relative flex items-start justify-between">
        <span
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/40"
          style={{ boxShadow: `0 0 30px -10px ${accent}40` }}
        >
          <Icon size={18} style={{ color: accent }} />
        </span>
        <StatusBadge status={app.status} />
      </div>
      <div className="relative mt-8">
        <p className="mono-label" style={{ color: accent }}>
          {app.tag}
        </p>
        <h3 className="mt-2 font-display text-2xl font-bold leading-tight text-white sm:text-[26px]">
          {app.name}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-400">{app.description}</p>
        <div className="mt-5 flex items-center justify-between">
          <span className="max-w-[200px] truncate font-mono text-[11px] text-zinc-500">
            {href ? href.replace(/^https?:\/\//, "").replace(/^\//, "") : "coming soon"}
          </span>
          {href ? (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 transition-all group-hover:border-white/40 group-hover:bg-white/10">
              <ArrowUpRight
                size={14}
                className="text-white transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </span>
          ) : null}
        </div>
      </div>
    </>
  );

  const className = `group relative flex flex-col justify-between overflow-hidden rounded-3xl bc-glass p-6 transition-all hover:bc-glass-strong sm:p-7 ${span}`;

  if (href && !external) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ delay: index * 0.06, duration: 0.6 }}
        whileHover={{ y: -4 }}
      >
        <Link to={href} onClick={onClick} className={className}>
          {inner}
        </Link>
      </motion.div>
    );
  }

  if (href && external) {
    return (
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ delay: index * 0.06, duration: 0.6 }}
        whileHover={{ y: -4 }}
        className={className}
      >
        {inner}
      </motion.a>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.06, duration: 0.6 }}
      className={className}
    >
      {inner}
    </motion.div>
  );
}

export function ModuleBentoGrid({
  apps,
  section = "ecosystem",
  bento = true,
}: ModuleBentoGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
      {apps.map((app, i) => (
        <ModuleCard key={app.id} app={app} index={i} bento={bento} section={section} />
      ))}
    </div>
  );
}
