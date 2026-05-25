import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBlogPost, listBlogPosts } from "@/lib/blog";

export function generateStaticParams() {
  return listBlogPosts().map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Post" };
  return {
    title: `${post.title} — Building Culture`,
    description: post.summary || post.title,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();
  const paragraphs = post.body.split(/\n\n+/).filter(Boolean);
  return (
    <article className="mx-auto max-w-2xl space-y-6 pb-16">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-muted">Blog</p>
      <h1 className="text-3xl font-semibold tracking-tight text-white">{post.title}</h1>
      {post.date && <p className="text-sm text-zinc-500">{post.date}</p>}
      {post.summary && <p className="text-sm text-zinc-400">{post.summary}</p>}
      <div className="prose prose-invert prose-sm max-w-none border-t border-white/[0.06] pt-6">
        {paragraphs.map((p, i) => (
          <p key={i} className="mb-4 text-sm leading-relaxed text-zinc-300 last:mb-0">
            {p}
          </p>
        ))}
      </div>
      <Link href="/blog" className="inline-block text-sm text-brand hover:underline">
        ← All posts
      </Link>
    </article>
  );
}
