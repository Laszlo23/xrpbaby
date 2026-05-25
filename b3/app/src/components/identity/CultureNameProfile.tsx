import { Link } from "@tanstack/react-router";
import { useAccount, useChainId, useSignMessage } from "wagmi";
import { useState } from "react";
import type { ResolvedCultureName } from "@/lib/identity/resolve-types";
import { buildPlatformSiweMessage } from "@/lib/platform-siwe";
import { cultureGatewayPath, cultureProfileUrl } from "@/lib/identity/urls";
import { identityChainId } from "@/lib/identity/config";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";

type Props = {
  resolved: ResolvedCultureName;
  paramName: string;
};

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function CultureNameProfile({ resolved, paramName }: Props) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync, isPending: signing } = useSignMessage();
  const [verified, setVerified] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [verifying, setVerifying] = useState(false);

  const displayName =
    resolved.fullName || paramName.toLowerCase();
  const isOwner =
    verified ||
    (resolved.status === "claimed" &&
      resolved.owner &&
      address &&
      address.toLowerCase() === resolved.owner.toLowerCase());

  async function proveOwnership() {
    if (!address || !resolved.owner || resolved.status !== "claimed") return;
    setVerifying(true);
    setVerifyError("");
    try {
      const statement = `I own the Culture Layer name ${resolved.fullName} on ${BRAND_DISPLAY_NAME}.`;
      const { prepared } = await buildPlatformSiweMessage(address, chainId, statement);
      const signature = await signMessageAsync({ message: prepared });
      const res = await fetch("/api/identity/verify-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cultureName: resolved.fullName,
          address,
          message: prepared,
          signature,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setVerifyError(data.error ?? "Verification failed");
        return;
      }
      setVerified(true);
    } catch {
      setVerifyError("Sign-in cancelled or failed");
    } finally {
      setVerifying(false);
    }
  }

  if (resolved.status === "invalid") {
    return (
      <div className="bc-surface min-h-screen px-6 py-16 text-white">
        <Link to="/pass" className="text-sm text-zinc-500 hover:text-white">
          ← Claim a name
        </Link>
        <p className="mono-label mt-8 !text-[#C5FF41]">INVALID NAME</p>
        <h1 className="mt-4 font-display text-3xl font-bold">{paramName}</h1>
        <p className="mt-4 text-zinc-400">
          Use lowercase letters and numbers, like <code className="text-zinc-200">laszlo.culture</code>.
        </p>
      </div>
    );
  }

  if (resolved.status === "available") {
    return (
      <div className="bc-surface min-h-screen px-6 py-16 text-white">
        <Link to="/pass" className="text-sm text-zinc-500 hover:text-white">
          ← Claim a name
        </Link>
        <p className="mono-label mt-8 !text-[#C5FF41]">AVAILABLE</p>
        <h1 className="mt-4 font-display text-4xl font-bold">
          {resolved.handle}
          <span className="text-[#C5FF41]">.{resolved.tld}</span>
        </h1>
        <p className="mt-4 max-w-lg text-zinc-400">
          This Culture Layer name is not minted yet. Names resolve here and across the app once
          claimed on Base — no separate domain purchase.
        </p>
        <Link
          to="/pass"
          search={{ name: resolved.handle, tld: `.${resolved.tld}` }}
          className="mt-8 inline-flex rounded-full bg-[#C5FF41] px-6 py-3 text-sm font-semibold text-black hover:bg-white"
        >
          Mint this name →
        </Link>
      </div>
    );
  }

  if (resolved.status === "unconfigured") {
    return (
      <div className="bc-surface min-h-screen px-6 py-16 text-white">
        <p className="text-zinc-400">Identity contract is not configured in this environment.</p>
      </div>
    );
  }

  const profileUrl = cultureProfileUrl(displayName);

  return (
    <div className="bc-surface min-h-screen px-6 py-16 text-white">
      <Link to="/forest" className="text-sm text-zinc-500 hover:text-white">
        ← Forest
      </Link>
      <p className="mono-label mt-8 !text-[#C5FF41]">CULTURE LAYER NAME</p>
      <h1 className="mt-4 font-display text-4xl font-bold">
        {resolved.handle}
        <span className="text-[#C5FF41]">.{resolved.tld}</span>
      </h1>
      {resolved.isFounding ? (
        <span className="mt-3 inline-block rounded-full border border-[#C5FF41]/40 bg-[#C5FF41]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#C5FF41]">
          Founding member
        </span>
      ) : null}

      <div className="mt-8 max-w-xl space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm">
        <p className="text-zinc-400">
          This is your <strong className="text-white">culture namespace</strong> on Base — not an ICANN
          domain, but a real onchain name that resolves in {BRAND_DISPLAY_NAME} and share links.
        </p>
        {resolved.owner ? (
          <p className="font-mono text-zinc-300">Owner: {shortAddress(resolved.owner)}</p>
        ) : null}
        {resolved.mintedAt ? (
          <p className="text-zinc-500">Minted: {new Date(resolved.mintedAt).toLocaleDateString()}</p>
        ) : null}
        <p className="break-all text-zinc-500">
          Share: <span className="text-[#00E5FF]">{profileUrl}</span>
        </p>
        <p className="text-zinc-600">
          Short link: {cultureGatewayPath(displayName)} (redirects here)
        </p>
      </div>

      {isOwner ? (
        <p className="mt-6 text-sm text-[#C5FF41]">You own this name (wallet verified).</p>
      ) : isConnected && resolved.owner ? (
        <button
          type="button"
          disabled={verifying || signing}
          onClick={() => void proveOwnership()}
          className="mt-6 rounded-full border border-white/20 px-5 py-2 text-sm hover:border-[#C5FF41]/50"
        >
          {verifying || signing ? "Verifying…" : "Prove you own this name"}
        </button>
      ) : (
        <p className="mt-6 text-sm text-zinc-500">Connect the owner wallet to verify.</p>
      )}
      {verifyError ? <p className="mt-2 text-sm text-red-400">{verifyError}</p> : null}

      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/pass" className="text-[#00E5FF] hover:underline">
          Claim another name
        </Link>
        {resolved.contractAddress ? (
          <a
            href={`https://${identityChainId === 8453 ? "basescan.org" : "sepolia.basescan.org"}/address/${resolved.contractAddress}`}
            target="_blank"
            rel="noreferrer noopener"
            className="text-zinc-400 hover:text-white"
          >
            Contract on Basescan
          </a>
        ) : null}
      </div>
    </div>
  );
}
