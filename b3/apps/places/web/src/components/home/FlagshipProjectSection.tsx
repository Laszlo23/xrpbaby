import Image from "next/image";
import Link from "next/link";
import { flagshipCampaign, FLAGSHIP_PROPERTY_ID, getFlagshipHeroImage } from "@/lib/flagship-campaign";

const idStr = FLAGSHIP_PROPERTY_ID.toString();

export function FlagshipProjectSection() {
  const hero = getFlagshipHeroImage();
  const progress = Math.min(1, flagshipCampaign.raisedEur / flagshipCampaign.targetRaiseEur);
  const targetFmt = new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
    flagshipCampaign.targetRaiseEur,
  );
  const raisedFmt = new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
    flagshipCampaign.raisedEur,
  );

  return (
    <section className="relative z-10 mx-auto max-w-[1280px] px-0" aria-labelledby="flagship-heading">
      <div className="overflow-hidden rounded-2xl border border-eco/20 bg-forest/25 shadow-xl shadow-black/30">
        <div className="border-b border-eco/15 px-5 py-3 sm:px-8 sm:py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-eco-muted">Now funding</p>
          <h2 id="flagship-heading" className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
            {flagshipCampaign.displayName}
          </h2>
          <p className="mt-1 text-sm text-eco-light">{flagshipCampaign.projectType}</p>
          <p className="mt-2 text-[10px] text-muted">Reference campaign figures — not on-chain TVL.</p>
          <p className="mt-3">
            <Link
              href="/experience"
              className="text-[11px] font-medium text-eco-light underline decoration-eco/40 underline-offset-4 transition hover:text-white hover:decoration-eco/70"
            >
              View the immersive story
            </Link>
          </p>
        </div>
        <div className="grid gap-0 lg:grid-cols-2">
          <div className="relative aspect-[16/10] min-h-[240px] w-full bg-zinc-900 lg:min-h-[340px]">
            <Image
              src={hero.src}
              alt={hero.alt}
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          </div>
          <div className="flex flex-col justify-center gap-4 p-6 sm:p-8">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-wide text-muted">Target raise</dt>
                <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-canvas">{targetFmt}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-wide text-muted">Raised</dt>
                <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-eco-light">{raisedFmt}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-wide text-muted">Investors</dt>
                <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-canvas">
                  {flagshipCampaign.investors.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-wide text-muted">Minimum (ref.)</dt>
                <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-canvas">
                  ${flagshipCampaign.minInvestmentUsd.toLocaleString()}
                </dd>
              </div>
            </dl>
            <div>
              <div className="flex justify-between text-[10px] text-muted">
                <span>Progress</span>
                <span className="font-mono tabular-nums">{Math.round(progress * 100)}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-black/40">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-eco to-action"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/properties/${idStr}`}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-eco/40 bg-eco/15 px-4 py-2.5 text-center text-sm font-semibold text-canvas transition hover:border-eco/60 hover:bg-eco/25"
              >
                View project
              </Link>
              <Link
                href={`/trade?property=${idStr}`}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-action px-4 py-2.5 text-center text-sm font-semibold text-[#0A0A0A] shadow-lg shadow-action/20 transition hover:bg-action-light"
              >
                Invest now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
