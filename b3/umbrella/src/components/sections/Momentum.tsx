import { motion } from "framer-motion";

const steps = [
  { w: "week 01", t: "idea", d: "an ecosystem for ownership." },
  { w: "week 02", t: "build", d: "protocol, app, eco layer in motion." },
  { w: "week 03", t: "mainnet", d: "$BCD live. real transactions." },
  { w: "week 04", t: "mini apps", d: "shipped on farcaster." },
  { w: "week 05", t: "hackathons", d: "the network compounds." },
];

export const Momentum = () => {
  return (
    <section className="relative px-6 py-32 md:px-16 md:py-48 lg:px-24">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">05 — momentum</p>
          <h2 className="mt-6 font-display text-4xl text-balance md:text-6xl lg:text-7xl">
            built in <span className="italic text-gold">weeks.</span>
          </h2>
        </motion.div>

        <div className="relative mt-20">
          <div className="absolute left-0 right-0 top-6 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
            {steps.map((s, i) => (
              <motion.div
                key={s.t}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ delay: i * 0.12, duration: 0.7 }}
                className="relative pt-16"
              >
                <span className="absolute left-0 top-3 h-6 w-6 rounded-full border border-primary/40 bg-background">
                  <span className="absolute inset-1 rounded-full bg-gold-gradient" />
                </span>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{s.w}</p>
                <h3 className="mt-2 font-display text-2xl">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-24 font-display text-3xl italic text-gold md:text-5xl"
        >
          this is just the beginning.
        </motion.p>
      </div>
    </section>
  );
};
