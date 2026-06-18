import { Link } from "@tanstack/react-router";
import { motion } from "@/components/landing/motion";

import { WHY_NOW_COPY } from "@/lib/landing-copy";

export function LandingWhyNow() {
  return (
    <section id="why-now" className="relative border-b border-white/5 bg-[#050505] py-20 sm:py-28">
      <div className="absolute inset-0 bc-grid opacity-40" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mono-label">{WHY_NOW_COPY.eyebrow}</p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-4 font-display text-3xl font-bold text-white sm:text-5xl"
          >
            {WHY_NOW_COPY.headline}{" "}
            <span className="bc-text-cyan-gradient">{WHY_NOW_COPY.headlineAccent}</span>
          </motion.h2>
          <p className="mt-4 text-base text-zinc-400 sm:text-lg">{WHY_NOW_COPY.subhead}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_NOW_COPY.eras.map((era, i) => (
            <motion.div
              key={era.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl bc-glass p-5 sm:p-6"
            >
              <p className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
                {era.label}
              </p>
              <h3 className="mt-3 font-display text-xl font-bold text-white">{era.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{era.body}</p>
            </motion.div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-zinc-500">
          Ready to build on the culture layer?{" "}
          <Link to="/join" className="text-[#00E5FF] underline-offset-2 hover:underline">
            Join Building Culture
          </Link>
        </p>
      </div>
    </section>
  );
}
