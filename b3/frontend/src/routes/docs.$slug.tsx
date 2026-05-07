import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { MarketingShell } from "@/components/MarketingShell";
import { postDocsArticle, type DocsArticleView } from "@/lib/docs-fns";

export const Route = createFileRoute("/docs/$slug")({
  head: async ({ params }) => {
    const row = await postDocsArticle({ data: { slug: params.slug } });
    if (!row) {
      return pageHead({
        title: `Docs — ${params.slug}`,
        description: "BUILDCHAIN documentation — article not found or Strapi unavailable.",
        path: `/docs/${params.slug}`,
        keywords: ["BUILDCHAIN", "docs", params.slug],
        noIndex: true,
      });
    }
    const title = row.title;
    const description =
      row.description && row.description.trim()
        ? row.description.trim()
        : `${title} — BUILDCHAIN documentation.`;
    return pageHead({
      title,
      description,
      path: `/docs/${params.slug}`,
      keywords: ["BUILDCHAIN", "docs", params.slug],
      ogType: "article",
    });
  },
  loader: async ({ params }) => {
    const article = await postDocsArticle({ data: { slug: params.slug } });
    return { article };
  },
  component: DocsArticlePage,
});

function DocsArticlePage() {
  const { slug } = Route.useParams();
  const { article } = Route.useLoaderData() as { article: DocsArticleView | null };

  if (!article) {
    return (
      <MarketingShell
        eyebrow="Documentation"
        tone="slate"
        heroSize="compact"
        title="Doc not found"
        subtitle="Check the slug, Strapi token, or that this article is in the `docs` category."
      >
        <Link to="/docs" className="text-sm text-emerald-300 underline">
          ← Back to docs
        </Link>
      </MarketingShell>
    );
  }

  const { title, description, blocksJson } = article;

  return (
    <MarketingShell
      eyebrow="Documentation"
      tone="slate"
      heroSize="compact"
      articleClassName="max-w-3xl"
      title={title}
      subtitle={description ?? ""}
      actions={
        <Link to="/docs" className="text-sm text-zinc-400 underline hover:text-zinc-200">
          All docs
        </Link>
      }
    >
      <div className="prose prose-invert max-w-none text-sm text-zinc-400">
        <p className="text-xs text-zinc-600">
          Strapi dynamic-zone blocks render as structured data below until a full block renderer
          ships.
        </p>
        <pre className="mt-4 max-h-[min(70vh,640px)] overflow-auto rounded-xl border border-white/[0.08] bg-black/40 p-4 text-[11px] leading-relaxed text-zinc-300">
          {(() => {
            try {
              return JSON.stringify(JSON.parse(blocksJson), null, 2);
            } catch {
              return blocksJson;
            }
          })()}
        </pre>
      </div>
    </MarketingShell>
  );
}
