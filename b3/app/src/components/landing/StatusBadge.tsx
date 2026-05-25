import type { EcosystemStatus } from "@/lib/landing-ecosystem";

const STATUS_MAP: Record<EcosystemStatus, { color: string; label: string }> = {
  live: { color: "#C5FF41", label: "LIVE" },
  beta: { color: "#00E5FF", label: "BETA" },
  "coming-soon": { color: "#C47C59", label: "SOON" },
};

export function StatusBadge({ status }: { status: EcosystemStatus }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.beta;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-mono font-semibold tracking-[0.18em]"
      style={{ borderColor: `${s.color}50`, color: s.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}
