import { motion } from "framer-motion";

const ideas = [
  {
    tag: "Q1",
    title: "tokenized land plots",
    body: "fractional ownership of real estate, fully onchain. anyone, anywhere.",
  },
  {
    tag: "Q2",
    title: "cultural treasury",
    body: "a community-owned vault funding artists, builders and local culture.",
  },
  {
    tag: "Q3",
    title: "eco yield",
    body: "real-world green projects backing $BCD. value that grows things.",
  },
  {
    tag: "Q4",
    title: "open city protocol",
    body: "the rails for any community to spin up its own micro-economy.",
  },
];

export const WhatsNext = () => {
  return (
    <section className="relative overflow-hidden px-6 py-32 md:px-16 md:py-48 lg:px-24">
      <div className="absolute inset-0">
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-eco-gradient opacity-20 blur-3xl animate-pulse-glow" />
        <div className="absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-gold-gradient opacity-10 blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">06 — what's next</p>
          <h2 className="mt-6 font-display text-4xl text-balance md:text-6xl lg:text-7xl">
            a future <span className="italic text-gold">worth building.</span>
          </h2>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            we believe ownership should be open. that culture is infrastructure. that the next economy is built — not waited for. here's where we're going.
          </p>
        </motion.div>

        <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-2">
          {ideas.map((idea, i) => (
            <motion.div
              key={idea.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/30 p-8 backdrop-blur-sm transition-colors duration-500 hover:border-secondary-glow/50"
            >
              <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                   style={{ background: "radial-gradient(400px circle at 50% 0%, hsl(var(--secondary-glow)/0.12), transparent 70%)" }} />
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-eco">{idea.tag} · 2026</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">in motion</span>
              </div>
              <h3 className="mt-10 font-display text-3xl leading-tight md:text-4xl">{idea.title}</h3>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">{idea.body}</p>
              <div className="mt-8 h-px w-12 bg-gradient-to-r from-primary/60 to-transparent transition-all duration-500 group-hover:w-32" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="mt-24 border-l-2 border-gold pl-8 max-w-3xl"
        >
          <p className="font-display text-2xl italic text-foreground/80 md:text-3xl">
            "we're not predicting the future. we're <span className="text-gold">building it</span>, in public, week by week."
          </p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            — the building culture team
          </p>
        </motion.div>
      </div>
    </section>
  );
};
