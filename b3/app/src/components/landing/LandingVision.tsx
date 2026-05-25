import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function LandingVision() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  const cards = [
    {
      q: "What if the people who live, work and contribute to a place could help shape its future?",
      tag: "PARTICIPATION",
    },
    {
      q: "What if ownership was transparent — for everyone, not just the few?",
      tag: "TRANSPARENCY",
    },
    {
      q: "What if every person, anywhere, could participate?",
      tag: "ACCESS",
    },
  ];

  return (
    <section
      id="vision"
      ref={ref}
      className="relative w-full overflow-hidden bg-[#050505] py-36 sm:py-44"
    >
      <motion.div
        style={{ y }}
        className="bc-spotlight pointer-events-none absolute inset-x-0 top-0 h-full"
      />
      <div className="absolute inset-0 bc-noise" />

      <motion.div className="relative mx-auto max-w-5xl px-5 text-center sm:px-8">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mono-label"
        >
          THE VISION
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="mt-6 font-display text-[40px] leading-[0.98] font-bold tracking-[-0.04em] text-white sm:text-7xl lg:text-[88px]"
        >
          Imagine if <br className="hidden sm:block" />
          <span className="bc-text-cyan-gradient">communities</span> could{" "}
          <br className="hidden sm:block" />
          fund themselves.
        </motion.h2>

        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
          {cards.map((item, i) => (
            <motion.div
              key={item.tag}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.7 }}
              className="rounded-3xl bc-glass p-7 text-left transition-all hover:border-[#00E5FF]/30"
            >
              <p className="mono-label !text-[#C47C59]">{item.tag}</p>
              <p className="mt-4 font-display text-[20px] leading-snug font-medium text-white">
                {item.q}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mx-auto mt-14 max-w-2xl text-lg text-zinc-400"
        >
          Building Culture creates the tools to make that possible.
        </motion.p>
      </motion.div>
    </section>
  );
}
