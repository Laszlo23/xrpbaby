import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { CHRONICLES, CHRONICLE_EDITION_COUNT } from "@/content/culture-chronicles";
import { CHRONICLE_SET_PERKS } from "@/lib/culture-chronicles-perks";
import {
  ChronicleLevelMap,
  ChronicleProgressRing,
} from "@/components/chronicles/ChronicleLevelMap";
import { ChroniclesIdentityBar } from "@/components/chronicles/ChroniclesIdentityBar";
import { useChronicleProgress } from "@/hooks/useChronicleProgress";
import { ArrowRight, BookOpen, Headphones } from "lucide-react";

export const Route = createFileRoute("/chronicles/")({
  head: () =>
    pageHead({
      title: "Culture Chronicles — Meme Edition",
      description:
        "11-chapter pixel story on Base. Read free, mint to own scarce chapters (~$0.77–$7.77 ETH), unlock Forest perks and chase Chronicle Founder.",
      path: "/chronicles",
      image: "/chronicles/pop-culture.webp",
      keywords: [BRAND_DISPLAY_NAME, "NFT", "Culture Chronicles", "story", "Base"],
    }),
  component: ChroniclesIndexPage,
});

function ChroniclesIndexPage() {
  const progress = useChronicleProgress();

  return (
    <div className="min-h-screen bg-black pb-nav-safe text-white">
      <ChroniclesIdentityBar />
      <section className="relative overflow-hidden border-b border-white/[0.06] px-4 pb-12 pt-10 md:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(197,255,65,0.08),transparent_55%)]" />
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--vault-gold)]">
          Meme Edition
        </p>
        <h1 className="mt-3 max-w-2xl font-heading text-4xl font-semibold tracking-tight md:text-5xl">
          Culture Chronicles
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-400">
          A scroll-driven memoir in 11 scarce chapters. Read every scene for free. Mint on Base to
          own the art, stack Culture Points, and become a Chronicle Founder at 11/11.
        </p>
        <div className="mt-8 max-w-lg">
          <ChronicleProgressRing owned={progress.ownedCount} total={CHRONICLE_EDITION_COUNT} />
        </div>
      </section>

      <section className="px-4 py-10 md:px-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-semibold">Chapter map</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Locked mints unlock after the prior chapter — or grab a Skip Key on chapter 1.
            </p>
          </div>
          <Link
            to="/chronicles/$chapterId"
            params={{ chapterId: "ch-01" }}
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-[var(--vault-gold)] hover:text-white"
          >
            Start reading
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <ChronicleLevelMap chapters={CHRONICLES} progress={progress} />
      </section>

      <section className="border-t border-white/[0.06] px-4 py-10 md:px-10">
        <h2 className="font-heading text-xl font-semibold">Holder perks</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {Object.entries(CHRONICLE_SET_PERKS).map(([key, line]) => (
            <li
              key={key}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-zinc-400"
            >
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-white/[0.06] px-4 py-10 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#C5FF41]">
              Real life
            </p>
            <h2 className="mt-2 font-heading text-xl font-semibold">Builder Tapes</h2>
            <p className="mt-2 max-w-lg text-sm text-zinc-500">
              Founder audio — the unfiltered stories behind the myth. Listen free, earn Culture
              Points at 80%.
            </p>
          </div>
          <Link
            to="/stories/tapes"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-[#C5FF41] hover:text-white"
          >
            <Headphones className="h-4 w-4" aria-hidden />
            Hear Laszlo
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      <section className="px-4 pb-16 md:px-10">
        <Link
          to="/chronicles/$chapterId"
          params={{ chapterId: CHRONICLES[0]!.id }}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--b3-purple)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--base-blue-hover)]"
        >
          <BookOpen className="h-4 w-4" aria-hidden />
          Chapter 1 — The Feed Explained
        </Link>
        <Link to="/forest" className="ml-4 text-sm text-zinc-500 underline hover:text-white">
          Forest dashboard
        </Link>
      </section>
    </div>
  );
}
