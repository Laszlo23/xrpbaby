import { motion } from "@/components/landing/motion";

import { MANIFESTO_LINES } from "@/lib/landing-copy";

export function LandingManifesto() {
  return (
    <section id="manifesto" className="relative w-full overflow-hidden bg-[#050505] py-28 sm:py-36">
      <div className="absolute inset-0 bc-spotlight pointer-events-none" />
      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
        <p className="mono-label">BUILDING CULTURE MANIFESTO</p>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 font-display text-[36px] leading-[1.05] font-bold tracking-tight text-white sm:text-5xl"
        >
          Most platforms extract. <br />
          <span className="bc-text-gradient">We distribute.</span>
        </motion.h2>

        <ul className="mt-16 space-y-8">
          {MANIFESTO_LINES.map((line, i) => (
            <motion.li
              key={line.contrast}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-3xl bc-glass px-6 py-8 sm:px-10"
            >
              <p className="text-base text-zinc-500 sm:text-lg">{line.contrast}</p>
              <p className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
                {line.ours}
              </p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
