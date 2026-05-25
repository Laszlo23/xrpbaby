import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";

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
    <section id="bcd" className="relative w-full overflow-hidden bg-[#070707] py-28 sm:py-36">
      <div className="absolute inset-0 bc-noise" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00E5FF]/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C47C59]/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 text-center sm:px-8">
        <p className="mono-label">BUILDING CULTURE DOLLAR</p>
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
          The Building Culture Dollar (BCD) is the future utility layer that ties every product,
          every place and every participant into a single, transparent economy.
        </p>

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
                BCD
              </div>
            </motion.div>
          </motion.div>
        </div>

        <p className="mt-10 font-mono text-[11px] tracking-[0.2em] text-zinc-500 uppercase sm:mt-14">
          Hover icons for names · tap to open products
        </p>

        <p className="mx-auto mt-10 max-w-xl font-mono text-sm tracking-[0.15em] text-zinc-500 uppercase sm:mt-16">
          A future utility layer · not financial advice
        </p>
      </div>
    </section>
  );
}
