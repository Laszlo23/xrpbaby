"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Post = { id: number; title: string; body: string; published_at: string };

export function HomeCommunityFeed({ limit = 5 }: { limit?: number }) {
  const [posts, setPosts] = useState<Post[] | null>(null);

  useEffect(() => {
    void fetch("/api/community/posts")
      .then((r) => r.json())
      .then((d: { posts?: Post[] }) => setPosts(d.posts ?? []))
      .catch(() => setPosts([]));
  }, []);

  if (posts === null) {
    return (
      <div className="glass-card overflow-hidden border-eco/20">
        <div className="border-b border-eco/15 px-5 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-eco-muted">Platform updates</p>
        </div>
        <p className="px-5 py-8 text-sm text-zinc-500">Loading…</p>
      </div>
    );
  }

  const shown = posts.slice(0, limit);

  return (
    <div className="glass-card overflow-hidden border-eco/20">
      <div className="border-b border-eco/15 px-5 py-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-eco-muted">Platform updates</p>
        <p className="mt-1 text-xs text-muted">From the team when the database is configured.</p>
      </div>
      {shown.length === 0 ? (
        <div className="space-y-3 px-5 py-6 text-sm text-zinc-500">
          <p>No posts yet. Follow announcements on the community hub.</p>
          <Link href="/community" className="font-medium text-gold-400 hover:underline">
            Open community →
          </Link>
        </div>
      ) : (
        <ul className="max-h-64 divide-y divide-eco/10 overflow-y-auto text-sm">
          {shown.map((p) => (
            <li key={p.id} className="px-5 py-4">
              <p className="font-medium text-canvas">{p.title}</p>
              <p className="mt-1 line-clamp-3 text-zinc-400">{p.body}</p>
              <p className="mt-2 text-[10px] text-zinc-600">{new Date(p.published_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
      <div className="border-t border-eco/10 px-5 py-3">
        <Link href="/community" className="text-xs font-medium text-gold-400 hover:underline">
          Full community hub →
        </Link>
      </div>
    </div>
  );
}
