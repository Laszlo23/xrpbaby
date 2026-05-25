import Image from "next/image";
import Link from "next/link";
import { pipelineNavLabel, type BuildingCultureCityPipelineProject } from "@/lib/culture-land-portfolio";

const PLACEHOLDER_GRADIENT = [
  "linear-gradient(145deg, rgba(212,175,55,0.22) 0%, rgba(15,23,42,0.95) 42%, rgba(15,23,42,1) 100%)",
  "linear-gradient(145deg, rgba(52,211,153,0.18) 0%, rgba(15,23,42,0.92) 45%, rgba(15,23,42,1) 100%)",
  "linear-gradient(145deg, rgba(148,163,184,0.25) 0%, rgba(15,23,42,0.94) 44%, rgba(15,23,42,1) 100%)",
];

function PipelineVisual({
  project,
  index,
}: {
  project: BuildingCultureCityPipelineProject;
  index: number;
}) {
  if (project.imageSrc) {
    return (
      <div className="relative aspect-[5/4] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/80 sm:aspect-[16/10] lg:aspect-auto lg:min-h-[220px]">
        <Image
          src={project.imageSrc}
          alt={project.imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, min(380px, 33vw)"
        />
      </div>
    );
  }

  const seq = String(index + 1).padStart(2, "0");

  return (
    <div
      className="relative flex aspect-[5/4] items-center justify-center overflow-hidden rounded-2xl border border-white/[0.08] sm:aspect-[16/10] lg:aspect-auto lg:min-h-[220px]"
      style={{ background: PLACEHOLDER_GRADIENT[index % PLACEHOLDER_GRADIENT.length] }}
    >
      <span className="select-none text-[5.5rem] font-semibold tabular-nums tracking-tighter text-white/[0.06]" aria-hidden>
        BCC
      </span>
      <span className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <span className="rounded-full border border-white/15 bg-black/45 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.4em] text-white/90">
          Pipeline
        </span>
        <span className="font-mono text-4xl font-semibold tabular-nums tracking-tight text-white/95">{seq}</span>
      </span>
    </div>
  );
}

export function PipelineProjectsSection({
  projects,
}: {
  projects: BuildingCultureCityPipelineProject[];
}) {
  if (projects.length === 0) return null;

  return (
    <section className="mx-auto mb-24 max-w-6xl" aria-labelledby="bcc-pipeline-heading">
      <div className="relative overflow-hidden rounded-[2rem] border border-action/25 bg-gradient-to-br from-action/[0.07] via-transparent to-eco/[0.05] px-5 py-10 sm:px-8 sm:py-12">
        <div
          className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-action/10 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-action-light/95">
            Partner acquisition pipeline
          </p>
          <h2
            id="bcc-pipeline-heading"
            className="mt-4 text-balance text-3xl font-semibold tracking-tight text-white sm:text-[2rem]"
          >
            Projects in acquisition
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-[15px]">
            Vienna, Carinthia, and other tracks — structured for broker and investor diligence: exploitation angle,
            indicative lettable area, and negotiated economics. Treat every line item as conditional on legal review,
            zoning, tenancy schedule, and financing — not a solicitation.
          </p>
        </div>

        <nav aria-label="Acquisition projects" className="relative mx-auto mt-10 flex flex-wrap justify-center gap-2">
          {projects.map((p) => (
            <a
              key={p.id}
              href={`#${p.id}`}
              className="rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[11px] font-medium text-zinc-300 transition hover:border-eco/40 hover:text-white"
            >
              {pipelineNavLabel(p)}
            </a>
          ))}
        </nav>

        <div className="relative mx-auto mt-14 grid gap-10 lg:grid-cols-3 lg:gap-8">
          {projects.map((p, i) => (
            <article
              key={p.id}
              id={p.id}
              className="scroll-mt-28 flex flex-col rounded-2xl border border-white/[0.06] bg-zinc-950/40 shadow-xl shadow-black/25 backdrop-blur-sm"
            >
              <div className="p-5 pb-0 sm:p-6 sm:pb-2">
                <PipelineVisual project={p} index={i} />
              </div>

              <div className="flex flex-1 flex-col p-5 pt-6 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-amber-400/35 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-100/95">
                    In negotiation
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                    Acquisition track
                  </span>
                </div>
                <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.18em] text-gold-500/85">{p.region}</p>
                <h3 className="mt-2 text-xl font-semibold leading-snug tracking-tight text-white">{p.title}</h3>
                <p className="mt-2 text-sm font-medium text-eco-light/90">{p.tagline}</p>

                <div className="mt-4 space-y-2.5 border-t border-white/[0.06] pt-4 text-sm leading-relaxed text-zinc-400">
                  {p.narrative.map((para, j) => (
                    <p key={j}>{para}</p>
                  ))}
                </div>

                <div className="mt-auto pt-8">
                  <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Fact sheet</h4>
                  <dl className="mt-3 space-y-2">
                    {p.factSheet.map((row) => (
                      <div
                        key={`${p.id}-${row.label}`}
                        className="border-b border-white/[0.05] py-2 text-sm last:border-0"
                      >
                        <dt className="text-[13px] text-zinc-500">{row.label}</dt>
                        <dd className="mt-1 font-medium leading-snug text-zinc-100">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                  {p.documents && p.documents.length > 0 && (
                    <div className="mt-6 border-t border-white/[0.06] pt-5">
                      <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                        Plans & PDFs
                      </h4>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {p.documents.map((doc) => (
                          <a
                            key={doc.href}
                            href={doc.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/25 bg-gold-500/[0.07] px-3 py-1.5 text-[11px] font-medium text-gold-100/95 transition hover:border-gold-400/45 hover:bg-gold-500/10"
                          >
                            <span aria-hidden className="text-[10px]">
                              PDF
                            </span>
                            {doc.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="relative mx-auto mt-12 max-w-2xl text-center text-[11px] leading-relaxed text-zinc-500">
          Pricing and rents are placeholders for negotiation; verify against term sheets, rent roll, capex schedules, and
          tax counsel. Pipeline visibility does not imply listing on Base — see{" "}
          <Link href="/properties" className="font-medium text-gold-400/90 underline-offset-2 hover:underline">
            on-chain listings
          </Link>{" "}
          for instruments currently offered.
        </p>
      </div>
    </section>
  );
}
