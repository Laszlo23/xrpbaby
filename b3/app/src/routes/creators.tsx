import { createFileRoute, Link } from "@tanstack/react-router";
import { Mic, Music, Palette, PenLine, Sparkles } from "lucide-react";

import { MarketingShell } from "@/components/MarketingShell";
import {
  cultureAtlasCreatorsUrl,
  cultureAtlasUrl,
  type AtlasCreatorDiscipline,
} from "@/lib/culture-atlas-url";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/creators")({
  component: CreatorsHubPage,
  head: () =>
    pageHead({
      title: "Creators — Building Culture",
      description:
        "Artists, musicians, storytellers, and curators — apply to contribute living cultural editions to Culture Atlas.",
      path: "/creators",
      keywords: [
        "Building Culture",
        "creators",
        "artists",
        "musicians",
        "Culture Atlas",
        "storytellers",
      ],
    }),
});

const DISCIPLINES: {
  id: AtlasCreatorDiscipline;
  title: string;
  description: string;
  icon: typeof Palette;
}[] = [
  {
    id: "visual-art",
    title: "Visual artist",
    description: "Paintings, illustration, photography, and exhibition-grade cultural work.",
    icon: Palette,
  },
  {
    id: "music",
    title: "Musician",
    description: "Soundtracks, traditional music, and audio that carries a culture forward.",
    icon: Music,
  },
  {
    id: "voice",
    title: "Voice & narration",
    description: "Spoken word, narration, and oral history for living editions.",
    icon: Mic,
  },
  {
    id: "storytelling",
    title: "Storyteller",
    description: "Personal memories, family traditions, and lived experience — Culture Voices.",
    icon: PenLine,
  },
  {
    id: "curation",
    title: "Curator",
    description: "Regional stewards who help communities archive their own heritage.",
    icon: Sparkles,
  },
];

function CreatorsHubPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-4xl px-5 py-16 sm:py-24">
        <p className="mono-label">OPEN CALL</p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Artists, musicians, storytellers —{" "}
          <span className="bc-text-cyan-gradient">archive living culture</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base text-zinc-400 sm:text-lg">
          Culture Atlas is a community-owned library of human stories. We need elders, musicians,
          cooks, painters, and storytellers from every continent — not to collect pixels, but to
          help transport living heritage into editions future generations can explore.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {DISCIPLINES.map((d) => {
            const Icon = d.icon;
            return (
              <a
                key={d.id}
                href={cultureAtlasCreatorsUrl({ discipline: d.id, ref: "app" })}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-[#00E5FF]/40"
              >
                <Icon className="h-6 w-6 text-[#00E5FF]" />
                <h2 className="mt-4 font-display text-xl font-semibold text-white">{d.title}</h2>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{d.description}</p>
                <span className="mt-4 inline-block text-xs uppercase tracking-[0.2em] text-[#00E5FF] group-hover:text-white">
                  Apply →
                </span>
              </a>
            );
          })}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <a
            href={cultureAtlasCreatorsUrl({ ref: "app" })}
            className="inline-flex items-center rounded-full bg-[#C5FF41] px-6 py-3 text-sm font-semibold text-black hover:bg-white"
          >
            Open application form
          </a>
          <a
            href={cultureAtlasUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:border-[#00E5FF]/50"
          >
            Explore Culture Atlas
          </a>
          <Link
            to="/join"
            className="inline-flex items-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:border-[#00E5FF]/50"
          >
            Create your pass
          </Link>
          <Link
            to="/drops/art"
            className="inline-flex items-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:border-[#00E5FF]/50"
          >
            Physical art drops
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
