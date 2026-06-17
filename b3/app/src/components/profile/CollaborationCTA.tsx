import { Mail } from "lucide-react";

import { GlassCard, SectionHeading } from "@/components/profile/profile-ui";
import type { FounderShowcaseConfig } from "@/lib/profile/founder-showcase";
import { Button } from "@/components/ui/button";

export function CollaborationCTA({ config }: { config: FounderShowcaseConfig }) {
  const { collaboration } = config;

  return (
    <section className="space-y-5">
      <GlassCard
        hover={false}
        className="relative overflow-hidden border-[#C5FF41]/20 bg-gradient-to-br from-[#C5FF41]/[0.07] via-black/50 to-[rgb(0_35_100/0.25)] p-6 md:p-8"
      >
        <div
          className="pointer-events-none absolute -right-8 top-0 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgb(197_255_65/0.15),transparent_70%)]"
          aria-hidden
        />
        <div className="relative space-y-5">
          <SectionHeading title={collaboration.title} subtitle={collaboration.body} />
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              Looking for
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {collaboration.lookingFor.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-zinc-300">
                  <span className="h-1 w-1 rounded-full bg-[#C5FF41]" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <Button asChild className="rounded-full">
            <a href={collaboration.ctaHref}>
              <Mail className="mr-2 h-4 w-4" aria-hidden />
              {collaboration.ctaLabel}
            </a>
          </Button>
        </div>
      </GlassCard>
    </section>
  );
}
