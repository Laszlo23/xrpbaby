export type ReputationTimelineEvent = {
  id: string;
  type: string;
  weight: number;
  source: string;
  proofRef?: string | null;
  createdAt: string | Date;
  metadata?: unknown;
};

const TYPE_LABELS: Record<string, string> = {
  quest_complete: "Quest completed",
  grant_submitted: "Grant submitted",
  campaign_join: "Campaign joined",
  agent_run: "Agent run",
  referral: "Referral",
  build_shipped: "Build shipped",
  credential_issued: "Credential issued",
  external_attestation: "External attestation",
};

function formatType(type: string): string {
  return TYPE_LABELS[type] ?? type.replace(/_/g, " ");
}

export function ReputationTimeline({ events }: { events: ReputationTimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-6 text-sm text-zinc-500">
        No reputation events yet. Complete quests, earn credentials, or run agents to build your
        timeline.
      </p>
    );
  }

  return (
    <ol className="space-y-3">
      {events.map((event) => (
        <li
          key={event.id}
          className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
        >
          <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#C5FF41]" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-zinc-200">{formatType(event.type)}</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              {event.source} · weight {event.weight.toFixed(1)} ·{" "}
              {new Date(event.createdAt).toLocaleDateString()}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
