import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { motion } from "@/components/landing/motion";
import {
  LANDING_FLOW_COPY,
  LANDING_FLOW_PRIMARY,
  LANDING_FLOW_SECONDARY,
  type EcosystemFlowStep,
} from "@/lib/landing-copy";

function FlowLink({ href, children }: { href: string; children: ReactNode }) {
  if (href.startsWith("#")) {
    return (
      <a href={href} className="group block">
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className="group block">
      {children}
    </Link>
  );
}

function PrimaryStep({
  step,
  index,
  reduceMotion,
}: {
  step: EcosystemFlowStep;
  index: number;
  reduceMotion: boolean;
}) {
  return (
    <div className="flex flex-col items-center lg:flex-row">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.05 }}
      >
        <FlowLink href={step.href}>
          <div
            className={`min-w-[120px] rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center transition group-hover:border-[#00E5FF]/40 group-hover:bg-white/[0.06] ${
              reduceMotion ? "" : "motion-safe:animate-none"
            }`}
          >
            <p className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
              Step {index + 1}
            </p>
            <p className="mt-1 font-display text-sm font-bold text-white sm:text-base">
              {step.label}
            </p>
          </div>
        </FlowLink>
      </motion.div>
      {index < LANDING_FLOW_PRIMARY.length - 1 ? (
        <div
          className="flex h-8 items-center justify-center lg:h-auto lg:w-8 lg:px-1"
          aria-hidden
        >
          <ChevronRight
            size={18}
            className={`rotate-90 text-zinc-600 lg:rotate-0 ${reduceMotion ? "" : "motion-safe:animate-pulse"}`}
          />
        </div>
      ) : null}
    </div>
  );
}

function SecondaryStep({ step }: { step: EcosystemFlowStep }) {
  return (
    <FlowLink href={step.href}>
      <span className="inline-flex rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-sm font-medium text-zinc-400 transition group-hover:border-zinc-500/40 group-hover:text-zinc-200">
        {step.label}
      </span>
    </FlowLink>
  );
}

export function LandingEcosystemFlow() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <section
      id="flow"
      className="relative border-b border-white/5 bg-[#070707] py-16 sm:py-24"
      aria-label="How Building Culture works"
    >
      <div className="absolute inset-0 bc-grid opacity-30" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mono-label">{LANDING_FLOW_COPY.eyebrow}</p>
          <h2 className="mt-4 font-display text-2xl font-bold text-white sm:text-4xl">
            {LANDING_FLOW_COPY.headline}
          </h2>
          <p className="mt-3 text-sm text-zinc-400 sm:text-base">{LANDING_FLOW_COPY.body}</p>
        </div>

        <div className="mt-12 flex flex-col items-stretch gap-3 lg:flex-row lg:items-center lg:justify-center lg:gap-0">
          {LANDING_FLOW_PRIMARY.map((step, i) => (
            <PrimaryStep key={step.id} step={step} index={i} reduceMotion={reduceMotion} />
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-xl text-center">
          <p className="text-sm text-zinc-500">{LANDING_FLOW_COPY.secondaryLead}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {LANDING_FLOW_SECONDARY.map((step) => (
              <SecondaryStep key={step.id} step={step} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
