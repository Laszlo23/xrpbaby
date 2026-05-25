import { motion } from "framer-motion";
import { Building2, Users, Fingerprint, Brain, Gamepad2, Shield, ArrowUpRight } from "lucide-react";
import TokenizedReportShowcase from "../components/TokenizedReportShowcase";
import { MEDIA, INVESTOR_DECK_PDF } from "../lib/media";
import { trackEvent } from "../lib/bcApi";

const PILLARS = [
  { Icon: Building2, label: "Real Estate", desc: "Tangible assets with verified ownership" },
  { Icon: Users, label: "Community Ownership", desc: "People as participants, not customers" },
  { Icon: Fingerprint, label: "Digital Identity", desc: "Reputation, history, transparency" },
  { Icon: Brain, label: "AI", desc: "Smarter matching, smarter markets" },
  { Icon: Gamepad2, label: "Gamification", desc: "Participation as a rewarded experience" },
  { Icon: Shield, label: "Onchain Transparency", desc: "Every transaction, fully visible" },
];

export const Investors = () => {
  return (
    <section
      id="investors"
      data-testid="investors-section"
      className="relative w-full overflow-hidden bg-[#070707] py-28 sm:py-36"
    >
      <div className="absolute inset-0 bc-noise" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-3xl overflow-hidden border border-white/10 aspect-square">
              <img
                src={MEDIA.investor}
                alt="Web3 architecture"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-[#00E5FF]/10" />

              {/* Floating data cards */}
              <div className="absolute top-6 left-6 bc-glass-strong rounded-2xl p-4 max-w-[180px]">
                <p className="mono-label !text-[#C5FF41]">AUM PIPELINE</p>
                <p className="mt-1 font-display text-2xl font-bold text-white">€42M</p>
                <p className="text-xs text-zinc-400">Property assets</p>
              </div>
              <div className="absolute bottom-6 right-6 bc-glass-strong rounded-2xl p-4 max-w-[180px]">
                <p className="mono-label !text-[#00E5FF]">COMMUNITY</p>
                <p className="mt-1 font-display text-2xl font-bold text-white">5,200+</p>
                <p className="text-xs text-zinc-400">Active participants</p>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <div className="lg:col-span-7">
            <p className="mono-label">FOR INVESTORS</p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-4 font-display text-[40px] sm:text-6xl font-bold tracking-tight text-white leading-[1]"
              data-testid="investors-headline"
            >
              Invest in more than property. <br />
              Invest in <span className="bc-text-cyan-gradient">culture.</span>
            </motion.h2>
            <p className="mt-6 max-w-xl text-zinc-400 text-base sm:text-lg">
              Building Culture is a vertically integrated platform combining the physical, digital and human layers
              of real estate — built for the next century of community capital.
            </p>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PILLARS.map((p, i) => (
                <motion.div
                  key={p.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3 rounded-2xl bc-glass p-4 hover:border-[#00E5FF]/30 transition-all"
                  data-testid={`investor-pillar-${i}`}
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black border border-white/10">
                    <p.Icon size={14} className="text-[#C47C59]" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{p.label}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <a
                href={INVESTOR_DECK_PDF}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="investor-cta-deck"
                onClick={() => trackEvent("investor_deck_open", "investors")}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-[14px] font-semibold text-black hover:bg-[#C5FF41] transition-colors"
              >
                View Investor Deck
                <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <a
                href="https://buildingculture.capital"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="investor-cta-vision"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-4 text-[14px] font-semibold text-white hover:border-[#00E5FF]/60"
              >
                Read the Vision
              </a>
            </div>

            <TokenizedReportShowcase />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Investors;
