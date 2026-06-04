import { motion } from "framer-motion";
import { editionManifesto } from "@/modules/art/data/artworks";

export function EditionManifesto() {
  return (
    <section className="relative py-32 md:py-48 px-6 md:px-16 overflow-hidden border-t hairline">
      <div className="absolute inset-0 exhibition-vignette pointer-events-none" />
      <div className="relative max-w-5xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="text-[10px] uppercase tracking-[0.5em] text-primary mb-10"
        >
          ⎯⎯ {editionManifesto.headline}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="font-display text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.08] text-balance"
        >
          {editionManifesto.subhead}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mt-12 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
        >
          {editionManifesto.vault}
        </motion.p>
      </div>
    </section>
  );
}
