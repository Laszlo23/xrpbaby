import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import {
  BUILDER_PROFILE,
  CHRONICLE_MILESTONES,
  PARAGRAPH_ESSAYS,
  shortWallet,
} from "@/content/builder-chronicle";
import { EssayCard } from "@/components/story/EssayCard";
import { Button } from "@/components/ui/button";
import { trackLandingEvent } from "@/lib/landing-api";

export function BuilderChronicle() {
  return (
    <div className="space-y-16 md:space-y-20">
      <section className="rounded-2xl border border-white/10 bg-black/30 p-6 md:p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          On-chain identity
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-400">
          {BUILDER_PROFILE.complianceRegistryNote}
        </p>
        <a
          href={BUILDER_PROFILE.paragraphUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            void trackLandingEvent("builder_chronicle_click", "story", {
              target: "profile",
            })
          }
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 font-mono text-xs text-zinc-300 transition hover:border-neon/40 hover:text-white"
        >
          {shortWallet(BUILDER_PROFILE.wallet)}
          <ExternalLink className="h-3.5 w-3.5 text-neon" aria-hidden />
        </a>
      </section>

      <section>
        <h2 className="font-heading text-2xl font-semibold text-white md:text-3xl">Timeline</h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">
          Decades of building — from IT in 1996 to a culture economy on Base.
        </p>
        <ol className="relative mt-10 space-y-0 border-l border-white/10 pl-8 md:pl-10">
          {CHRONICLE_MILESTONES.map((m, i) => (
            <motion.li
              key={m.year}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative pb-10 last:pb-0"
            >
              <span
                className="absolute -left-[calc(2rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full bg-neon md:-left-[calc(2.5rem+5px)]"
                aria-hidden
              />
              <p className="font-mono text-sm text-neon/90">{m.year}</p>
              <p className="mt-1 font-heading text-lg font-semibold text-white">{m.title}</p>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">{m.body}</p>
            </motion.li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="font-heading text-2xl font-semibold text-white md:text-3xl">
          Essays on Paragraph
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">
          Short excerpts here; full writing lives on{" "}
          <a
            href={BUILDER_PROFILE.paragraphUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-300 underline underline-offset-2 hover:text-white"
          >
            Paragraph
          </a>
          .
        </p>
        <div className="mt-8 grid gap-6">
          {PARAGRAPH_ESSAYS.map((essay) => (
            <EssayCard key={essay.id} essay={essay} analyticsSection="story" />
          ))}
        </div>
      </section>

      <section className="flex flex-wrap gap-3 border-t border-white/10 pt-10">
        <Button className="rounded-full" asChild>
          <Link to="/join">Create your pass</Link>
        </Button>
        <Button variant="secondary" className="rounded-full" asChild>
          <Link to="/mission">Mission & BCC</Link>
        </Button>
        <Button variant="outline" className="rounded-full" asChild>
          <Link to="/liquidity">Learn liquidity</Link>
        </Button>
      </section>
    </div>
  );
}
