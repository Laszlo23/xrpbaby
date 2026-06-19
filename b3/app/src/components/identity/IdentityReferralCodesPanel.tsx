"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAccount, useSignMessage } from "wagmi";
import { usePrivyWalletAddress } from "@/lib/privy-wallet";
import { privyEnabled } from "@/lib/privy-env";
import { buildPlatformSiweMessage } from "@/lib/platform-siwe";
import { useCultureNetwork } from "@/contexts/CultureNetworkContext";
import { formatUnits } from "viem";
import { BCC_SYMBOL } from "@bc/bcc-kit";

type ReferralCodeRow = {
  code: string;
  status: string;
  batchIndex: number;
};

function formatLockedBcc(wei: string): string {
  try {
    const v = formatUnits(BigInt(wei), 18);
    const n = Number(v);
    if (Number.isFinite(n)) return n.toFixed(2);
    return v;
  } catch {
    return "0";
  }
}

function buildReferralUrl(code: string): string {
  if (typeof window === "undefined") return `/pass?ref=${code}`;
  return `${window.location.origin}/pass?ref=${encodeURIComponent(code)}`;
}

export function IdentityReferralCodesPanel() {
  const privyAddress = usePrivyWalletAddress();
  const { address: wagmiAddress } = useAccount();
  const address = privyEnabled ? (privyAddress ?? wagmiAddress) : wagmiAddress;
  const { identity } = useCultureNetwork();
  const { signMessageAsync } = useSignMessage();

  const [codes, setCodes] = useState<ReferralCodeRow[]>([]);
  const [lockedBccWei, setLockedBccWei] = useState("0");
  const [loading, setLoading] = useState(false);

  const loadCodes = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/identity/referral/codes?wallet=${encodeURIComponent(address)}`);
      const data = (await res.json()) as {
        ok?: boolean;
        codes?: ReferralCodeRow[];
        lockedBccWei?: string;
      };
      if (data.ok) {
        setCodes(data.codes ?? []);
        setLockedBccWei(data.lockedBccWei ?? "0");
      }
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    void loadCodes();
  }, [loadCodes]);

  async function copyCode(code: string) {
    const url = buildReferralUrl(code);
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Referral link copied");

      if (address) {
        try {
          const { prepared } = await buildPlatformSiweMessage(
            address as `0x${string}`,
            identity.identityChainId,
            `Share Culture ID referral ${code}.`,
          );
          const signature = await signMessageAsync({ message: prepared });
          const shareRes = await fetch("/api/identity/referral/share", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address, message: prepared, signature }),
          });
          if (shareRes.ok) {
            const shareData = (await shareRes.json()) as { pointsGranted?: number };
            if (shareData.pointsGranted && shareData.pointsGranted > 0) {
              toast.message(`+${shareData.pointsGranted} CP for sharing your code`);
            }
          }
        } catch {
          /* share task is best-effort */
        }
      }
    } catch {
      toast.error("Could not copy link");
    }
  }

  if (!address) return null;

  const activeCodes = codes.filter((c) => c.status === "active");
  const lockedBcc = formatLockedBcc(lockedBccWei);

  return (
    <section
      data-testid="identity-referral-panel"
      className="mt-8 rounded-2xl border border-[#C5FF41]/20 bg-black/30 p-6"
    >
      <h3 className="font-display text-lg font-bold text-white">Your referral codes</h3>
      <p className="mt-2 text-sm text-zinc-400">
        Share codes with friends — they need one to mint a 4+ letter Culture ID. You earn locked{" "}
        {BCC_SYMBOL} per successful referral.
      </p>

      {BigInt(lockedBccWei || "0") > 0n ? (
        <p className="mt-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2 text-xs text-amber-100">
          Referral {BCC_SYMBOL} earned: {lockedBcc} (locked — claim opens when treasury funds pool)
        </p>
      ) : null}

      {loading ? (
        <p className="mt-4 text-sm text-zinc-500">Loading codes…</p>
      ) : activeCodes.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">
          Your 7-code batch unlocks after your first mint sync completes.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {activeCodes.map((row) => (
            <li
              key={row.code}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <span className="font-mono text-sm text-[#C5FF41]">{row.code}</span>
              <button
                type="button"
                onClick={() => void copyCode(row.code)}
                className="rounded-full border border-white/15 px-3 py-1 text-xs text-white hover:border-[#C5FF41]/40"
              >
                Copy link
              </button>
            </li>
          ))}
        </ul>
      )}

      {codes.length > 0 ? (
        <p className="mt-3 font-mono text-[10px] text-zinc-600">
          {activeCodes.length} active · {codes.filter((c) => c.status === "consumed").length} used
        </p>
      ) : null}
    </section>
  );
}
