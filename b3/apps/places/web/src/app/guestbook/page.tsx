import type { Metadata } from "next";
import Link from "next/link";
import { GuestbookPageClient } from "./GuestbookPageClient";

export const metadata: Metadata = {
  title: "Guestbook — Building Culture",
  description: "Sign the on-chain guestbook with your wallet. Share X, LinkedIn, and Farcaster so the community can connect.",
};

export default function GuestbookPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      <header className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-muted">Community</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">On-chain guestbook</h1>
        <p className="text-sm text-zinc-400">
          One transaction stores your message and social links on-chain. Gas is paid by you; entries are immutable.
        </p>
        <Link href="/community" className="text-sm text-gold-400 hover:underline">
          ← Community hub
        </Link>
      </header>
      <GuestbookPageClient />
    </div>
  );
}
