import Link from "next/link";
import { listBlogPosts } from "@/lib/blog";

export const metadata = {
  title: "Blog — Building Culture",
  description: "Notes on liquidity, regulation, and sustainable operations for tokenized real estate.",
};

export default function BlogIndexPage() {
  const posts = listBlogPosts();
  return (
    <div className="mx-auto max-w-2xl space-y-10 pb-16">
      <header className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-muted">Blog</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">RWA, liquidity, operations</h1>
        <p className="text-sm leading-relaxed text-zinc-400">
          Short editorials on RWA and operations. For risks and disclosures, see{" "}
          <Link href="/legal/risk" className="text-brand hover:underline">
            Risks &amp; disclaimer
          </Link>
          .
        </p>
      </header>
      <ul className="space-y-6">
        {posts.length === 0 ? (
          <li className="text-sm text-zinc-500">No posts yet.</li>
        ) : (
          posts.map((p) => (
            <li key={p.slug} className="border-b border-white/[0.06] pb-6">
              <Link href={`/blog/${p.slug}`} className="text-lg font-semibold text-white hover:text-brand">
                {p.title}
              </Link>
              {p.date && <p className="mt-1 text-[11px] text-zinc-600">{p.date}</p>}
              {p.summary && <p className="mt-2 text-sm text-zinc-400">{p.summary}</p>}
              <Link href={`/blog/${p.slug}`} className="mt-2 inline-block text-sm text-brand hover:underline">
                Read →
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
