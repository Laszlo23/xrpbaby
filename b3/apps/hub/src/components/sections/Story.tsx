import { motion } from "framer-motion";
import storyImg from "@/assets/story-visual.jpg";

const beats = [
  { text: "ownership is broken.", muted: false },
  { text: "real estate is locked.", muted: false },
  { text: "community has no access.", muted: false },
  { text: "—", muted: true },
  { text: "so we built it.", muted: false, accent: true },
];

export const Story = () => {
  return (
    <section className="relative px-6 py-32 md:px-16 md:py-48 lg:px-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
        <div className="order-2 lg:order-1">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 0.6 }}
            className="mb-10 font-mono text-xs uppercase tracking-[0.3em] text-gold"
          >
            01 — why
          </motion.p>

          <div className="space-y-7 font-display text-3xl leading-tight text-balance md:text-5xl lg:text-6xl">
            {beats.map((b, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ delay: i * 0.15, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className={
                  b.accent
                    ? "italic text-gold"
                    : b.muted
                    ? "text-muted-foreground/40 text-2xl"
                    : "text-foreground/80"
                }
              >
                {b.text}
              </motion.p>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="order-1 lg:order-2 relative overflow-hidden rounded-2xl border border-border/60"
        >
          <motion.img
            src={storyImg}
            alt="Abstract ownership architecture"
            width={1280}
            height={1600}
            loading="lazy"
            initial={{ scale: 1 }}
            whileInView={{ scale: 1.08 }}
            viewport={{ once: true }}
            transition={{ duration: 8, ease: "linear" }}
            className="h-[60vh] w-full object-cover lg:h-[80vh]"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-background via-transparent to-secondary/20" />
          <div className="absolute bottom-6 left-6 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            building culture · 2025
          </div>
        </motion.div>
      </div>
    </section>
  );
};
