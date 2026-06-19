import { Link } from "@tanstack/react-router";
import { motion } from "@/components/landing/motion";
import { ArrowUpRight } from "lucide-react";

import { trackLandingEvent } from "@/lib/landing-api";
import { SUCCESS_STORIES } from "@/lib/landing-copy";

export function LandingSuccessStories() {
  return (
    <section
      id="community"
      className="relative w-full overflow-hidden bg-[#070707] py-28 sm:py-36 scroll-mt-32"
    >
      <div className="absolute inset-0 bc-noise pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-3xl">
          <p className="mono-label">SUCCESS STORIES</p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-4 font-display text-[40px] leading-[1] font-bold tracking-tight text-white sm:text-6xl"
          >
            People trust <span className="text-zinc-500">people.</span>
          </motion.h2>
          <p className="mt-6 text-base text-zinc-400 sm:text-lg">
            Builders, campaigns, agents, and communities — real stories with verifiable proof.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SUCCESS_STORIES.map((story, i) => {
            const inner = (
              <>
                <p className="mono-label !text-[11px]">{story.category}</p>
                <h3 className="mt-3 font-display text-xl font-bold text-white">{story.title}</h3>
                <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-zinc-400">
                  {story.excerpt}
                </p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#C5FF41]">
                  Read story
                  <ArrowUpRight size={14} />
                </span>
              </>
            );

            const className =
              "group flex flex-col rounded-3xl bc-glass p-6 transition-all hover:bc-glass-strong sm:p-7";

            if (story.external) {
              return (
                <motion.a
                  key={story.id}
                  href={story.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() =>
                    void trackLandingEvent("success_story_click", "stories", { id: story.id })
                  }
                  className={className}
                >
                  {inner}
                </motion.a>
              );
            }

            return (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  to={story.href}
                  onClick={() =>
                    void trackLandingEvent("success_story_click", "stories", { id: story.id })
                  }
                  className={className}
                >
                  {inner}
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/story"
            onClick={() => void trackLandingEvent("success_story_all", "stories")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-white"
          >
            Read the builder chronicle
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
