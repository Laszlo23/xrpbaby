import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";
import { BUILDER_PULL_QUOTES, BUILDER_PROFILE, featuredEssays } from "@/content/builder-chronicle";
import { EssayCard } from "@/components/story/EssayCard";
import { trackLandingEvent } from "@/lib/landing-api";

export function LandingBuilderChronicle() {
  const quote = BUILDER_PULL_QUOTES[0];
  const essays = featuredEssays();

  return (
    <section id="story" className="relative w-full overflow-hidden bg-[#050505] py-28 sm:py-36">
      <div className="absolute inset-0 bc-noise pointer-events-none" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl"
        >
          <p className="mono-label flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#C47C59]" aria-hidden />
            BUILDER CHRONICLE
          </p>
          <blockquote className="mt-6 font-display text-2xl font-medium leading-snug tracking-tight text-white sm:text-3xl md:text-4xl">
            &ldquo;{quote}&rdquo;
          </blockquote>
          <p className="mt-4 text-sm text-zinc-500">
            {BUILDER_PROFILE.legalName} · essays on{" "}
            <a
              href={BUILDER_PROFILE.paragraphUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                void trackLandingEvent("builder_chronicle_click", "landing_teaser", {
                  target: "profile",
                })
              }
              className="text-zinc-400 underline underline-offset-2 hover:text-white"
            >
              Paragraph
            </a>
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {essays.map((essay, i) => (
            <motion.div
              key={essay.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.1 }}
            >
              <EssayCard essay={essay} compact analyticsSection="landing_teaser" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10"
        >
          <Link
            to="/story"
            onClick={() =>
              void trackLandingEvent("builder_chronicle_click", "landing_teaser", {
                target: "story_page",
              })
            }
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-medium text-white transition hover:border-neon/40 hover:bg-white/[0.08]"
          >
            Read the full chronicle
            <ArrowRight className="h-4 w-4 text-neon" aria-hidden />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
