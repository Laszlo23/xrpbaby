import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

import { pageHead } from "@/lib/seo";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import {
  getMarketplaceService,
  SERVICE_AGENT_LABELS,
  serviceMarginEstimateUsd,
  type ServiceBriefField,
} from "@/content/marketplace-services";
import { MarketplaceServicePay } from "@/components/marketplace/MarketplaceServicePay";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/marketplace/services/$slug")({
  head: ({ params }) => {
    const sku = getMarketplaceService(params.slug);
    return pageHead({
      title: sku ? `${sku.title} — Services` : `Service — ${BRAND_DISPLAY_NAME}`,
      description: sku?.oneLiner ?? "Marketplace service SKU",
      path: `/marketplace/services/${params.slug}`,
    });
  },
  component: MarketplaceServiceDetailPage,
});

function BriefFieldInput({
  field,
  value,
  onChange,
}: {
  field: ServiceBriefField;
  value: string;
  onChange: (v: string) => void;
}) {
  const common =
    "w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-[var(--base-blue)]/40 focus:outline-none";

  if (field.multiline) {
    return (
      <textarea
        id={field.id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        maxLength={field.maxLength}
        placeholder={field.placeholder}
        className={common}
        required={field.required}
      />
    );
  }

  return (
    <input
      id={field.id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      maxLength={field.maxLength}
      placeholder={field.placeholder}
      className={common}
      required={field.required}
    />
  );
}

function MarketplaceServiceDetailPage() {
  const { slug } = Route.useParams();
  const sku = getMarketplaceService(slug);
  if (!sku) throw notFound();

  const [brief, setBrief] = useState<Record<string, string>>(() =>
    Object.fromEntries(sku.briefFields.map((f) => [f.id, ""])),
  );

  const briefComplete = useMemo(
    () => sku.briefFields.every((f) => !f.required || brief[f.id]?.trim()),
    [sku.briefFields, brief],
  );

  const margin = serviceMarginEstimateUsd(sku);

  return (
    <div className="space-y-10 pb-12">
      <div>
        <Link
          to="/marketplace/services"
          className="text-xs text-zinc-500 underline-offset-2 hover:text-zinc-300"
        >
          ← All services
        </Link>
        <h2 className="mt-4 font-heading text-2xl font-semibold text-white md:text-3xl">
          {sku.title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">{sku.promise}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge className="bg-emerald-950/50 text-emerald-200">{sku.kickoffPrice} kickoff</Badge>
          {sku.retainerPrice ? (
            <Badge variant="outline" className="border-white/15 text-zinc-400">
              {sku.retainerPrice}
            </Badge>
          ) : null}
          {sku.microPrice ? (
            <Badge variant="outline" className="border-white/15 text-zinc-400">
              {sku.microPrice}
            </Badge>
          ) : null}
          <Badge variant="outline" className="border-white/15 text-zinc-500">
            ~{sku.estimatedDays} days
          </Badge>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-6">
          <div>
            <h3 className="font-heading text-lg font-semibold text-white">Deliverables</h3>
            <ul className="mt-3 space-y-2">
              {sku.deliverables.map((d) => (
                <li key={d} className="flex gap-2 text-sm text-zinc-300">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500/80"
                    aria-hidden
                  />
                  {d}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-lg font-semibold text-white">Milestones</h3>
            <ol className="mt-3 space-y-3">
              {sku.milestones.map((m) => (
                <li
                  key={m.index}
                  className="rounded-xl border border-white/[0.06] bg-black/40 px-4 py-3 text-sm"
                >
                  <p className="font-medium text-zinc-200">
                    {m.index + 1}. {m.title}{" "}
                    <span className="font-mono text-xs text-zinc-500">({m.percentOfTotal}%)</span>
                  </p>
                  <p className="mt-1 text-zinc-500">{m.description}</p>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="font-heading text-lg font-semibold text-white">Agent squad</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {sku.agentSquad.map((role) => (
                <li
                  key={role}
                  className="rounded-full border border-white/10 bg-black/50 px-3 py-1 text-xs text-zinc-400"
                >
                  {SERVICE_AGENT_LABELS[role]}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl border border-white/[0.08] bg-black/50 p-6">
            <h3 className="font-heading text-lg font-semibold text-white">Intake brief</h3>
            <p className="mt-1 text-xs text-zinc-500">Required before kickoff payment.</p>
            <form className="mt-4 space-y-4" onSubmit={(e) => e.preventDefault()}>
              {sku.briefFields.map((field) => (
                <div key={field.id}>
                  <label htmlFor={field.id} className="mb-1.5 block text-sm text-zinc-300">
                    {field.label}
                    {field.required ? <span className="text-amber-400/80"> *</span> : null}
                  </label>
                  <BriefFieldInput
                    field={field}
                    value={brief[field.id] ?? ""}
                    onChange={(v) => setBrief((prev) => ({ ...prev, [field.id]: v }))}
                  />
                </div>
              ))}
            </form>
            <div className="mt-6 border-t border-white/[0.06] pt-6">
              <MarketplaceServicePay sku={sku} brief={brief} disabled={!briefComplete} />
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-black/30 p-6 text-sm">
            <h3 className="font-heading text-lg font-semibold text-white">Pricing transparency</h3>
            <p className="mt-2 text-zinc-400">
              Price = (API + infra) + (human review hours × rate) + 25% reinvest fund.
            </p>
            <dl className="mt-4 space-y-2 font-mono text-xs text-zinc-500">
              <div className="flex justify-between">
                <dt>API + infra</dt>
                <dd>${sku.margin.apiInfraUsd}</dd>
              </div>
              <div className="flex justify-between">
                <dt>
                  Human review ({sku.margin.humanReviewHours}h × ${sku.margin.humanReviewRateUsd})
                </dt>
                <dd>${margin.labor}</dd>
              </div>
              <div className="flex justify-between">
                <dt>25% reinvest pool</dt>
                <dd>${Math.round(margin.reinvest)}</dd>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 text-zinc-300">
                <dt>Sustainable margin</dt>
                <dd>~${Math.round(margin.margin)}</dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </div>
  );
}
