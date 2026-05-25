import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

import { IMPACT_STORIES } from "@/lib/landing-copy";
import { LANDING_MEDIA } from "@/lib/landing-media";

export function LandingImpact() {
  return (
    <section id="impact" className="relative w-full overflow-hidden bg-[#050505] py-28 sm:py-36">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <p className="mono-label">REAL WORLD IMPACT</p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-4 font-display text-[40px] leading-[1] font-bold tracking-tight text-white sm:text-7xl"
            >
              Not another token. <br />
              Not another app. <br />
              <span className="bc-text-gradient">Real places. Real people.</span>
            </motion.h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-base text-zinc-400 sm:text-lg">
              We measure success in homes restored, neighborhoods reopened and people who finally
              have a stake in the place they call home.
            </p>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative min-h-[420px] overflow-hidden rounded-3xl border border-white/5 lg:col-span-7"
          >
            <img
              src={LANDING_MEDIA.impact}
              alt="Thriving community"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute right-0 bottom-0 left-0 p-7 sm:p-10">
              <p className="mono-label !text-[#C5FF41]">CHAPTER 02 · THE RETURN</p>
              <h3 className="mt-3 max-w-md font-display text-3xl leading-tight font-bold text-white sm:text-5xl">
                A place is alive when its people return to it.
              </h3>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-5 lg:col-span-5">
            {IMPACT_STORIES.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className={`flex min-h-[200px] flex-col justify-between rounded-3xl bc-glass p-6 ${
                  i === 0 ? "col-span-2" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 text-zinc-500">
                    <MapPin size={12} />
                    <span className="font-mono text-[10px] tracking-widest uppercase">
                      {s.location}
                    </span>
                  </div>
                  <span className="font-display text-2xl font-bold text-[#00E5FF]">{s.metric}</span>
                </div>
                <div>
                  <p className="font-display text-xl font-bold text-white">{s.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
