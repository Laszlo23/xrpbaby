import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Building2, FileText, Layers, LineChart, Maximize2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trackLandingEvent } from "@/lib/landing-api";
import {
  INVESTOR_DECK_PDF,
  LANDING_MEDIA,
  TOKENIZED_REAL_ESTATE_REPORT_PDF,
} from "@/lib/landing-media";

const PILLARS = [
  { Icon: Building2, label: "Real Estate", desc: "Tangible assets with verified ownership" },
  { Icon: Building2, label: "Community Ownership", desc: "People as participants, not customers" },
  { Icon: Building2, label: "Digital Identity", desc: "Reputation, history, transparency" },
  { Icon: Building2, label: "AI", desc: "Smarter matching, smarter markets" },
  { Icon: Building2, label: "Gamification", desc: "Participation as a rewarded experience" },
  { Icon: Building2, label: "Onchain Transparency", desc: "Every transaction, fully visible" },
] as const;

const REPORT_HIGHLIGHTS = [
  { Icon: Building2, label: "Real estate rails" },
  { Icon: Layers, label: "Tokenization models" },
  { Icon: LineChart, label: "Market outlook" },
] as const;

function TokenizedReportShowcase() {
  const [previewOpen, setPreviewOpen] = useState(false);

  const openPreview = () => {
    void trackLandingEvent("tokenized_report_preview", "investors");
    setPreviewOpen(true);
  };

  const openExternal = () => {
    void trackLandingEvent("tokenized_report_open", "investors");
    window.open(TOKENIZED_REAL_ESTATE_REPORT_PDF, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="group relative mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a] p-1"
      >
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-60 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,229,255,0.35), rgba(197,255,65,0.2), rgba(196,124,89,0.35))",
          }}
        />
        <div className="relative overflow-hidden rounded-[22px] bg-[#080808]">
          <div className="absolute inset-0 bc-grid opacity-40" />
          <div className="relative grid grid-cols-1 gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8 sm:p-8">
            <div className="relative mx-auto w-full max-w-[200px] sm:mx-0">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <div className="absolute inset-3 rotate-6 rounded-2xl border border-white/10 bg-white/5" />
                <motion.div className="absolute inset-1.5 -rotate-3 rounded-2xl border border-[#00E5FF]/20 bg-[#00E5FF]/5" />
                <div className="relative flex aspect-[3/4] flex-col justify-between rounded-2xl border border-white/15 bg-gradient-to-br from-[#121212] to-black p-5 shadow-2xl">
                  <div>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#00E5FF]/30 bg-[#00E5FF]/10">
                      <FileText size={18} className="text-[#00E5FF]" aria-hidden />
                    </span>
                    <p className="mono-label mt-4 !text-[#C5FF41]">Research</p>
                    <p className="mt-2 font-display text-lg leading-tight font-bold text-white">
                      Tokenized Real Estate
                    </p>
                  </div>
                  <p className="font-mono text-[9px] tracking-[0.2em] text-zinc-500 uppercase">
                    Building Culture · PDF
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="text-left">
              <p className="mono-label">DEEP DIVE REPORT</p>
              <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                The future of tokenized real estate
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
                Our research report maps how onchain ownership, community capital and regulated
                property markets converge — and where Building Culture sits in that stack.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {REPORT_HIGHLIGHTS.map(({ Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-zinc-300"
                  >
                    <Icon size={12} className="text-[#C47C59]" aria-hidden />
                    {label}
                  </span>
                ))}
              </div>
              <motion.div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={openPreview}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#00E5FF]/40 bg-[#00E5FF]/10 px-6 py-3.5 text-[13px] font-semibold text-white transition-colors hover:border-[#00E5FF]/70 hover:bg-[#00E5FF]/20"
                >
                  <Maximize2 size={16} aria-hidden />
                  Preview in page
                </button>
                <button
                  type="button"
                  onClick={openExternal}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C47C59] px-6 py-3.5 text-[13px] font-semibold text-black transition-colors hover:bg-[#d4926f]"
                >
                  Open full report
                  <ArrowUpRight size={16} aria-hidden />
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="flex max-h-[92vh] w-[min(96vw,1100px)] max-w-[1100px] flex-col gap-0 overflow-hidden border-white/10 bg-[#0a0a0a] p-0 text-white sm:rounded-2xl">
          <DialogHeader className="shrink-0 border-b border-white/10 px-5 py-4 text-left sm:px-6">
            <DialogTitle className="font-display text-xl font-bold text-white">
              Tokenized Real Estate Report
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Building Culture research · read inline or open in a new tab for printing
            </DialogDescription>
            <button
              type="button"
              onClick={openExternal}
              className="mt-3 inline-flex w-fit items-center gap-1.5 text-[12px] font-semibold text-[#00E5FF] transition-colors hover:text-[#C5FF41]"
            >
              Open in new window
              <ArrowUpRight size={14} aria-hidden />
            </button>
          </DialogHeader>
          <div className="relative min-h-0 flex-1 bg-[#050505]">
            <iframe
              title="Tokenized Real Estate Report"
              src={`${TOKENIZED_REAL_ESTATE_REPORT_PDF}#view=FitH`}
              className="h-[min(72vh,780px)] w-full border-0"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function LandingInvestors() {
  return (
    <section id="investors" className="relative w-full overflow-hidden bg-[#070707] py-28 sm:py-36">
      <div className="absolute inset-0 bc-noise" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative lg:col-span-5"
          >
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10">
              <img
                src={LANDING_MEDIA.investor}
                alt="Web3 architecture"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <motion.div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-[#00E5FF]/10" />
              <div className="absolute top-6 left-6 max-w-[180px] rounded-2xl bc-glass-strong p-4">
                <p className="mono-label !text-[#C5FF41]">AUM PIPELINE</p>
                <p className="mt-1 font-display text-2xl font-bold text-white">€42M</p>
                <p className="text-xs text-zinc-400">Property assets</p>
              </div>
              <div className="absolute right-6 bottom-6 max-w-[180px] rounded-2xl bc-glass-strong p-4">
                <p className="mono-label !text-[#00E5FF]">COMMUNITY</p>
                <p className="mt-1 font-display text-2xl font-bold text-white">5,200+</p>
                <p className="text-xs text-zinc-400">Active participants</p>
              </div>
            </div>
          </motion.div>

          <div className="lg:col-span-7">
            <p className="mono-label">FOR INVESTORS</p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-4 font-display text-[40px] leading-[1] font-bold tracking-tight text-white sm:text-6xl"
            >
              Invest in more than property. <br />
              Invest in <span className="bc-text-cyan-gradient">culture.</span>
            </motion.h2>
            <p className="mt-6 max-w-xl text-base text-zinc-400 sm:text-lg">
              Building Culture is a vertically integrated platform combining the physical, digital
              and human layers of real estate — built for the next century of community capital.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PILLARS.map((p, i) => (
                <motion.div
                  key={p.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3 rounded-2xl bc-glass p-4 transition-all hover:border-[#00E5FF]/30"
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black">
                    <p.Icon size={14} className="text-[#C47C59]" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{p.label}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href={INVESTOR_DECK_PDF}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => void trackLandingEvent("investor_deck_open", "investors")}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-[14px] font-semibold text-black transition-colors hover:bg-[#C5FF41]"
              >
                View Investor Deck
                <ArrowUpRight
                  size={16}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
              <a
                href="https://buildingculture.capital"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-4 text-[14px] font-semibold text-white hover:border-[#00E5FF]/60"
              >
                Read the Vision
              </a>
            </div>

            <TokenizedReportShowcase />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
