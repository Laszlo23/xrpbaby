"use client";

import type { PropertyShareRow } from "@/lib/usePropertyShareList";

type Props = {
  rows: PropertyShareRow[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function InvestPropertySwitcher({ rows, selectedId, onSelect }: Props) {
  if (rows.length <= 1) return null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label htmlFor="invest-property-select" className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
        Property
      </label>
      <select
        id="invest-property-select"
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
        className="max-w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-sm text-white focus:border-brand/50 focus:outline-none"
      >
        {rows.map((r) => (
          <option key={r.id.toString()} value={r.id.toString()}>
            {r.demo?.headline ?? r.name} ({r.symbol})
          </option>
        ))}
      </select>
    </div>
  );
}
