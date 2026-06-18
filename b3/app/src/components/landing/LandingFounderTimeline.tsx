import { motion } from "@/components/landing/motion";

import { BUILDER_PROFILE } from "@/content/builder-chronicle";
import { FOUNDER_TIMELINE } from "@/lib/landing-copy";

export function LandingFounderTimeline() {
  return (
    <section id="founder-timeline" className="relative w-full overflow-hidden bg-[#050505] py-28 sm:py-36">
      <div className="absolute inset-0 bc-grid opacity-40" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-3xl">
          <p className="mono-label">FOUNDER STORY</p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-4 font-display text-[40px] leading-[1.02] font-bold tracking-tight text-white sm:text-6xl"
          >
            {BUILDER_PROFILE.displayName} — <br />
            <span className="text-zinc-500">three decades of building.</span>
          </motion.h2>
          <p className="mt-6 max-w-xl text-base text-zinc-400 sm:text-lg">
            From early websites to onchain culture — one thread: tools that let communities own what
            they build.
          </p>
        </div>

        <div className="relative mt-14">
          <div className="absolute top-0 bottom-0 left-4 hidden w-px bg-gradient-to-b from-[#00E5FF]/40 via-white/10 to-transparent sm:left-1/2 sm:block" />

          <ol className="space-y-8 sm:space-y-0">
            {FOUNDER_TIMELINE.map((milestone, i) => (
              <motion.li
                key={milestone.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className={`relative sm:grid sm:grid-cols-2 sm:gap-12 ${
                  i % 2 === 0 ? "" : "sm:[&>div:first-child]:order-2"
                }`}
              >
                <div className="hidden sm:flex sm:items-center sm:justify-end sm:pr-8">
                  {i % 2 === 0 ? (
                    <div className="text-right">
                      <p className="font-display text-3xl font-bold text-[#00E5FF]">
                        {milestone.year}
                      </p>
                      <p className="mt-1 font-display text-xl font-bold text-white">
                        {milestone.title}
                      </p>
                    </div>
                  ) : (
                    <p className="max-w-sm text-sm leading-relaxed text-zinc-400">{milestone.body}</p>
                  )}
                </div>

                <div className="absolute top-6 left-4 hidden h-3 w-3 -translate-x-1/2 rounded-full border-2 border-[#00E5FF] bg-[#050505] sm:left-1/2 sm:block" />

                <div className="rounded-2xl bc-glass p-6 sm:py-8 sm:pl-8">
                  <p className="font-display text-2xl font-bold text-[#00E5FF] sm:hidden">
                    {milestone.year}
                  </p>
                  <p className="mt-1 font-display text-xl font-bold text-white sm:hidden">
                    {milestone.title}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:hidden">
                    {milestone.body}
                  </p>

                  {i % 2 === 0 ? (
                    <p className="hidden max-w-sm text-sm leading-relaxed text-zinc-400 sm:block">
                      {milestone.body}
                    </p>
                  ) : (
                    <div className="hidden sm:block">
                      <p className="font-display text-3xl font-bold text-[#00E5FF]">
                        {milestone.year}
                      </p>
                      <p className="mt-1 font-display text-xl font-bold text-white">
                        {milestone.title}
                      </p>
                    </div>
                  )}
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
