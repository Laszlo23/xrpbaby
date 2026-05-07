import { motion } from "framer-motion";

export const MiniApps = () => {
  const url = "https://miniapp-generator-fid-873944-260306170037188.neynar.app?fid=873944";
  return (
    <section className="relative px-6 py-32 md:px-16 md:py-48 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">04 — distribution</p>
          <h2 className="mt-6 font-display text-4xl text-balance md:text-6xl lg:text-7xl">
            mini apps. <span className="italic text-muted-foreground">where culture lives.</span>
          </h2>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="group relative"
          >
            <div className="absolute -inset-2 rounded-3xl bg-gold-gradient opacity-20 blur-2xl transition-opacity duration-500 group-hover:opacity-40" />
            <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-3">
              <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-secondary-glow/70" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">neynar · live</span>
              </div>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-b-2xl bg-background">
                <iframe
                  src={url}
                  title="Building Culture Mini App"
                  loading="lazy"
                  className="h-full w-full"
                />
              </div>
            </div>
          </motion.div>

          <div className="space-y-8">
            <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">
              built and shipped on <span className="text-foreground">farcaster</span>. a live preview, not a screenshot.
            </p>
            <div className="space-y-4">
              {["instant distribution", "social-native", "composable identity"].map((t, i) => (
                <motion.div
                  key={t}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  className="flex items-center gap-4 border-l border-primary/40 pl-5"
                >
                  <span className="font-mono text-xs text-gold">0{i + 1}</span>
                  <span className="font-display text-2xl">{t}</span>
                </motion.div>
              ))}
            </div>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-gold hover:translate-x-1 transition-transform"
            >
              open in farcaster <span>↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
