import type { PropertyRecord } from "@/lib/properties";
import { getPublicDocumentById, getPublicDocumentPreviewPaths } from "@/lib/public-documents";
import { formatAnnualRentEur, formatPropertyValueEur } from "@/lib/property-format";
import { ExternalLink } from "lucide-react";

type PropertyDeepDiveProps = {
  property: PropertyRecord;
};

export function PropertyDeepDive({ property }: PropertyDeepDiveProps) {
  return (
    <section id="docs" className="relative scroll-mt-24 border-t border-border/50 py-12 md:py-16">
      <div className="container px-4">
        <div className="mb-10 max-w-3xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-3">/ fact sheet</p>
          <h2 className="font-bold uppercase tracking-tight mb-4" style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)" }}>
            Numbers · disclosure
          </h2>
          <ul className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
            <li>
              <span className="font-mono text-[10px] uppercase tracking-widest text-primary">Asset (ref.)</span>
              <p className="mt-1 text-foreground">{formatPropertyValueEur(property)}</p>
            </li>
            <li>
              <span className="font-mono text-[10px] uppercase tracking-widest text-primary">Gross rent (ref.)</span>
              <p className="mt-1 text-foreground">{formatAnnualRentEur(property.annualRentalIncomeEur)} p.a.</p>
            </li>
            <li>
              <span className="font-mono text-[10px] uppercase tracking-widest text-primary">Area</span>
              <p className="mt-1 text-foreground">{property.squareMeters.toLocaleString("en-US")} m²</p>
            </li>
            <li>
              <span className="font-mono text-[10px] uppercase tracking-widest text-primary">Units</span>
              <p className="mt-1 text-foreground">{property.unitCountLabel ?? `${property.units} units`}</p>
            </li>
            {property.illustrativeShareUsd != null ? (
              <li>
                <span className="font-mono text-[10px] uppercase tracking-widest text-primary">Share ref.</span>
                <p className="mt-1 text-foreground">~€{property.illustrativeShareUsd.toLocaleString("en-US")} / share (UI label)</p>
              </li>
            ) : null}
            <li>
              <span className="font-mono text-[10px] uppercase tracking-widest text-primary">Type</span>
              <p className="mt-1 text-foreground">{property.propertyType}</p>
            </li>
          </ul>
          {property.creditLines?.length ? (
            <p className="mt-6 text-xs text-muted-foreground leading-relaxed">{property.creditLines.join(" · ")}</p>
          ) : null}
          {property.riskNote ? <p className="mt-4 text-xs text-destructive/90">{property.riskNote}</p> : null}
        </div>

        {property.greenPrint?.length ? (
          <div className="mb-12 max-w-3xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-3">/ green print</p>
            <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
              {property.greenPrint.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {property.documentIds.length > 0 ? (
          <div className="mb-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-4">/ documents</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {property.documentIds.map((id) => {
                const doc = getPublicDocumentById(id);
                if (!doc) return null;
                const previews = getPublicDocumentPreviewPaths(doc);
                const thumb = previews[0];
                return (
                  <a
                    key={id}
                    href={doc.pdfHref}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex flex-col overflow-hidden rounded-xl border border-border/50 bg-background/40 ring-1 ring-border/30 transition hover:ring-primary/30"
                  >
                    <div className="relative aspect-[4/3] bg-muted/30">
                      {thumb ? (
                        <img src={thumb} alt="" className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100" loading="lazy" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          PDF
                        </div>
                      )}
                      <div className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 text-primary">
                        <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-foreground leading-snug">{doc.title}</p>
                      <p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-primary">Open PDF</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        ) : null}

        {property.brokerOrDataRoomNotice ? (
          <div className="max-w-3xl rounded-xl border border-border/40 bg-muted/10 p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-2">/ broker notice</p>
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{property.brokerOrDataRoomNotice}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
