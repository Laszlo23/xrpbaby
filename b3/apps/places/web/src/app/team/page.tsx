import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team — Building Culture",
  description: "Core contributors behind Building Culture.",
};

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-brand/30 bg-brand/10 text-xl font-semibold text-brand">
      {initials}
    </div>
  );
}

const people = [
  {
    name: "Laszlo Bihary",
    role: "Co-founder & product",
    bio: "Driving protocol integration and investor-facing product on Base.",
    initials: "LB",
  },
  {
    name: "Reinhard Stix",
    role: "Co-founder & real estate",
    bio: "Property sourcing, structuring, and alignment with tokenization narrative.",
    initials: "RS",
  },
  {
    name: "Roman Horvath",
    role: "Accountant",
    bio: "Financial reporting and compliance-oriented bookkeeping for the venture.",
    initials: "RH",
  },
];

export default function TeamPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-16">
      <header className="text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-muted">People</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Team</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-zinc-400">
          Core contributors. Add photos and LinkedIn links when ready.
        </p>
      </header>

      <ul className="grid gap-6 sm:grid-cols-1">
        {people.map((p) => (
          <li key={p.name} className="glass-card flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
            <Avatar initials={p.initials} />
            <div>
              <h2 className="text-lg font-semibold text-white">{p.name}</h2>
              <p className="mt-1 text-sm font-medium text-brand">{p.role}</p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{p.bio}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
