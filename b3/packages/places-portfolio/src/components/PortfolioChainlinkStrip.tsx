import { basescanAddress } from "../chainlink-modules.js";
import type { PortfolioChainlinkStripProps } from "../types.js";
import { resolveLink } from "./link.js";

export function PortfolioChainlinkStrip({
  modules,
  complianceHeadline,
  complianceBody,
  disclaimers,
  transparencyHref,
  matrixHref,
  appPlacesHref,
  LinkComponent,
}: PortfolioChainlinkStripProps) {
  const Link = resolveLink(LinkComponent);

  return (
    <section className="border-t border-[hsl(0_0%_100%/0.1)] bg-[hsl(0_0%_5%)] px-8 py-20">
      <div className="mx-auto max-w-6xl">
        <span className="pp-mono mb-4 block text-[10px] uppercase tracking-[0.3em] text-[hsl(38_25%_48%)]">
          RWA compliance
        </span>
        <h2 className="pp-display text-3xl tracking-tight md:text-4xl">{complianceHeadline}</h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[hsl(30_10%_92%/0.5)]">
          {complianceBody}
        </p>

        <ul className="mt-6 space-y-2 text-xs text-[hsl(30_10%_92%/0.45)]">
          {disclaimers.map((d) => (
            <li key={d}>· {d}</li>
          ))}
        </ul>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {modules.map((m) => (
            <a
              key={m.id}
              href={basescanAddress(m.explorerBase, m.address)}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex flex-col rounded-lg border border-[hsl(0_0%_100%/0.1)] bg-[#0a0a0a] p-4 transition hover:border-[hsl(38_25%_48%/0.4)]"
            >
              <span className="text-sm font-medium text-[hsl(30_15%_92%)]">{m.label}</span>
              <span className="pp-mono mt-1 truncate text-[10px] text-[hsl(38_25%_48%)] group-hover:underline">
                {m.address}
              </span>
            </a>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-6 text-sm">
          {transparencyHref ? (
            <a
              href={transparencyHref}
              target="_blank"
              rel="noreferrer noopener"
              className="text-[hsl(38_25%_48%)] hover:underline"
            >
              Places transparency ↗
            </a>
          ) : null}
          {matrixHref ? (
            <a
              href={matrixHref}
              target="_blank"
              rel="noreferrer noopener"
              className="text-[hsl(30_10%_92%/0.5)] hover:text-[hsl(30_15%_92%)]"
            >
              Compliance matrix ↗
            </a>
          ) : null}
          {appPlacesHref ? (
            <Link
              href={appPlacesHref}
              className="text-[hsl(30_10%_92%/0.5)] hover:text-[hsl(30_15%_92%)]"
            >
              Unified Places hub
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
