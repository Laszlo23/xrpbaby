import { motion } from "framer-motion";

import { ModuleBentoGrid } from "@/components/landing/ModuleBentoGrid";
import { LANDING_ECOSYSTEM } from "@/lib/landing-ecosystem";

export function LandingEcosystem() {
  return (
    <section id="ecosystem" className="relative w-full overflow-hidden bg-[#070707] py-28 sm:py-36">
      <div className="absolute inset-0 bc-grid" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#00E5FF]/10 blur-3xl" />
      <motion.div className="pointer-events-none absolute right-0 -bottom-40 h-[400px] w-[400px] rounded-full bg-[#C47C59]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="mono-label">THE ECOSYSTEM</p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mt-4 font-display text-[44px] leading-[1] font-bold tracking-tight text-white sm:text-7xl"
            >
              One Mission. <br />
              Multiple Products. <br />
              <span className="text-zinc-500">One Culture.</span>
            </motion.h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-base text-zinc-400 sm:text-lg">
              Eight interconnected products — built to fund, build, own, live and govern. Each one a
              doorway to the same movement.
            </p>
          </div>
        </div>

        <div className="mt-16">
          <ModuleBentoGrid apps={LANDING_ECOSYSTEM} section="ecosystem" bento />
        </div>
      </div>
    </section>
  );
}
