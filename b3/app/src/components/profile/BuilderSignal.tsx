import { GlassCard, SectionHeading } from "@/components/profile/profile-ui";
import type { BuilderSignalItem } from "@/lib/profile/founder-showcase";

export function BuilderSignal({ items }: { items: BuilderSignalItem[] }) {
  return (
    <section className="space-y-5">
      <SectionHeading
        title="Builder Signal"
        subtitle="Credibility markers — decades on the web, onchain, and in community."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <GlassCard key={item.id} hover className="text-sm font-medium text-zinc-200">
            {item.label}
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
