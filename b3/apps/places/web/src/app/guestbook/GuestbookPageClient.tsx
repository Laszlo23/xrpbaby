"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { guestbookAbi } from "@/lib/contracts";
import { useProtocolAddresses } from "@/lib/use-protocol-addresses";

const MAX_MSG = 400;
const MAX_HANDLE = 96;

export function GuestbookPageClient() {
  const { isConnected } = useAccount();
  const { guestbook, explorer } = useProtocolAddresses();
  const [message, setMessage] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [farcaster, setFarcaster] = useState("");

  const { data: rawList, refetch, isPending: loadingList } = useReadContract({
    address: guestbook,
    abi: guestbookAbi,
    functionName: "lastEntries",
    args: [15n],
    query: { enabled: guestbook !== "0x0000000000000000000000000000000000000000" },
  });

  const entries = useMemo(() => {
    const t = rawList as
      | readonly [
          readonly `0x${string}`[],
          readonly bigint[],
          readonly string[],
          readonly string[],
          readonly string[],
          readonly string[],
        ]
      | undefined;
    if (!t) return [];
    const [authors, timestamps, messages, xs, ins, fcs] = t;
    const out: {
      author: `0x${string}`;
      timestamp: bigint;
      message: string;
      xHandle: string;
      linkedin: string;
      farcaster: string;
    }[] = [];
    for (let i = 0; i < messages.length; i++) {
      out.push({
        author: authors[i]!,
        timestamp: timestamps[i]!,
        message: messages[i]!,
        xHandle: xs[i] ?? "",
        linkedin: ins[i] ?? "",
        farcaster: fcs[i] ?? "",
      });
    }
    return out;
  }, [rawList]);

  const { writeContract, data: txHash, isPending: writing, error: writeErr, reset } = useWriteContract();
  const { isLoading: confirming, isSuccess: confirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (confirmed) void refetch();
  }, [confirmed, refetch]);

  function submit() {
    reset();
    if (guestbook === "0x0000000000000000000000000000000000000000") return;
    const m = message.trim();
    if (!m.length || m.length > MAX_MSG) return;
    if (xHandle.length > MAX_HANDLE || linkedin.length > MAX_HANDLE || farcaster.length > MAX_HANDLE) return;
    writeContract({
      address: guestbook,
      abi: guestbookAbi,
      functionName: "leaveEntry",
      args: [m, xHandle.trim(), linkedin.trim(), farcaster.trim()],
    });
  }

  if (guestbook === "0x0000000000000000000000000000000000000000") {
    return (
      <p className="rounded-lg border border-amber-500/30 bg-amber-950/30 px-4 py-3 text-sm text-amber-100/90">
        Guestbook contract not configured. Set <code className="text-gold-300">NEXT_PUBLIC_GUESTBOOK</code> after
        deployment.
      </p>
    );
  }

  return (
    <div className="space-y-10">
      <section className="glass-card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-white">Leave an entry</h2>
        <p className="text-sm text-zinc-400">
          Connect your wallet and submit one transaction. Message max {MAX_MSG} characters; handles/URLs max{" "}
          {MAX_HANDLE} each. One entry per wallet per hour (contract rule).
        </p>
        {!isConnected && <p className="text-sm text-amber-200/90">Connect a wallet to post.</p>}
        <label className="block text-sm">
          <span className="text-zinc-500">Message</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, MAX_MSG))}
            rows={4}
            className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
            placeholder="Why you are here — community, build culture, etc."
            disabled={!isConnected}
          />
          <span className="text-[10px] text-zinc-600">
            {message.length}/{MAX_MSG}
          </span>
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="text-zinc-500">X (Twitter)</span>
            <input
              value={xHandle}
              onChange={(e) => setXHandle(e.target.value.slice(0, MAX_HANDLE))}
              className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
              placeholder="@handle"
            />
          </label>
          <label className="block text-sm">
            <span className="text-zinc-500">LinkedIn</span>
            <input
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value.slice(0, MAX_HANDLE))}
              className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
              placeholder="URL or handle"
            />
          </label>
          <label className="block text-sm">
            <span className="text-zinc-500">Farcaster</span>
            <input
              value={farcaster}
              onChange={(e) => setFarcaster(e.target.value.slice(0, MAX_HANDLE))}
              className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
              placeholder="@fid or URL"
            />
          </label>
        </div>
        <button
          type="button"
          disabled={!isConnected || writing || confirming || !message.trim()}
          onClick={() => submit()}
          className="rounded-full bg-gradient-to-r from-gold-600 to-gold-500 px-6 py-2.5 text-sm font-semibold text-black disabled:opacity-40"
        >
          {writing || confirming ? "Confirm in wallet…" : "Submit on-chain"}
        </button>
        {writeErr && <p className="text-xs text-red-400">{writeErr.message}</p>}
        {confirmed && (
          <p className="text-sm text-emerald-400">
            Included in chain.
            {txHash && (
              <>
                {" "}
                <a href={`${explorer}/tx/${txHash}`} target="_blank" rel="noreferrer" className="underline">
                  View transaction
                </a>
              </>
            )}
          </p>
        )}
        {confirmed && (
          <button
            type="button"
            onClick={() => {
              setMessage("");
              setXHandle("");
              setLinkedin("");
              setFarcaster("");
            }}
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            Clear form
          </button>
        )}
      </section>

      <section className="glass-card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-white">Recent entries</h2>
        {loadingList ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-zinc-500">No entries yet.</p>
        ) : (
          <ul className="space-y-6">
            {entries.map((e, i) => (
              <li key={`${e.author}-${e.timestamp}-${i}`} className="border-b border-white/5 pb-6 last:border-0">
                <p className="text-sm whitespace-pre-wrap text-zinc-200">{e.message}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                  <span className="font-mono">{e.author}</span>
                  <span>{new Date(Number(e.timestamp) * 1000).toLocaleString()}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs">
                  {e.xHandle && (
                    <span>
                      X: <span className="text-zinc-300">{e.xHandle}</span>
                    </span>
                  )}
                  {e.linkedin && (
                    <span>
                      LinkedIn: <span className="text-zinc-300">{e.linkedin}</span>
                    </span>
                  )}
                  {e.farcaster && (
                    <span>
                      Farcaster: <span className="text-zinc-300">{e.farcaster}</span>
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="text-[10px] text-zinc-600">
          On-chain content is permanent and uncensored at the protocol level — stay respectful and compliant with local
          law.
        </p>
      </section>
    </div>
  );
}
