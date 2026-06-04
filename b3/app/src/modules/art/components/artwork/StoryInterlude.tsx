import { motion } from "framer-motion";

type StoryInterludeProps = {
  kicker: string;
  body: string;
  align?: "left" | "center";
};

export function StoryInterlude({ kicker, body, align = "center" }: StoryInterludeProps) {
  const centered = align === "center";

  return (
    <section className="relative py-28 md:py-40 px-6 md:px-16 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.4 }}
        className="absolute inset-0 exhibition-vignette pointer-events-none"
      />
      <div className={`relative max-w-5xl ${centered ? "mx-auto text-center" : ""}`}>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="text-[10px] md:text-xs uppercase tracking-[0.45em] text-primary mb-8"
        >
          ⎯⎯ {kicker}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, delay: 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
          className={`font-display text-[clamp(1.75rem,4.5vw,3.25rem)] leading-[1.18] text-foreground/90 ${centered ? "max-w-3xl mx-auto" : "max-w-2xl"}`}
        >
          {body}
        </motion.p>
      </div>
    </section>
  );
}
