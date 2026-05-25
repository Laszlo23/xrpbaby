import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, ArrowUpRight, Maximize2, Layers, Building2, LineChart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TOKENIZED_REAL_ESTATE_REPORT_PDF } from "../lib/media";
import { trackEvent } from "../lib/bcApi";

const HIGHLIGHTS = [
  { Icon: Building2, label: "Real estate rails" },
  { Icon: Layers, label: "Tokenization models" },
  { Icon: LineChart, label: "Market outlook" },
];

export const TokenizedReportShowcase = () => {
  const [previewOpen, setPreviewOpen] = useState(false);

  const openPreview = () => {
    trackEvent("tokenized_report_preview", "investors");
    setPreviewOpen(true);
  };

  const openExternal = () => {
    trackEvent("tokenized_report_open", "investors");
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
        data-testid="tokenized-report-showcase"
      >
        <div
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-60 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,229,255,0.35), rgba(197,255,65,0.2), rgba(196,124,89,0.35))",
          }}
        />
        <div className="relative overflow-hidden rounded-[22px] bg-[#080808]">
          <div className="absolute inset-0 bc-grid opacity-40" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#00E5FF]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#C47C59]/15 blur-3xl" />

          <div className="relative grid grid-cols-1 gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8 sm:p-8">
            <div className="relative mx-auto w-full max-w-[200px] sm:mx-0">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <div className="absolute inset-3 rotate-6 rounded-2xl border border-white/10 bg-white/5" />
                <div className="absolute inset-1.5 -rotate-3 rounded-2xl border border-[#00E5FF]/20 bg-[#00E5FF]/5" />
                <div className="relative flex aspect-[3/4] flex-col justify-between rounded-2xl border border-white/15 bg-gradient-to-br from-[#121212] to-black p-5 shadow-2xl">
                  <div>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#00E5FF]/30 bg-[#00E5FF]/10">
                      <FileText size={18} className="text-[#00E5FF]" aria-hidden />
                    </span>
                    <p className="mono-label mt-4 !text-[#C5FF41]">Research</p>
                    <p className="mt-2 font-display text-lg font-bold leading-tight text-white">
                      Tokenized Real Estate
                    </p>
                  </div>
                  <div className="space-y-2">
                    {[72, 48, 64, 40].map((w) => (
                      <div
                        key={w}
                        className="h-1.5 rounded-full bg-white/10"
                        style={{ width: `${w}%` }}
                      />
                    ))}
                  </div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">
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
                {HIGHLIGHTS.map(({ Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-zinc-300"
                  >
                    <Icon size={12} className="text-[#C47C59]" aria-hidden />
                    {label}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={openPreview}
                  data-testid="tokenized-report-preview"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#00E5FF]/40 bg-[#00E5FF]/10 px-6 py-3.5 text-[13px] font-semibold text-white transition-colors hover:border-[#00E5FF]/70 hover:bg-[#00E5FF]/20"
                >
                  <Maximize2 size={16} aria-hidden />
                  Preview in page
                </button>
                <button
                  type="button"
                  onClick={openExternal}
                  data-testid="tokenized-report-open"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C47C59] px-6 py-3.5 text-[13px] font-semibold text-black transition-colors hover:bg-[#d4926f]"
                >
                  Open full report
                  <ArrowUpRight size={16} aria-hidden />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent
          className="flex max-h-[92vh] w-[min(96vw,1100px)] max-w-[1100px] flex-col gap-0 overflow-hidden border-white/10 bg-[#0a0a0a] p-0 text-white sm:rounded-2xl"
          data-testid="tokenized-report-dialog"
        >
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
              className="mt-3 inline-flex w-fit items-center gap-1.5 text-[12px] font-semibold text-[#00E5FF] hover:text-[#C5FF41] transition-colors"
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
};

export default TokenizedReportShowcase;
