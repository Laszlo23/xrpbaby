import { Link } from "@tanstack/react-router";
import { motion } from "@/components/landing/motion";
import { ArrowUpRight, Building2, Briefcase } from "lucide-react";

import { usePublicProof } from "@/hooks/usePublicProof";
import { trackLandingEvent } from "@/lib/landing-api";
import { PLACES_LANE } from "@/lib/landing-copy";
import { LANDING_MEDIA, INVESTOR_DECK_PDF } from "@/lib/landing-media";
import { fmtProofInt } from "@/lib/public-proof-format";
import { TokenizedReportShowcase } from "@/components/landing/LandingInvestors";

const PLACES_PILLARS = [
  { label: "Real Estate", desc: "Tangible assets with verified ownership" },
  { label: "Community Ownership", desc: "People as participants, not customers" },
  { label: "Onchain Transparency", desc: "Every transaction, fully visible" },
] as const;

export function LandingPlaces() {
  const { data: proof, isLoading } = usePublicProof();

  return (
    <section id="places" className="relative w-full overflow-hidden bg-[#070707] py-28 sm:py-36">
      <div className="absolute inset-0 bc-noise pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative lg:col-span-5"
          >
            <div className="relative overflow-hidden rounded-3xl border border-white/10">
              <img
                src={LANDING_MEDIA.impact}
                alt="Restored community space"
                className="aspect-[4/5] w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute right-6 bottom-6 left-6">
                <p className="mono-label mb-2 !text-[#C47C59]">{PLACES_LANE.eyebrow}</p>
                <p className="font-display text-2xl font-bold text-white sm:text-3xl">
                  {PLACES_LANE.headline}{" "}
                  <span className="bc-text-gradient">{PLACES_LANE.headlineAccent}</span>
                </p>
              </div>
            </div>
          </motion.div>

          <div className="lg:col-span-7">
            <p className="mono-label">PLACES · RWA</p>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-4 font-display text-[40px] leading-[1] font-bold tracking-tight text-white sm:text-6xl"
            >
              {PLACES_LANE.investorHeadline} <br />
              <span className="bc-text-cyan-gradient">{PLACES_LANE.investorAccent}</span>
            </motion.h2>
            <p className="mt-6 max-w-xl text-base text-zinc-400 sm:text-lg">
              {PLACES_LANE.subhead}
            </p>
            <p className="mt-4 max-w-xl text-sm text-zinc-500">{PLACES_LANE.investorSubhead}</p>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {PLACES_PILLARS.map((p, i) => (
                <motion.div
                  key={p.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-2xl bc-glass p-4"
                >
                  <Building2 size={16} className="text-[#C47C59]" aria-hidden />
                  <p className="mt-2 text-sm font-semibold text-white">{p.label}</p>
                  <p className="mt-1 text-xs text-zinc-500">{p.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="rounded-2xl bc-glass px-5 py-3">
                <p className="mono-label !text-[10px]">MEMBERS</p>
                <p className="font-display text-2xl font-bold text-white tabular-nums">
                  {isLoading ? "…" : fmtProofInt(proof?.community.members)}
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                to={PLACES_LANE.ctas.places.href}
                onClick={() => void trackLandingEvent("places_cta", "places", { cta: "explore" })}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C5FF41] px-7 py-4 text-[14px] font-semibold text-black transition-colors hover:bg-white"
              >
                {PLACES_LANE.ctas.places.label}
                <ArrowUpRight size={16} />
              </Link>
              <Link
                to={PLACES_LANE.ctas.investors.href}
                onClick={() => void trackLandingEvent("places_cta", "places", { cta: "investors" })}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-4 text-[14px] font-semibold text-white hover:border-[#00E5FF]/60"
              >
                <Briefcase size={16} />
                {PLACES_LANE.ctas.investors.label}
              </Link>
              <a
                href={INVESTOR_DECK_PDF}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => void trackLandingEvent("investor_deck_open", "places")}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-4 text-[14px] font-semibold text-zinc-300 hover:text-white"
              >
                PDF deck
                <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </div>

        <TokenizedReportShowcase />
      </div>
    </section>
  );
}
