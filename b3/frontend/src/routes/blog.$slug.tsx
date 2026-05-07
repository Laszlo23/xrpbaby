import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { MarketingShell } from "@/components/MarketingShell";
import { JsonLd } from "@/components/JsonLd";
import { getPostBySlug, type BlogPost } from "@/content/blog/posts";
import { Calendar, ArrowLeft } from "lucide-react";
import { getPublicAppOrigin } from "@/lib/app-origin";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => {
    const post = getPostBySlug(params.slug);
    if (!post) return {};
    return pageHead({
      title: post.title,
      description: post.excerpt,
      path: `/blog/${post.slug}`,
      ogType: "article",
      keywords: ["BUILDCHAIN", "blog", post.slug],
    });
  },
  loader: ({ params }) => {
    const post = getPostBySlug(params.slug);
    if (!post) throw notFound();
    return post;
  },
  component: BlogPostPage,
});

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function BlogPostPage() {
  const post = Route.useLoaderData() as BlogPost;
  const origin = getPublicAppOrigin().replace(/\/$/, "");
  const url = `${origin}/blog/${post.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "BUILDCHAIN",
      url: origin,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    inLanguage: "en-US",
  };

  return (
    <>
      <JsonLd id={`blog-post-${post.slug}`} data={jsonLd} />
      <MarketingShell
        eyebrow="Blog"
        tone="purple"
        heroSize="compact"
        title={post.title}
        subtitle={post.excerpt}
        actions={
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-zinc-100 backdrop-blur-md transition hover:border-white/28 hover:bg-white/[0.1]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            All posts
          </Link>
        }
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] pb-6 text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-500">
          <Calendar className="h-3.5 w-3.5" aria-hidden />
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          <span aria-hidden>·</span>
          <span>{post.author}</span>
        </div>

        <div
          className="prose-blog mt-8 space-y-5 [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_li]:text-zinc-400 [&_p]:text-zinc-400 [&_strong]:text-zinc-200 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: post.html.trim() }}
        />
      </MarketingShell>
    </>
  );
}
