"use client";

type FilterState = {
  search: string;
  country: string;
  city: string;
  minYield: string;
  maxYield: string;
  verifiedOnly: boolean;
};

type Props = {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  countries: string[];
  cities: string[];
};

export function FilterBar({ filters, onChange, countries, cities }: Props) {
  return (
    <div className="bc-glass space-y-4 rounded-2xl p-4 sm:p-5">
      <p className="mono-label !text-zinc-500">Filters</p>
      <input
        type="search"
        placeholder="Search properties…"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-bc-cyan/40 focus:outline-none"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <select
          value={filters.country}
          onChange={(e) => onChange({ ...filters, country: e.target.value })}
          className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
        >
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={filters.city}
          onChange={(e) => onChange({ ...filters, city: e.target.value })}
          className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
        >
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="number"
          placeholder="Min yield %"
          value={filters.minYield}
          onChange={(e) => onChange({ ...filters, minYield: e.target.value })}
          className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
        />
        <input
          type="number"
          placeholder="Max yield %"
          value={filters.maxYield}
          onChange={(e) => onChange({ ...filters, maxYield: e.target.value })}
          className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
        />
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-400">
        <input
          type="checkbox"
          checked={filters.verifiedOnly}
          onChange={(e) => onChange({ ...filters, verifiedOnly: e.target.checked })}
          className="rounded border-white/20"
        />
        Verified listings only
      </label>
    </div>
  );
}

export type { FilterState };
