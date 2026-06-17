import { ExternalLink, ShieldCheck } from "lucide-react";

import { GlassCard, SectionHeading } from "@/components/profile/profile-ui";
import type { Web3BioCredentials } from "@/lib/identity/identity-graph-types";

function CredentialChip({
  label,
  description,
  link,
}: {
  label: string;
  description: string | null;
  link: string | null;
}) {
  const className =
    "inline-flex items-center gap-2 rounded-xl border border-[#C5FF41]/25 bg-[#C5FF41]/10 px-3 py-2 text-sm text-white";

  const inner = (
    <>
      <ShieldCheck className="h-4 w-4 shrink-0 text-[#C5FF41]" aria-hidden />
      <span>
        <span className="font-semibold">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs text-zinc-400">{description}</span>
        ) : null}
      </span>
      {link ? <ExternalLink className="h-3.5 w-3.5 shrink-0 text-zinc-500" aria-hidden /> : null}
    </>
  );

  if (link) {
    return (
      <a href={link} target="_blank" rel="noreferrer noopener" className={className}>
        {inner}
      </a>
    );
  }

  return <div className={className}>{inner}</div>;
}

export function TrustCredentials({ credentials }: { credentials: Web3BioCredentials | null }) {
  if (!credentials) return null;

  const human = credentials.isHuman;
  const risky = [...credentials.isRisky, ...credentials.isSpam];
  if (human.length === 0 && risky.length === 0) return null;

  return (
    <section className="space-y-5">
      <SectionHeading
        title="Trust signals"
        subtitle="Verifiable credentials from the Web3.bio identity graph."
      />
      <GlassCard hover={false} className="space-y-3">
        {human.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {human.map((item) => (
              <CredentialChip
                key={`${item.platform}-${item.label}`}
                label={item.label}
                description={item.description}
                link={item.link}
              />
            ))}
          </div>
        ) : null}
        {risky.length > 0 ? (
          <div className="flex flex-wrap gap-2 border-t border-white/10 pt-3">
            {risky.map((item) => (
              <div
                key={`${item.platform}-${item.label}`}
                className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100"
              >
                {item.label}
              </div>
            ))}
          </div>
        ) : null}
      </GlassCard>
    </section>
  );
}
