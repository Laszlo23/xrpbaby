import { Link } from "@tanstack/react-router";
import { useReadContract } from "wagmi";
import {
  identityContractAddress,
  isIdentityContractConfigured,
} from "@/lib/identity/config";
import { formatIdentityMintPrice, identityMintPriceShort } from "@/lib/identity/mint-price";
import { cultureLayerIdentityAbi } from "@/lib/identity/identityAbi";
import { IDENTITY_TLD_OPTIONS } from "@/lib/identity/tlds";

export function IdentityMintBand() {
  const { data: mintPriceWei } = useReadContract({
    address: identityContractAddress,
    abi: cultureLayerIdentityAbi,
    functionName: "mintPrice",
    query: { enabled: isIdentityContractConfigured },
  });

  const priceLabel = formatIdentityMintPrice(mintPriceWei);

  return (
    <section className="mt-12 overflow-hidden rounded-3xl border border-[#C5FF41]/35 bg-gradient-to-br from-[#C5FF41]/10 via-transparent to-[#00E5FF]/10 p-6 sm:p-8">
      <p className="mono-label !text-[#C5FF41]">CULTURE LAYER</p>
      <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
        Claim your .culture name
      </h2>
      <p className="mt-2 max-w-xl text-sm text-zinc-400">
        Mint a transferable identity NFT on Base — {identityMintPriceShort}. Live:{" "}
        <span className="font-mono text-zinc-200">{priceLabel}</span>
      </p>
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
        search={{ name: "yourname", tld: ".culture" }}
        className="mt-6 inline-flex items-center rounded-full bg-[#C5FF41] px-6 py-3 text-sm font-semibold text-black hover:bg-white"
      >
        Claim your name →
      </Link>
    </section>
  );
}
