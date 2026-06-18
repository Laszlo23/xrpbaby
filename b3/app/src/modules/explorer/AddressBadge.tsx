import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Copy } from "lucide-react";

import { shortAddress } from "@/modules/explorer/lib";

export function AddressBadge({
  address,
  label,
  ecosystem,
  link = true,
}: {
  address: string;
  label?: string | null;
  ecosystem?: boolean;
  link?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    void navigator.clipboard?.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const inner = (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] transition ${
        ecosystem
          ? "border-[var(--base-blue)]/40 bg-[var(--base-blue)]/10 text-white"
          : "border-white/[0.12] bg-black/40 text-zinc-300"
      }`}
      title={address}
    >
      {label ? <span className="font-sans font-medium">{label}</span> : shortAddress(address)}
      {label ? <span className="text-zinc-500">{shortAddress(address)}</span> : null}
      <button
        type="button"
        onClick={copy}
        className="text-zinc-500 transition hover:text-white"
        aria-label="Copy address"
      >
        {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      </button>
    </span>
  );

  if (!link) return inner;
  return (
    <Link
      to="/explorer/address/$address"
      params={{ address: address.toLowerCase() }}
      className="hover:opacity-90"
    >
      {inner}
    </Link>
  );
}
