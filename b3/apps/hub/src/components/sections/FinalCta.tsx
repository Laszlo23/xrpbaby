import { motion } from "framer-motion";
import { COMMUNITY_TELEGRAM_INVITE_URL, COMMUNITY_X_URL } from "@/lib/community-links";

export const FinalCta = () => {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-6 py-32 md:px-16 lg:px-24">
      <div className="absolute inset-0">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute left-1/2 top-1/2 h-[120vh] w-[120vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-gradient opacity-[0.08] blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-eco-gradient opacity-20 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="font-mono text-xs uppercase tracking-[0.4em] text-eco"
        >
          ● live · open · onchain
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 font-display text-6xl leading-[0.9] text-balance md:text-8xl lg:text-[10rem]"
        >
          it's <span className="italic text-gold">live.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-6 font-display text-3xl text-muted-foreground md:text-5xl"
        >
          you can enter now.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.6 }}
          className="mt-16 flex flex-col gap-4 sm:flex-row"
        >
          <a
            href="https://buildingculture.capital"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-gold-gradient px-8 py-5 font-mono text-sm uppercase tracking-[0.25em] text-primary-foreground glow-gold transition-transform duration-500 hover:scale-[1.02]"
          >
            <span>explore ecosystem</span>
            <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </a>
          <a
            href="https://0x.buildingculture.capital"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-3 rounded-full border border-secondary-glow/40 bg-secondary/10 px-8 py-5 font-mono text-sm uppercase tracking-[0.25em] text-foreground transition-all duration-500 hover:border-secondary-glow hover:glow-eco"
          >
            <span>join · test · build</span>
            <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.75 }}
          className="mt-14 border-t border-border/40 pt-12"
        >
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-gold">build the community</p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Ship updates, drops, and culture-first debate — follow and join the group so you do not
            build alone.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={COMMUNITY_X_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-3 rounded-full border border-primary/50 bg-primary/10 px-8 py-4 font-mono text-xs uppercase tracking-[0.28em] text-foreground transition-all duration-500 hover:border-primary hover:glow-gold sm:min-w-[220px]"
            >
              <span>follow on X</span>
              <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </a>
            <a
              href={COMMUNITY_TELEGRAM_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-3 rounded-full border border-secondary-glow/50 bg-secondary/15 px-8 py-4 font-mono text-xs uppercase tracking-[0.28em] text-foreground transition-all duration-500 hover:border-secondary-glow hover:glow-eco sm:min-w-[220px]"
            >
              <span>join Telegram</span>
              <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
