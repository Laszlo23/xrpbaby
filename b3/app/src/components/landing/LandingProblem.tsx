import { motion } from "framer-motion";
import { Building2, Coins, Lock, TrendingDown, Users } from "lucide-react";

import { PROBLEM_STATS } from "@/lib/landing-copy";
import { LANDING_MEDIA } from "@/lib/landing-media";

const PROBLEM_ICONS = [Building2, TrendingDown, Coins, Lock, Users] as const;

export function LandingProblem() {
  return (
    <section id="problem" className="relative w-full overflow-hidden bg-[#050505] py-28 sm:py-36">
      <motion.div className="absolute inset-0 bc-grid" />
      <motion.div className="absolute inset-0 bc-noise" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
              className="relative overflow-hidden rounded-3xl border border-white/5"
            >
              <img
                src={LANDING_MEDIA.problem}
                alt="Decline of community spaces"
                className="h-[420px] w-full object-cover sm:h-[520px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute right-6 bottom-6 left-6">
                <p className="mono-label mb-2 !text-[#C47C59]">CHAPTER 01 · THE LOSS</p>
                <p className="font-display text-2xl leading-tight font-bold text-white sm:text-3xl">
                  Every empty building was once a home, a story, a community.
                </p>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-7">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mono-label"
            >
              THE PROBLEM
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mt-4 font-display text-[40px] leading-[1.02] font-bold tracking-tight text-white sm:text-6xl"
            >
              Communities are <br />
              <span className="text-zinc-500">disappearing.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-6 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg"
            >
              For decades, the systems we built to grow our cities have left people behind. Homes
              sit empty. Villages fade. Ownership feels impossible. We believe there is another way.
            </motion.p>

            <div className="relative mt-14">
              <div className="absolute top-2 bottom-2 left-[19px] w-px bg-gradient-to-b from-[#C47C59]/60 via-white/10 to-[#00E5FF]/40" />
              <ul className="space-y-5">
                {PROBLEM_STATS.map((p, i) => {
                  const Icon = PROBLEM_ICONS[i] ?? Building2;
                  return (
                    <motion.li
                      key={p.label}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ delay: i * 0.08 }}
                      className="relative flex items-center gap-5 rounded-2xl bc-glass py-5 pr-6 pl-5 transition-all hover:border-white/20"
                    >
                      <span className="relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#0A0A0A]">
                        <Icon size={16} className="text-[#C47C59]" />
                      </span>
                      <motion.div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-white">{p.label}</p>
                        <p className="mt-0.5 text-xs text-zinc-500">{p.note}</p>
                      </motion.div>
                      <p className="font-display shrink-0 text-2xl font-bold text-white">
                        {p.value}
                      </p>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
