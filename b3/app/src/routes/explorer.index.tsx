import { createFileRoute } from "@tanstack/react-router";
import { Activity, Eye, ShieldCheck, Sparkles } from "lucide-react";

import { pageHead } from "@/lib/seo";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { ActivityFeed } from "@/modules/explorer/ActivityFeed";
import { ExplorerSearch } from "@/modules/explorer/ExplorerSearch";

export const Route = createFileRoute("/explorer/")({
  head: () =>
    pageHead({
      title: `Explorer for humans — ${BRAND_DISPLAY_NAME}`,
      description:
        "A block explorer anyone can understand. Paste a transaction or wallet and get it explained in plain language — verified facts first, AI storytelling second.",
      path: "/explorer",
      keywords: ["block explorer", "Base", "AI explainer", "BCC", "blockchain for humans"],
    }),
  component: ExplorerLandingPage,
});

const PILLARS = [
  {
    icon: Eye,
    title: "Readable, not hex soup",
    body: "Names and labels instead of raw addresses. Sentences instead of logs.",
  },
  {
    icon: Sparkles,
    title: "Explained by AI",
    body: "Every transaction can be retold in plain language — built only on verified chain facts.",
  },
  {
    icon: ShieldCheck,
    title: "Trust, but verify",
    body: "Nerd mode shows the raw data and links to independent explorers, always.",
  },
];

function ExplorerLandingPage() {
  return (
    <div className="space-y-12">
      <section className="space-y-6 pt-4 text-center md:pt-8">
        <h1 className="mx-auto max-w-2xl font-heading text-3xl font-bold tracking-tight text-white md:text-4xl">
          The blockchain, explained like you're human
        </h1>
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-zinc-400 md:text-base">
          You shouldn't need to be a nerd to understand what happens on-chain. Paste any Base
          transaction or wallet below — we'll show you what actually happened, in words that make
          sense.
        </p>
        <div className="mx-auto max-w-2xl">
          <ExplorerSearch autoFocus />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {PILLARS.map((p) => (
          <div
            key={p.title}
            className="rounded-2xl border border-white/[0.06] bg-black/30 p-5 text-left"
          >
            <p.icon className="h-5 w-5 text-[var(--base-blue)]" aria-hidden />
            <h2 className="mt-3 font-heading text-sm font-semibold text-white">{p.title}</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{p.body}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-[var(--base-blue)]" aria-hidden />
          <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
            Live ecosystem activity
          </h2>
          <span className="ml-1 inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        </div>
        <ActivityFeed />
      </section>
    </div>
  );
}
