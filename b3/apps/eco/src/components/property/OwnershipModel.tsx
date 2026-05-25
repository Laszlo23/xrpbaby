import type { PropertyRecord, ProposalStatus } from "@/lib/properties";

type OwnershipModelProps = {
  property: PropertyRecord;
};

const STATUS_LABEL: Record<ProposalStatus, string> = {
  open: "Open",
  passed: "Passed",
  rejected: "Rejected",
};

export function OwnershipModel({ property }: OwnershipModelProps) {
  const bullets = property.ownership.bullets;

  return (
    <section id="own" className="relative scroll-mt-24 border-t border-border/50 py-12 md:py-16">
      <div className="container px-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-3">/ ownership</p>
        <h2 className="font-bold uppercase tracking-tight mb-10 max-w-3xl" style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)" }}>
          What you own · sample votes
        </h2>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-primary mb-4">What you own</h3>
            <ul className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              {bullets.map((b) => (
                <li key={b} className="flex gap-3 border-l-2 border-primary/30 pl-4">
                  <span className="text-foreground">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-primary mb-4">Sample proposals</h3>
            <ul className="space-y-3">
              {property.sampleProposals.map((p) => (
                <li
                  key={p.id}
                  className="rounded-xl border border-border/50 bg-muted/10 p-4 font-mono text-[11px] uppercase tracking-wide ring-1 ring-border/30"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-foreground normal-case tracking-normal text-xs font-semibold">{p.title}</span>
                    <span className="text-primary">Status: {STATUS_LABEL[p.status]}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-muted-foreground">
                    <span>YES {p.yesPct}%</span>
                    <span>quorum {p.quorumPct}%</span>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[10px] text-muted-foreground leading-relaxed">Illustrative — see Legal.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
