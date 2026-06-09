import { ExternalLink } from "lucide-react";
import type { ParagraphEssay } from "@/content/builder-chronicle";
import { trackLandingEvent } from "@/lib/landing-api";

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function EssayCard({
  essay,
  compact = false,
  analyticsSection = "story",
}: {
  essay: ParagraphEssay;
  compact?: boolean;
  analyticsSection?: string;
}) {
  function onParagraphClick() {
    void trackLandingEvent("builder_chronicle_click", analyticsSection, {
      essayId: essay.id,
      url: essay.paragraphUrl,
    });
  }

  return (
    <article
      className={`group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition hover:border-white/20 ${
        compact ? "" : "md:flex md:min-h-[200px]"
      }`}
    >
      {essay.coverImageUrl ? (
        <div
          className={
            compact
              ? "aspect-[16/9] w-full bg-cover bg-center"
              : "aspect-[16/9] w-full shrink-0 bg-cover bg-center md:aspect-auto md:w-48 lg:w-56"
          }
          style={{ backgroundImage: `url(${essay.coverImageUrl})` }}
          role="img"
          aria-label=""
        />
      ) : (
        <div
          className={
            compact
              ? "aspect-[16/9] w-full bg-gradient-to-br from-[#00E5FF]/20 to-purple-900/40"
              : "aspect-[16/9] w-full shrink-0 md:aspect-auto md:w-48 lg:w-56 bg-gradient-to-br from-[#00E5FF]/20 to-purple-900/40"
          }
        />
      )}
      <div className={`flex flex-1 flex-col p-5 ${compact ? "pt-4" : "md:p-6"}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#C47C59]">
            {essay.theme}
          </span>
          <span className="text-xs text-zinc-600">{formatDate(essay.publishedAt)}</span>
        </div>
        <h3 className="mt-2 font-heading text-lg font-semibold text-white group-hover:text-neon/90">
          {essay.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">{essay.excerpt}</p>
        <a
          href={essay.paragraphUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onParagraphClick}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-neon transition hover:text-white"
        >
          Read on Paragraph
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>
    </article>
  );
}
