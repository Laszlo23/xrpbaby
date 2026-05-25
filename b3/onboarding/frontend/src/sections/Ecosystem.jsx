import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { fetchEcosystem, trackEvent } from "../lib/bcApi";
import { getLayerAccent, getLayerIcon } from "../lib/ecosystemLayers";

const StatusBadge = ({ status }) => {
  const map = {
    live: { c: "#C5FF41", l: "LIVE" },
    beta: { c: "#00E5FF", l: "BETA" },
    "coming-soon": { c: "#C47C59", l: "SOON" },
  };
  const s = map[status] || map.beta;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-mono font-semibold tracking-[0.18em]"
      style={{ borderColor: `${s.c}50`, color: s.c }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.c }} />
      {s.l}
    </span>
  );
};

export const Ecosystem = () => {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    fetchEcosystem()
      .then(setApps)
      .catch(() => setApps([]));
  }, []);

  return (
    <section
      id="ecosystem"
      data-testid="ecosystem-section"
      className="relative w-full overflow-hidden bg-[#070707] py-28 sm:py-36"
    >
      <div className="absolute inset-0 bc-grid" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-[#00E5FF]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 right-0 h-[400px] w-[400px] rounded-full bg-[#C47C59]/10 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <p className="mono-label">THE ECOSYSTEM</p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mt-4 font-display text-[44px] sm:text-7xl font-bold tracking-tight text-white leading-[1]"
              data-testid="ecosystem-headline"
            >
              One Mission. <br />
              Multiple Products. <br />
              <span className="text-zinc-500">One Culture.</span>
            </motion.h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-zinc-400 text-base sm:text-lg">
              Eight interconnected products — built to fund, build, own, live and govern.
              Each one a doorway to the same movement.
            </p>
          </div>
        </div>

        {/* Bento grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {apps.map((a, i) => {
            const Icon = getLayerIcon(a.layer);
            const accent = getLayerAccent(a.layer);
            const span =
              i === 0
                ? "sm:col-span-2 sm:row-span-2"
                : i === 3
                ? "sm:col-span-2"
                : "";
            return (
              <motion.a
                key={a.id}
                href={a.url || "#future"}
                target={a.url ? "_blank" : undefined}
                rel="noopener noreferrer"
                onClick={() => trackEvent("ecosystem_click", "ecosystem", { id: a.id })}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.06, duration: 0.6 }}
                whileHover={{ y: -4 }}
                data-testid={`ecosystem-card-${a.id}`}
                className={`group relative flex flex-col justify-between rounded-3xl bc-glass p-6 sm:p-7 overflow-hidden transition-all hover:bc-glass-strong ${span}`}
              >
                <div
                  className="absolute -top-20 -right-20 h-48 w-48 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-700"
                  style={{ background: accent }}
                />

                <div className="relative flex items-start justify-between">
                  <span
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/40"
                    style={{ boxShadow: `0 0 30px -10px ${accent}40` }}
                  >
                    <Icon size={18} style={{ color: accent }} />
                  </span>
                  <StatusBadge status={a.status} />
                </div>

                <div className="relative mt-8">
                  <p className="mono-label" style={{ color: accent }}>
                    {a.tag}
                  </p>
                  <h3 className="mt-2 font-display text-2xl sm:text-[26px] font-bold text-white leading-tight">
                    {a.name}
                  </h3>
                  <p className="mt-3 text-sm text-zinc-400 leading-relaxed line-clamp-3">
                    {a.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="font-mono text-[11px] text-zinc-500 truncate max-w-[200px]">
                      {a.url ? a.url.replace(/^https?:\/\//, "") : "coming soon"}
                    </span>
                    {a.url && (
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 group-hover:border-white/40 group-hover:bg-white/10 transition-all">
                        <ArrowUpRight size={14} className="text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    )}
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Ecosystem;
