import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

const SHIPPED = [
  "Building Culture Capital",
  "Building Culture App",
  "Building Culture Home",
  "Building Culture ID",
  "Building Culture Art",
  "WohnAI · AI Real Estate Agent",
  "Building Culture Game",
  "Building Culture MiniApp",
];

const UPCOMING = [
  { title: "Tokenized Property Marketplace", note: "Onchain ownership of curated, real-world assets" },
  { title: "Community Funding Platform", note: "Communities raising capital from communities" },
  { title: "BCD Utility Launch", note: "Single currency for the entire ecosystem" },
  { title: "Global Building Culture Network", note: "City-by-city expansion of the movement" },
];

export const Future = () => {
  return (
    <section
      id="future"
      data-testid="future-section"
      className="relative w-full overflow-hidden bg-[#050505] py-28 sm:py-36"
    >
      <div className="absolute inset-0 bc-grid opacity-40" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-3xl">
          <p className="mono-label">THE FUTURE</p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-4 font-display text-[40px] sm:text-7xl font-bold tracking-tight text-white leading-[1]"
            data-testid="future-headline"
          >
            What we're <br />
            <span className="text-zinc-500">building next.</span>
          </motion.h2>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Shipped */}
          <div data-testid="roadmap-shipped">
            <div className="flex items-center gap-3 mb-8">
              <span className="inline-flex h-2 w-2 rounded-full bg-[#C5FF41] animate-pulse" />
              <p className="mono-label !text-[#C5FF41]">SHIPPED · BETA</p>
            </div>
            <ul className="space-y-3">
              {SHIPPED.map((s, i) => (
                <motion.li
                  key={s}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 rounded-2xl bc-glass px-5 py-4"
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#C5FF41]/15 border border-[#C5FF41]/40">
                    <Check size={12} className="text-[#C5FF41]" />
                  </span>
                  <span className="text-[15px] text-white font-medium">{s}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Upcoming */}
          <div data-testid="roadmap-upcoming">
            <div className="flex items-center gap-3 mb-8">
              <span className="inline-flex h-2 w-2 rounded-full bg-[#00E5FF] animate-pulse" />
              <p className="mono-label">UPCOMING</p>
            </div>
            <ul className="space-y-3">
              {UPCOMING.map((u, i) => (
                <motion.li
                  key={u.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 rounded-2xl bc-glass px-5 py-5 hover:border-[#00E5FF]/30 transition-all"
                >
                  <span className="inline-flex h-6 w-6 mt-0.5 items-center justify-center rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/40">
                    <ArrowRight size={12} className="text-[#00E5FF]" />
                  </span>
                  <div>
                    <p className="text-[15px] text-white font-semibold">{u.title}</p>
                    <p className="text-sm text-zinc-500 mt-1">{u.note}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Future;
