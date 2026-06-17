import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import {
  Brain,
  ChevronRight,
  Coins,
  Fingerprint,
  ShieldCheck,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

import { BCC_ADDRESS } from "@bc/bcc-kit";

import { LiveProofTicker } from "@/components/shared/LiveProofTicker";
import { getLayerAccent, getLayerIcon } from "@/lib/ecosystem-layers";
import {
  LANDING_ECOSYSTEM,
  ecosystemLink,
  type LandingEcosystemApp,
} from "@/lib/landing-ecosystem";

const STATUS_DOT: Record<string, string> = {
  live: "#C5FF41",
  beta: "#00E5FF",
  "coming-soon": "#C47C59",
};

const VALUE_FLOW_STEPS: {
  Icon: LucideIcon;
  label: string;
  accent: string;
  highlight?: boolean;
}[] = [
  { Icon: UserPlus, label: "User joins", accent: "#839788" },
  { Icon: Fingerprint, label: "claims .culture ID", accent: "#C5FF41" },
  { Icon: Brain, label: "agents build memory", accent: "#00E5FF" },
  { Icon: ShieldCheck, label: "proof grows", accent: "#C47C59" },
  { Icon: Coins, label: "value flows in $BCC", accent: "#C5FF41", highlight: true },
];

function BccValueFlow() {
  return (
    <div className="mx-auto mt-10 max-w-4xl sm:mt-12">
      <p className="mono-label">VALUE FLOW</p>

      <div className="relative mt-6">
        <div
          className="pointer-events-none absolute top-1/2 right-[8%] left-[8%] hidden h-px -translate-y-1/2 sm:block"
          aria-hidden
        >
          <div className="h-full bg-gradient-to-r from-[#839788]/30 via-[#00E5FF]/50 to-[#C5FF41]/40" />
        </div>

        <div className="flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-1">
          {VALUE_FLOW_STEPS.map((step, i) => (
            <div
              key={step.label}
              className="flex flex-col items-center sm:flex-row sm:items-center"
            >
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="relative flex items-center gap-2.5 rounded-full border border-white/10 bc-glass px-4 py-2.5 sm:px-3.5 sm:py-2"
                style={{ boxShadow: `0 0 24px -12px ${step.accent}60` }}
              >
                <step.Icon size={14} style={{ color: step.accent }} aria-hidden />
                <span
                  className={`font-mono text-[11px] tracking-wide sm:text-xs ${
                    step.highlight ? "bc-text-gradient font-semibold" : "text-zinc-300"
                  }`}
                >
                  {step.label}
                </span>
              </motion.div>

              {i < VALUE_FLOW_STEPS.length - 1 && (
                <ChevronRight
                  size={16}
                  className="my-1 rotate-90 text-zinc-600 sm:my-0 sm:mx-1 sm:rotate-0"
                  aria-hidden
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OrbitIcon({
  project,
  baseAngle,
  radius,
  ringRotation,
}: {
  project: LandingEcosystemApp;
  baseAngle: number;
  radius: number;
  ringRotation: MotionValue<number>;
}) {
  const Icon = getLayerIcon(project.layer);
  const accent = getLayerAccent(project.layer);
  const statusColor = STATUS_DOT[project.status] ?? STATUS_DOT.beta;
  const href = ecosystemLink(project);

  const x = useTransform(ringRotation, (deg) => {
    const rad = ((baseAngle + deg) * Math.PI) / 180;
    return Math.sin(rad) * radius;
  });
  const y = useTransform(ringRotation, (deg) => {
    const rad = ((baseAngle + deg) * Math.PI) / 180;
    return -Math.cos(rad) * radius;
  });

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 z-10"
      style={{ x, y, translateX: "-50%", translateY: "-50%" }}
    >
      <motion.a
        href={href ?? "#ecosystem"}
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
        title={project.name}
        aria-label={project.name}
        className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/70 backdrop-blur-md transition-colors hover:border-white/35 sm:h-11 sm:w-11"
        style={{ boxShadow: `0 0 22px -6px ${accent}80` }}
        whileHover={{ scale: 1.12 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <span
          className="absolute inset-0 rounded-full opacity-60 transition-opacity group-hover:opacity-100"
          style={{ background: `radial-gradient(circle, ${accent}35 0%, transparent 70%)` }}
        />
        <Icon size={20} className="relative" style={{ color: accent }} aria-hidden />
        <span
          className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-[#070707]"
          style={{ background: statusColor }}
          aria-hidden
        />
        <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 rounded-md border border-white/10 bg-black/90 px-2 py-1 text-[10px] font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 sm:text-[11px]">
          {project.name}
        </span>
      </motion.a>
    </motion.div>
  );
}

function OrbitRing({
  projects,
  radius,
  duration,
  reverse,
}: {
  projects: LandingEcosystemApp[];
  radius: number;
  duration: number;
  reverse: boolean;
}) {
  const ringRotation = useMotionValue(0);
  const n = projects.length;

  useEffect(() => {
    ringRotation.set(0);
    const controls = animate(ringRotation, reverse ? -360 : 360, {
      duration,
      repeat: Infinity,
      ease: "linear",
    });
    return () => controls.stop();
  }, [duration, reverse, ringRotation]);

  if (!n) return null;

  return (
    <>
      {projects.map((project, i) => (
        <OrbitIcon
          key={project.id}
          project={project}
          baseAngle={(360 / n) * i}
          radius={radius}
          ringRotation={ringRotation}
        />
      ))}
    </>
  );
}

function getOrbitRadii() {
  if (typeof window === "undefined") return { inner: 128, outer: 178 };
  const w = window.innerWidth;
  if (w < 640) return { inner: 98, outer: 132 };
  if (w < 1024) return { inner: 138, outer: 192 };
  return { inner: 152, outer: 208 };
}

export function LandingBcd() {
  const [radii, setRadii] = useState(getOrbitRadii);
  const projects = LANDING_ECOSYSTEM;

  useEffect(() => {
    const onResize = () => setRadii(getOrbitRadii());
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const inner = projects.filter((_, i) => i % 2 === 0);
  const outer = projects.filter((_, i) => i % 2 === 1);

  return (
    <section id="bcc" className="relative w-full overflow-hidden bg-[#070707] py-28 sm:py-36">
      <div className="absolute inset-0 bc-noise" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00E5FF]/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C47C59]/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 text-center sm:px-8">
        <p className="mono-label">BUILDING CULTURE COIN</p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-4 font-display text-[40px] leading-[1] font-bold tracking-tight text-white sm:text-7xl"
        >
          One Ecosystem. <br />
          One <span className="bc-text-gradient">Currency.</span>
        </motion.h2>

        <p className="mx-auto mt-8 max-w-2xl text-base text-zinc-400 sm:text-lg">
          $BCC is the internal currency for agent tasks, referrals, reputation, rewards, marketplace
          payments, and ecosystem coordination.
        </p>

        <BccValueFlow />

        <div className="relative mx-auto mt-16 flex items-center justify-center sm:mt-20">
          <motion.div className="relative h-[min(92vw,380px)] w-[min(92vw,380px)] sm:h-[460px] sm:w-[460px] lg:h-[520px] lg:w-[520px]">
            <div
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#00E5FF]/25"
              style={{ width: radii.inner * 2, height: radii.inner * 2 }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/12"
              style={{ width: radii.outer * 2, height: radii.outer * 2 }}
              aria-hidden
            />

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-dashed border-white/10"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
              className="absolute inset-5 rounded-full border border-white/8 sm:inset-6"
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 95, repeat: Infinity, ease: "linear" }}
              className="absolute inset-10 rounded-full border border-[#00E5FF]/25 sm:inset-12"
            />

            <OrbitRing projects={inner} radius={radii.inner} duration={85} reverse={false} />
            <OrbitRing projects={outer} radius={radii.outer} duration={110} reverse />

            <motion.div
              className="absolute inset-[26%] flex items-center justify-center rounded-full bc-glass-strong bc-cyan-glow sm:inset-[24%]"
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute inset-3 rounded-full bg-gradient-to-br from-[#C47C59] via-black to-[#00E5FF] opacity-90" />
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{ opacity: [0.35, 0.65, 0.35] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  background: "radial-gradient(circle, rgba(0,229,255,0.35) 0%, transparent 65%)",
                }}
              />
              <div className="relative font-display text-2xl font-black text-white sm:text-4xl">
                $BCC
              </div>
            </motion.div>
          </motion.div>
        </div>

        <p className="mt-10 font-mono text-[11px] tracking-[0.2em] text-zinc-500 uppercase sm:mt-14">
          Hover icons for names · tap to open products
        </p>

        <p className="mx-auto mt-6 max-w-xl break-all font-mono text-[10px] tracking-[0.12em] text-zinc-500 uppercase sm:text-[11px]">
          $BCC on Base ·{" "}
          <a
            href={`https://basescan.org/token/${BCC_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00E5FF]/90 underline-offset-2 hover:underline"
          >
            {BCC_ADDRESS}
          </a>
        </p>

        <LiveProofTicker section="bcc" className="mx-auto mt-10 max-w-3xl sm:mt-12" />

        <p className="mx-auto mt-6 max-w-xl font-mono text-sm tracking-[0.15em] text-zinc-500 uppercase">
          Live on Base · not financial advice
        </p>
      </div>
    </section>
  );
}
