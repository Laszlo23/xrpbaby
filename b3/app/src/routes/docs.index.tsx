import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { MarketingShell } from "@/components/MarketingShell";
import { postDocsSummaries } from "@/lib/docs-fns";
import { BookMarked } from "lucide-react";
import type { DocsArticleSummary } from "@/server/strapi/docs-articles";

export const Route = createFileRoute("/docs/")({
  head: () =>
    pageHead({
      title: "Documentation",
      description: "BUILDCHAIN technical and product documentation from the CMS.",
      path: "/docs",
      keywords: ["BUILDCHAIN", "docs", "documentation"],
    }),
  loader: async () => {
    const items = await postDocsSummaries({ data: {} });
    return { items };
  },
  component: DocsIndexPage,
});

function DocsIndexPage() {
  const { items } = Route.useLoaderData();

  return (
    <MarketingShell
      eyebrow="Knowledge base"
      tone="slate"
      heroSize="compact"
      articleClassName="max-w-3xl"
      title={
        <>
          Docs <span className="text-zinc-100">from Strapi</span>
        </>
      }
      subtitle="Articles in the `docs` category — fetched server-side with an API token (not public anonymous CMS reads)."
    >
      <div className="mb-10 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] p-4 text-sm text-zinc-300">
        <p className="font-medium text-zinc-100">Looking for the ecosystem overview?</p>
        <p className="mt-2 text-zinc-400">
          The{" "}
          <Link
            to="/guide"
            className="text-emerald-300 underline underline-offset-2 hover:text-white"
          >
            community guide
          </Link>{" "}
          explains every Building Culture URL (home, 0x, app, eco, apex) in plain language. CMS
          articles below cover deeper technical topics when Strapi is configured.
        </p>
      </div>
      {!items ? (
        <p className="text-sm text-zinc-500">
          Configure <span className="font-mono">STRAPI_URL</span> and{" "}
          <span className="font-mono">STRAPI_API_TOKEN</span> on the server, and add a Strapi
          category with slug <span className="font-mono">docs</span>.
        </p>
      ) : items.length === 0 ? (
        <p className="text-sm text-zinc-500">No published docs articles yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((d: DocsArticleSummary) => (
            <li key={d.slug}>
              <Link
                to="/docs/$slug"
                params={{ slug: d.slug }}
                className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 transition hover:border-emerald-500/30"
              >
                <BookMarked className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400/90" aria-hidden />
                <div>
                  <p className="font-medium text-zinc-100">{d.title}</p>
                  {d.description ? (
                    <p className="mt-1 text-sm text-zinc-500">{d.description}</p>
                  ) : null}
                  <p className="mt-2 font-mono text-[10px] text-zinc-600">/{d.slug}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </MarketingShell>
  );
}
