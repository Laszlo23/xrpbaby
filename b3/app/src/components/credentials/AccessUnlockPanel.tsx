import { Link } from "@tanstack/react-router";
import { Lock, Unlock } from "lucide-react";

export type AccessUnlockItem = {
  slug: string;
  label: string;
  description: string;
  unlocked: boolean;
  missingCredentials?: string[];
  href?: string;
};

type AccessUnlockPanelProps = {
  title?: string;
  items: AccessUnlockItem[];
};

export function AccessUnlockPanel({ title = "Access unlocks", items }: AccessUnlockPanelProps) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
      <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-zinc-400">
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.slug}
            className="flex items-start gap-3 rounded-xl border border-white/[0.06] px-3 py-2.5"
          >
            {item.unlocked ? (
              <Unlock className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
            ) : (
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" aria-hidden />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-200">{item.label}</p>
              <p className="text-xs text-zinc-500">{item.description}</p>
              {!item.unlocked && item.missingCredentials?.length ? (
                <p className="mt-1 text-xs text-amber-200/80">
                  Requires: {item.missingCredentials.join(", ")}
                </p>
              ) : null}
            </div>
            {item.href ? (
              <Link
                to={item.href}
                className="text-xs font-semibold text-[#C5FF41] hover:text-white"
              >
                Go →
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function buildDefaultAccessUnlocks(earnedSlugs: Set<string>): AccessUnlockItem[] {
  return [
    {
      slug: "grant-agent",
      label: "Grant Agent",
      description: "Run grant-ready briefs and application drafts.",
      unlocked: earnedSlugs.has("contributor"),
      missingCredentials: earnedSlugs.has("contributor") ? undefined : ["contributor"],
      href: "/agent-os#grant-agent",
    },
    {
      slug: "studio-priority",
      label: "BC Studio priority",
      description: "Priority queue for builder credential holders.",
      unlocked: earnedSlugs.has("builder"),
      missingCredentials: earnedSlugs.has("builder") ? undefined : ["builder"],
      href: "/studio",
    },
    {
      slug: "places-investor",
      label: "Places investor flows",
      description: "High-trust access for verified humans.",
      unlocked: earnedSlugs.has("verified-human"),
      missingCredentials: earnedSlugs.has("verified-human") ? undefined : ["verified-human"],
      href: "/places",
    },
  ];
}
