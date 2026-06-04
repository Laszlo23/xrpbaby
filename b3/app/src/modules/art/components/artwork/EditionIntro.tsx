import { motion } from "framer-motion";
import { editionManifesto } from "@/modules/art/data/artworks";

type Manifesto = typeof editionManifesto;

export function EditionIntro({ manifesto }: { manifesto: Manifesto }) {
  return (
    <header className="relative px-6 md:px-16 pt-32 md:pt-40 pb-20 md:pb-28 max-w-[90rem] mx-auto">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
        className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground mb-10"
      >
        ⎯⎯ {manifesto.headline}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, delay: 0.08 }}
        className="font-display text-[clamp(2.75rem,7vw,6rem)] leading-[1.02] max-w-4xl text-balance"
      >
        {manifesto.subhead}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.18 }}
        className="mt-10 max-w-2xl text-lg text-muted-foreground leading-[1.85]"
      >
        {manifesto.vault}
      </motion.p>
    </header>
  );
}
