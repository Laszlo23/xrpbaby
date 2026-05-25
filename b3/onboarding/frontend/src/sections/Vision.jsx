import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export const Vision = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section
      id="vision"
      ref={ref}
      data-testid="vision-section"
      className="relative w-full overflow-hidden bg-[#050505] py-36 sm:py-44"
    >
      <motion.div
        style={{ y }}
        className="absolute inset-x-0 top-0 h-full bc-spotlight pointer-events-none"
      />
      <div className="absolute inset-0 bc-noise" />

      <div className="relative mx-auto max-w-5xl px-5 sm:px-8 text-center">
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
          className="mt-6 font-display text-[40px] sm:text-7xl lg:text-[88px] font-bold tracking-[-0.04em] text-white leading-[0.98]"
          data-testid="vision-headline"
        >
          Imagine if <br className="hidden sm:block" />
          <span className="bc-text-cyan-gradient">communities</span> could <br className="hidden sm:block" />
          fund themselves.
        </motion.h2>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {[
            { q: "What if the people who live, work and contribute to a place could help shape its future?", tag: "PARTICIPATION" },
            { q: "What if ownership was transparent — for everyone, not just the few?", tag: "TRANSPARENCY" },
            { q: "What if every person, anywhere, could participate?", tag: "ACCESS" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.7 }}
              className="bc-glass rounded-3xl p-7 text-left hover:border-[#00E5FF]/30 transition-all"
              data-testid={`vision-card-${i}`}
            >
              <p className="mono-label !text-[#C47C59]">{item.tag}</p>
              <p className="mt-4 font-display text-[20px] leading-snug text-white font-medium">
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
          className="mt-14 text-zinc-400 text-lg max-w-2xl mx-auto"
        >
          Building Culture creates the tools to make that possible.
        </motion.p>
      </div>
    </section>
  );
};

export default Vision;
