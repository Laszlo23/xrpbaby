type Step = {
  id: string;
  label: string;
  sessions: number;
  conversionFromPrevious: number | null;
  dropoffPct: number | null;
};

export function FunnelChart({
  funnelName,
  totalSessions,
  steps,
  biggestLeak,
}: {
  funnelName: string;
  totalSessions: number;
  steps: Step[];
  biggestLeak: { stepId: string; label: string; dropoffPct: number } | null;
}) {
  if (totalSessions === 0) {
    return (
      <p className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-500">
        Funnel <span className="text-zinc-300">{funnelName}</span> — waiting for session data.
      </p>
    );
  }

  const maxSessions = Math.max(1, ...steps.map((s) => s.sessions));

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium text-white">{funnelName}</h3>
        <span className="text-xs text-zinc-500">{totalSessions} sessions</span>
      </div>
      <div className="space-y-3">
        {steps.map((step) => {
          const widthPct = Math.round((step.sessions / maxSessions) * 100);
          const isLeak = biggestLeak?.stepId === step.id;
          return (
            <div key={step.id}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className={isLeak ? "text-amber-300" : "text-zinc-300"}>{step.label}</span>
                <span className="text-zinc-500">
                  {step.sessions}
                  {step.dropoffPct != null && step.dropoffPct > 0 && (
                    <span className="ml-2 text-amber-400/90">−{step.dropoffPct}%</span>
                  )}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className={`h-full rounded-full transition-all ${isLeak ? "bg-amber-500" : "bg-cyan-500"}`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {biggestLeak && (
        <p className="mt-4 text-xs text-amber-300/90">
          Biggest leak: {biggestLeak.label} ({biggestLeak.dropoffPct}% dropoff)
        </p>
      )}
    </div>
  );
}
