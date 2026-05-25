"use client";

import Link from "next/link";
import { zeroAddress } from "viem";
import { useReadContract } from "wagmi";
import { guestbookAbi } from "@/lib/contracts";
import { useProtocolAddresses } from "@/lib/use-protocol-addresses";

export function HomeGuestbookStrip() {
  const { guestbook, explorer } = useProtocolAddresses();

  const { data, isPending } = useReadContract({
    address: guestbook,
    abi: guestbookAbi,
    functionName: "lastEntries",
    args: [3n],
    query: { enabled: guestbook !== zeroAddress },
  });

  const unset = guestbook === zeroAddress;
  const tuple = data as
    | readonly [readonly `0x${string}`[], readonly bigint[], readonly string[], readonly string[], readonly string[], readonly string[]]
    | undefined;
  const messages = tuple?.[2] ?? [];
  const authors = tuple?.[0] ?? [];

  return (
    <section className="rounded-2xl border border-gold-500/20 bg-gradient-to-r from-gold-950/20 to-transparent px-5 py-6 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-500/90">On-chain guestbook</p>
          <p className="mt-1 text-sm text-zinc-400">
            Sign with a transaction — message and socials are stored on-chain (immutable).
          </p>
        </div>
        <Link
          href="/guestbook"
          className="inline-flex shrink-0 items-center justify-center rounded-full border border-gold-500/40 bg-gold-500/10 px-5 py-2.5 text-sm font-semibold text-gold-200 transition hover:bg-gold-500/20"
        >
          Sign the guestbook
        </Link>
      </div>
      {unset ? (
        <p className="mt-4 text-xs text-zinc-500">
          Deploy the guestbook contract and set <code className="rounded bg-black/40 px-1">NEXT_PUBLIC_GUESTBOOK</code>{" "}
          (or Base: <code className="rounded bg-black/40 px-1">NEXT_PUBLIC_BASE_GUESTBOOK</code>).
        </p>
      ) : isPending ? (
        <p className="mt-4 text-sm text-zinc-500">Loading entries…</p>
      ) : messages.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">No entries yet — be the first on-chain.</p>
      ) : (
        <ul className="mt-4 space-y-2 border-t border-white/5 pt-4">
          {messages.map((msg, i) => (
            <li key={`${authors[i]}-${i}`} className="text-sm">
              <span className="text-zinc-500">{authors[i]?.slice(0, 6)}…{authors[i]?.slice(-4)}</span>
              <span className="mx-2 text-zinc-700">·</span>
              <span className="text-zinc-300 line-clamp-2">{msg}</span>
            </li>
          ))}
        </ul>
      )}
      {!unset && (
        <p className="mt-3 text-[10px] text-zinc-600">
          <a href={`${explorer}/address/${guestbook}`} target="_blank" rel="noreferrer" className="hover:text-zinc-400">
            View contract
          </a>
        </p>
      )}
    </section>
  );
}
