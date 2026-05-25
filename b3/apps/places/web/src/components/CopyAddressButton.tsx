"use client";

import { useCallback, useState } from "react";

type Props = {
  address: string;
  className?: string;
};

export function CopyAddressButton({ address, className = "" }: Props) {
  const [done, setDone] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      /* ignore */
    }
  }, [address]);

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className={`rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-zinc-400 transition hover:border-brand/30 hover:text-brand ${className}`}
    >
      {done ? "Copied" : "Copy"}
    </button>
  );
}
