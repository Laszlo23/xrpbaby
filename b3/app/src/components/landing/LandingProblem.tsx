import { motion } from "@/components/landing/motion";
import { Activity, Coins, Sparkles, Target, Trophy, Users } from "lucide-react";

import { LandingProofCountUp } from "@/components/landing/LandingProofCountUp";
import { usePublicProof } from "@/hooks/usePublicProof";
import { landingProofLabel } from "@/lib/landing-proof-display";
import { proofSignalHref, proofSignalsFor } from "@/lib/proof-signals";

const STATS_ICONS = [Users, Activity, Target, Trophy, Sparkles, Coins] as const;

export function LandingProblem() {
  const { data: proof, isLoading } = usePublicProof();
  const signals = proofSignalsFor("stats");

  return (
    <section id="stats" className="relative w-full overflow-hidden bg-[#050505] py-28 sm:py-36">
      <motion.div className="absolute inset-0 bc-grid" />
      <motion.div className="absolute inset-0 bc-noise" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mono-label"
          >
            COMMUNITY STATS
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-4 font-display text-[40px] leading-[1.02] font-bold tracking-tight text-white sm:text-6xl"
          >
            Community <br />
            <span className="text-zinc-500">momentum.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg"
          >
            Founding-phase growth signals for builders joining early. Auditors and partners can
            verify raw figures on{" "}
            <a href="/grant-proof" className="text-[#00E5FF] underline-offset-2 hover:underline">
              /grant-proof
            </a>{" "}
            and our public traction API.
          </motion.p>
        </div>

        <div className="relative mt-14">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {signals.map((signal, i) => {
              const Icon = STATS_ICONS[i % STATS_ICONS.length] ?? Users;
              const href = proofSignalHref(signal.key, proof);
              const label = landingProofLabel(signal.key, signal.label);
              const valueNode = (
                <LandingProofCountUp
                  signalKey={signal.key}
                  proof={proof}
                  loading={isLoading}
                  className="font-display text-3xl font-bold text-white tabular-nums"
                />
              );
              return (
                <motion.div
                  key={signal.key}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-2xl bc-glass p-6 transition-all hover:border-white/20"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#0A0A0A]">
                      <Icon size={16} className="text-[#C5FF41]" />
                    </span>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="hover:text-[#00E5FF]"
                        title="View proof"
                      >
                        {valueNode}
                      </a>
                    ) : (
                      valueNode
                    )}
                  </div>
                  <p className="mt-4 text-[13px] font-semibold text-white">{label}</p>
                  <p className="mt-1 text-xs text-zinc-500">{signal.note}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
