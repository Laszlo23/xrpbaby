import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { MarketingShell } from "@/components/MarketingShell";
import { listPostsSorted } from "@/content/blog/posts";
import { BookOpen, Calendar } from "lucide-react";

export const Route = createFileRoute("/blog/")({
  head: () =>
    pageHead({
      title: "Blog",
      description:
        "Updates and explainers from BUILDCHAIN — fair drops on Base, missions, BCD, and how we build in public.",
      path: "/blog",
      keywords: ["BUILDCHAIN", "blog", "Base", "RWA", "drops", "BCD"],
    }),
  component: BlogIndexPage,
});

function formatDate(iso: string) {
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

function BlogIndexPage() {
  const posts = listPostsSorted();

  return (
    <MarketingShell
      eyebrow="Journal"
      tone="purple"
      title={
        <>
          BUILDCHAIN{" "}
          <span className="bg-gradient-to-r from-white via-[#93c5fd] to-[#a78bfa] bg-clip-text text-transparent">
            blog
          </span>
        </>
      }
      subtitle="Product notes, drop philosophy, and how we keep play fair on-chain — without waiting on a CMS."
    >
      <div className="space-y-6">
        <p className="text-zinc-400">
          Posts ship from this repo first; Strapi-backed feeds can layer on later. Subscribe by
          bookmarking — we keep the good stuff indexable and readable.
        </p>

        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="block rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition hover:border-white/[0.12] hover:bg-white/[0.04]"
              >
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-500">
                  <Calendar className="h-3.5 w-3.5" aria-hidden />
                  <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                  <span aria-hidden>·</span>
                  <span>{post.author}</span>
                </div>
                <h2 className="mt-2 font-heading text-lg font-semibold text-white md:text-xl">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm text-zinc-400">{post.excerpt}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-neon">
                  <BookOpen className="h-4 w-4" aria-hidden />
                  Read article
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </MarketingShell>
  );
}
