import { Link } from "@tanstack/react-router";
import { useReadContract } from "wagmi";
import { useCultureNetwork } from "@/contexts/CultureNetworkContext";
import {
  formatIdentityMintPrice,
  formatIdentityMintLadderUrgency,
} from "@/lib/identity/mint-price";
import { culturePointsForMint, usdPriceForTotalMinted } from "@/lib/identity/mint-ladder";
import { cultureLayerIdentityAbi } from "@/lib/identity/identityAbi";
import { IDENTITY_LAUNCH_REFERRAL_CODE } from "@/lib/identity/referral-constants";
import { IDENTITY_MINT_BASE_USD, IDENTITY_MINT_TIER_SIZE } from "@/lib/identity/mint-ladder";
import { IDENTITY_TLD_OPTIONS } from "@/lib/identity/tlds";

export function IdentityMintBand() {
  const { identity } = useCultureNetwork();
  const { data: mintPriceWei } = useReadContract({
    address: identity.identityContractAddress || undefined,
    abi: cultureLayerIdentityAbi,
    functionName: "mintPrice",
    chainId: identity.identityChainId,
    query: { enabled: identity.isIdentityContractConfigured },
  });

  const { data: totalMintedRaw } = useReadContract({
    address: identity.identityContractAddress || undefined,
    abi: cultureLayerIdentityAbi,
    functionName: "totalMinted",
    chainId: identity.identityChainId,
    query: { enabled: identity.isIdentityContractConfigured },
  });

  const totalMinted = totalMintedRaw !== undefined ? Number(totalMintedRaw) : undefined;
  const tierUsd = totalMinted !== undefined ? usdPriceForTotalMinted(totalMinted) : undefined;
  const cpPreview = totalMinted !== undefined ? culturePointsForMint(totalMinted) : undefined;

  const priceLabel = formatIdentityMintPrice(mintPriceWei, {
    networkId: identity.networkId,
    totalMinted,
    tierUsd,
  });

  return (
    <section className="overflow-hidden rounded-3xl border border-[#C5FF41]/35 bg-gradient-to-br from-[#C5FF41]/10 via-transparent to-[#00E5FF]/10 p-6 sm:p-8">
      <p className="mono-label !text-[#C5FF41]">Culture ID · Base Mainnet</p>
      <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
        Claim your .culture name
      </h2>
      <p className="mt-2 max-w-xl text-sm text-zinc-400">
        Mint on <strong className="text-white">Base Mainnet</strong> with invite code{" "}
        <strong className="text-[#C5FF41]">{IDENTITY_LAUNCH_REFERRAL_CODE}</strong> — about $
        {IDENTITY_MINT_BASE_USD.toFixed(2)} for the first {IDENTITY_MINT_TIER_SIZE} minters. Live:{" "}
        <span className="font-mono text-zinc-200">{priceLabel}</span>
      </p>
      {totalMinted !== undefined ? (
        <p className="mt-2 font-mono text-xs text-[var(--base-blue)]">
          {formatIdentityMintLadderUrgency(totalMinted)}
          {cpPreview ? ` · +${cpPreview} Culture Points on mint` : null}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {IDENTITY_TLD_OPTIONS.map((tld) => (
          <span
            key={tld}
            className="rounded-full border border-white/15 bg-black/30 px-3 py-1 font-mono text-xs text-zinc-300"
          >
            {tld}
          </span>
        ))}
      </div>
      <Link
        to="/pass"
        search={{ name: "yourname", tld: ".culture", ref: IDENTITY_LAUNCH_REFERRAL_CODE }}
        className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[#C5FF41] px-6 py-3 text-sm font-semibold text-black hover:bg-white"
      >
        Claim .culture name →
      </Link>
    </section>
  );
}
