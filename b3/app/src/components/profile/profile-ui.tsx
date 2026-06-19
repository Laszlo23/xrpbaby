import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="space-y-2">
      <h2 className="font-heading text-xl font-semibold tracking-tight text-white md:text-2xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">{subtitle}</p>
      ) : null}
    </div>
  );
}

const STATUS_STYLES = {
  live: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  beta: "border-cyan-500/35 bg-cyan-500/10 text-cyan-200",
  exploring: "border-amber-500/35 bg-amber-500/10 text-amber-200",
  default: "border-zinc-600/40 bg-zinc-800/50 text-zinc-400",
} as const;

export function StatusBadge({
  label,
  tone = "default",
}: {
  label: string;
  tone?: keyof typeof STATUS_STYLES;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
        STATUS_STYLES[tone],
      )}
    >
      {label}
    </span>
  );
}

export function GlassCard({
  children,
  className,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md",
        hover &&
          "transition duration-200 hover:-translate-y-0.5 hover:border-[#00E5FF]/25 hover:bg-white/[0.06]",
        className,
      )}
    >
      {children}
    </div>
  );
}
