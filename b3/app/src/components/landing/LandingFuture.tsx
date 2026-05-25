import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

import { ROADMAP_SHIPPED, ROADMAP_UPCOMING } from "@/lib/landing-copy";

export function LandingFuture() {
  return (
    <section id="future" className="relative w-full overflow-hidden bg-[#050505] py-28 sm:py-36">
      <div className="absolute inset-0 bc-grid opacity-40" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-3xl">
          <p className="mono-label">THE FUTURE</p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-4 font-display text-[40px] leading-[1] font-bold tracking-tight text-white sm:text-7xl"
          >
            What we&apos;re <br />
            <span className="text-zinc-500">building next.</span>
          </motion.h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="mb-8 flex items-center gap-3">
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-[#C5FF41]" />
              <p className="mono-label !text-[#C5FF41]">SHIPPED · BETA</p>
            </div>
            <ul className="space-y-3">
              {ROADMAP_SHIPPED.map((s, i) => (
                <motion.li
                  key={s}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 rounded-2xl bc-glass px-5 py-4"
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#C5FF41]/40 bg-[#C5FF41]/15">
                    <Check size={12} className="text-[#C5FF41]" />
                  </span>
                  <span className="text-[15px] font-medium text-white">{s}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <motion.div>
            <div className="mb-8 flex items-center gap-3">
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-[#00E5FF]" />
              <p className="mono-label">UPCOMING</p>
            </div>
            <ul className="space-y-3">
              {ROADMAP_UPCOMING.map((u, i) => (
                <motion.li
                  key={u.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 rounded-2xl bc-glass px-5 py-5 transition-all hover:border-[#00E5FF]/30"
                >
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#00E5FF]/40 bg-[#00E5FF]/10">
                    <ArrowRight size={12} className="text-[#00E5FF]" />
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold text-white">{u.title}</p>
                    <p className="mt-1 text-sm text-zinc-500">{u.note}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
