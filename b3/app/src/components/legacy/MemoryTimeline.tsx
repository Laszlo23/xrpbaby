import { useEffect, useState } from "react";

type MemoryEvent = {
  id: string;
  type: string;
  payload: unknown;
  createdAt: string;
};

const TYPE_LABELS: Record<string, string> = {
  quest_claim: "Quest completed",
  agent_inbox_draft: "Agent draft",
  brand_quest_created: "Brand quest published",
  grove_invite: "Grove invite",
  credential_claim: "Credential earned",
};

export function MemoryTimeline({ address }: { address: string }) {
  const [events, setEvents] = useState<MemoryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/memory/timeline?address=${encodeURIComponent(address)}&limit=20`)
      .then((r) => r.json())
      .then((d: { events?: MemoryEvent[] }) => setEvents(d.events ?? []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [address]);

  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
      <h2 className="font-display text-lg font-semibold text-white">Culture memory</h2>
      <p className="mt-1 text-xs text-zinc-500">
        Everything you build here, stored on your timeline.
      </p>
      {loading ? (
        <p className="mt-4 animate-pulse text-sm text-zinc-500">Loading memory…</p>
      ) : events.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">
          Complete quests, use agents, or publish brand stories to fill your memory layer.
        </p>
      ) : (
        <ol className="mt-4 space-y-3">
          {events.map((ev) => (
            <li key={ev.id} className="relative border-l-2 border-[#C5FF41]/30 pl-4">
              <p className="text-sm font-medium text-white">
                {TYPE_LABELS[ev.type] ?? ev.type.replace(/_/g, " ")}
              </p>
              <p className="font-mono text-[10px] text-zinc-600">
                {new Date(ev.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
