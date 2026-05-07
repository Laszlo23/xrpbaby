import { motion } from "framer-motion";

export const TokenLayer = () => {
  return (
    <section className="relative overflow-hidden px-6 py-32 md:px-16 md:py-48 lg:px-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">03 — currency</p>
          <h2 className="mt-6 font-display text-4xl text-balance md:text-6xl lg:text-7xl">
            building culture <span className="italic text-gold">dollar.</span>
          </h2>
          <div className="mt-10 space-y-3 font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground">
            <p><span className="text-eco">●</span> live on mainnet</p>
            <p><span className="text-gold">●</span> testable. usable. real.</p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 max-w-md">
            {[
              { l: "supply", v: "circulating" },
              { l: "network", v: "mainnet" },
              { l: "status", v: "live" },
              { l: "access", v: "open" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-border/60 bg-card/40 p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{s.l}</p>
                <p className="mt-2 font-display text-xl text-foreground">{s.v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* token core */}
        <div className="relative flex h-[500px] items-center justify-center md:h-[600px]">
          {/* outer rings */}
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-primary/20"
              style={{ width: `${i * 150}px`, height: `${i * 150}px` }}
              animate={{ rotate: i % 2 ? 360 : -360 }}
              transition={{ duration: 30 + i * 10, repeat: Infinity, ease: "linear" }}
            >
              <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-primary" />
            </motion.div>
          ))}

          {/* core */}
          <div className="relative">
            <div className="absolute inset-0 -m-20 animate-pulse-glow rounded-full bg-gold-gradient opacity-40 blur-3xl" />
            <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-gold-gradient glow-gold md:h-52 md:w-52">
              <div className="font-display text-3xl text-primary-foreground md:text-4xl">$BCD</div>
            </div>
          </div>

          {/* floating tx mockups */}
          {[
            { x: "-65%", y: "-30%", label: "transfer · 0.42 BCD", delay: 0 },
            { x: "55%", y: "-40%", label: "mint · 1.00 BCD", delay: 1.2 },
            { x: "-55%", y: "45%", label: "swap · 12.8 BCD", delay: 2.4 },
          ].map((tx, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: tx.delay * 0.3 + 0.5, duration: 0.8 }}
              style={{ transform: `translate(${tx.x}, ${tx.y})` }}
              className="absolute left-1/2 top-1/2 rounded-lg border border-border/80 bg-card/80 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/80 backdrop-blur"
            >
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-secondary-glow" />
              {tx.label}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
