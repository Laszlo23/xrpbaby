import { motion } from "framer-motion";
import { Building2, Users, Coins, Lock, TrendingDown } from "lucide-react";
import { MEDIA } from "../lib/media";

const PROBLEMS = [
  { Icon: Building2, label: "Empty Buildings", value: "60M+", note: "vacant homes across Europe alone" },
  { Icon: TrendingDown, label: "Declining Villages", value: "1 in 3", note: "rural communities are shrinking" },
  { Icon: Coins, label: "Rising Costs", value: "+87%", note: "housing prices since 2015" },
  { Icon: Lock, label: "Lack of Ownership", value: "<25%", note: "of young adults own a home" },
  { Icon: Users, label: "Financing Barriers", value: "8 of 10", note: "blocked by traditional banks" },
];

export const Problem = () => {
  return (
    <section
      id="problem"
      data-testid="problem-section"
      className="relative w-full overflow-hidden bg-[#050505] py-28 sm:py-36"
    >
      <div className="absolute inset-0 bc-grid" />
      <div className="absolute inset-0 bc-noise" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left: Visual */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
              className="relative rounded-3xl overflow-hidden border border-white/5"
              data-testid="problem-visual"
            >
              <img
                src={MEDIA.problem}
                alt="Decline of community spaces"
                className="w-full h-[420px] sm:h-[520px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="mono-label mb-2 !text-[#C47C59]">CHAPTER 01 · THE LOSS</p>
                <p className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">
                  Every empty building was once a home, a story, a community.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right: Content */}
          <div className="lg:col-span-7">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mono-label"
            >
              THE PROBLEM
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mt-4 font-display text-[40px] sm:text-6xl font-bold tracking-tight text-white leading-[1.02]"
              data-testid="problem-headline"
            >
              Communities are <br />
              <span className="text-zinc-500">disappearing.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-6 max-w-xl text-zinc-400 text-base sm:text-lg leading-relaxed"
            >
              For decades, the systems we built to grow our cities have left people behind.
              Homes sit empty. Villages fade. Ownership feels impossible. We believe there is another way.
            </motion.p>

            {/* Timeline list */}
            <div className="mt-14 relative" data-testid="problem-timeline">
              <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-[#C47C59]/60 via-white/10 to-[#00E5FF]/40" />
              <ul className="space-y-5">
                {PROBLEMS.map((p, i) => (
                  <motion.li
                    key={p.label}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ delay: i * 0.08 }}
                    className="relative flex items-center gap-5 bc-glass rounded-2xl pl-5 pr-6 py-5 hover:border-white/20 transition-all"
                    data-testid={`problem-item-${i}`}
                  >
                    <span className="relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0A0A0A] border border-white/10">
                      <p.Icon size={16} className="text-[#C47C59]" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-white">{p.label}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{p.note}</p>
                    </div>
                    <p className="font-display text-2xl font-bold text-white shrink-0">{p.value}</p>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Problem;
