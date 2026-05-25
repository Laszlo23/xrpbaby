import { motion } from "framer-motion";
import { ArrowRight, Award, Building2, Fingerprint, TrendingUp, Users } from "lucide-react";

const LAYERS = [
  {
    Icon: Fingerprint,
    label: "Identity Layer",
    desc: "Your onchain profile. Reputation that travels.",
    color: "#C5FF41",
  },
  {
    Icon: Users,
    label: "Community Layer",
    desc: "Belong to places, projects and people.",
    color: "#00E5FF",
  },
  {
    Icon: Building2,
    label: "Property Layer",
    desc: "Real homes, real spaces, real assets.",
    color: "#C47C59",
  },
  {
    Icon: TrendingUp,
    label: "Investment Layer",
    desc: "Participate transparently. Own the upside.",
    color: "#839788",
  },
  {
    Icon: Award,
    label: "Reward Layer",
    desc: "Earn for what you build, host and contribute.",
    color: "#C5FF41",
  },
];

export function LandingCultureLayer() {
  return (
    <section id="culture" className="relative w-full overflow-hidden bg-[#050505] py-28 sm:py-36">
      <div className="absolute inset-0 bc-grid opacity-50" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mono-label">THE CULTURE LAYER</p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-4 font-display text-[40px] leading-[1] font-bold tracking-tight text-white sm:text-7xl"
          >
            Everything <span className="bc-text-cyan-gradient">connects.</span>
          </motion.h2>
          <p className="mt-6 text-base text-zinc-400 sm:text-lg">
            Five layers, one flow. Move seamlessly between identity, community, property, investment
            and rewards — without ever leaving the culture.
          </p>
        </div>

        <div className="relative mt-20">
          <motion.div className="absolute top-[58px] right-[10%] left-[10%] hidden h-px lg:block">
            <div className="h-full bg-gradient-to-r from-[#C5FF41]/40 via-[#00E5FF]/60 to-[#C47C59]/40" />
          </motion.div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-3">
            {LAYERS.map((l, i) => (
              <motion.div
                key={l.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                className="group relative flex flex-col items-center text-center"
              >
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-60"
                    style={{ background: l.color }}
                  />
                  <div
                    className="relative flex h-[116px] w-[116px] items-center justify-center rounded-full bc-glass-strong"
                    style={{
                      borderColor: `${l.color}40`,
                      boxShadow: `0 0 40px -15px ${l.color}`,
                    }}
                  >
                    <l.Icon size={32} style={{ color: l.color }} />
                  </div>
                  <span className="absolute -top-2 -right-2 rounded-full border border-white/10 bg-black px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-white">
                    0{i + 1}
                  </span>
                </div>

                <p className="mt-5 font-display text-lg font-bold text-white">{l.label}</p>
                <p className="mt-2 max-w-[200px] text-sm text-zinc-400">{l.desc}</p>

                {i < LAYERS.length - 1 && (
                  <div className="mt-6 text-zinc-600 lg:hidden">
                    <ArrowRight className="rotate-90" size={20} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
