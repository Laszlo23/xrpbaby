import { createFileRoute, Link } from "@tanstack/react-router";
import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { bcdFixedPriceSaleAbi } from "@bc/contracts-sdk";
import { MarketingShell } from "@/components/MarketingShell";
import { Button } from "@/components/ui/button";
import { useBcdEconomy } from "@/contexts/BcdEconomyContext";
import {
  BCD_SYMBOL,
  getBcdSaleAddress,
  getBcdSaleRoundId,
  getBcdTokenAddress,
} from "@/lib/bcd-config";
import { pageHead } from "@/lib/seo";
import { parseBcdChainId } from "@/lib/chains";

export const Route = createFileRoute("/presale")({
  head: () =>
    pageHead({
      title: `Presale — ${BCD_SYMBOL}`,
      description:
        "Fixed-supply presale round for Building Culture Dollar: on-chain caps, optional allowlist, same token at public launch—no separate redeemable copy token required.",
      path: "/presale",
      keywords: ["BCD presale", "Building Culture Dollar", "token sale", "BCDFixedPriceSale"],
    }),
  component: PresalePage,
});

function formatTs(sec: bigint): string {
  try {
    return new Date(Number(sec) * 1000).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return String(sec);
  }
}

function PresaleRoundStats() {
  const sale = getBcdSaleAddress();
  const token = getBcdTokenAddress();
  const roundId = getBcdSaleRoundId();
  const chainId = parseBcdChainId();
  const enabled = !!(sale && token);

  const { data: roundRaw } = useReadContract({
    chainId,
    address: sale,
    abi: bcdFixedPriceSaleAbi,
    functionName: "rounds",
    args: [roundId],
    query: { enabled },
  });

  const { data: soldWei } = useReadContract({
    chainId,
    address: sale,
    abi: bcdFixedPriceSaleAbi,
    functionName: "roundSoldBcdWei",
    args: [roundId],
    query: { enabled },
  });

  const { data: paused } = useReadContract({
    chainId,
    address: sale,
    abi: bcdFixedPriceSaleAbi,
    functionName: "paused",
    query: { enabled },
  });

  if (!sale || !token) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 text-sm text-zinc-500">
        On-chain presale is not wired in this deployment yet (missing token or sale address in
        environment).
      </div>
    );
  }

  const round = roundRaw as
    | { start: bigint; end: bigint; maxBcdWei: bigint; merkleRoot: `0x${string}` }
    | undefined;

  const max = round?.maxBcdWei ?? 0n;
  const configured = max > 0n;
  const now = BigInt(Math.floor(Date.now() / 1000));
  const active = configured && now >= (round?.start ?? 0n) && now <= (round?.end ?? 0n) && !paused;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 space-y-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
        Round · #{String(roundId)}
      </p>
      {!configured ? (
        <p className="text-sm text-zinc-500">
          Sale contract is reachable, but this round has no{" "}
          <span className="font-mono">maxBcdWei</span> yet—operators still need to call{" "}
          <span className="font-mono">configureRound</span>.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="font-heading text-lg font-semibold text-white">
              {soldWei !== undefined
                ? `${formatUnits(soldWei as bigint, 18)} / ${formatUnits(max, 18)}`
                : "—"}{" "}
              <span className="text-sm font-normal text-zinc-500">{BCD_SYMBOL} allocated</span>
            </p>
            {paused ? (
              <span className="text-xs text-amber-500/90">Paused</span>
            ) : active ? (
              <span className="text-xs text-emerald-500/90">Active</span>
            ) : now < (round?.start ?? 0n) ? (
              <span className="text-xs text-zinc-500">Not started</span>
            ) : (
              <span className="text-xs text-zinc-500">Ended</span>
            )}
          </div>
          <p className="text-xs text-zinc-500">
            Window: {round ? formatTs(round.start) : "—"} → {round ? formatTs(round.end) : "—"}
          </p>
        </>
      )}
    </div>
  );
}

function PresalePage() {
  const { openGetBcd } = useBcdEconomy();

  return (
    <MarketingShell
      eyebrow="Early access"
      tone="amber"
      heroSize="compact"
      articleClassName="max-w-3xl"
      title={
        <>
          <span className="bg-gradient-to-r from-amber-200 via-white to-amber-100/90 bg-clip-text text-transparent">
            {BCD_SYMBOL} presale
          </span>
        </>
      }
      subtitle="A capped on-chain round: buyers receive the same ERC-20 used in the app. We use fixed price, per-wallet limits, and optional merkle allowlists—no second “IOU” token to swap later."
      actions={
        <Button
          type="button"
          size="lg"
          className="rounded-full bg-amber-500/90 px-8 text-sm font-medium text-zinc-950 shadow-[0_0_40px_-8px_rgb(245_158_11/60%)] hover:bg-amber-400"
          onClick={openGetBcd}
        >
          Open purchase flow
        </Button>
      }
    >
      <div className="flex flex-col gap-10">
        <PresaleRoundStats />

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
            Why not a “copy token”?
          </h2>
          <p>
            A placeholder ERC-20 redeemed 1:1 at main launch adds a second symbol, liquidity
            fragmentation, and a redemption contract (and clearer operational risk around who can
            mint the real token). The deployed{" "}
            <span className="font-mono text-zinc-300">BCDFixedPriceSale</span> path already mints{" "}
            {BCD_SYMBOL} into your wallet during the presale window, with the round’s global cap and
            rules enforced on-chain—functionally equivalent to “presale allocation” without a swap
            step later.
          </p>
          <p>
            If you still want a transferable pre-TGE voucher (for secondary trading or
            integrations), design that deliberately with legal and liquidity plans—this page assumes
            the simpler sale-contract model above.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
            How buying works here
          </h2>
          <ul className="list-inside list-disc space-y-2 marker:text-zinc-600">
            <li>
              Connect a wallet on the configured chain and click{" "}
              <strong className="font-medium text-zinc-200">Open purchase flow</strong> above (same
              UI as “Get BCD” elsewhere).
            </li>
            <li>
              Public rounds anyone can participate; private rounds load a merkle proof (hosted JSON
              or paste) matching the on-chain root.
            </li>
            <li>
              Payment can be native ETH or an ERC-20, depending on how the sale contract was
              configured—check the modal for the live quote and fees.
            </li>
          </ul>
        </section>

        <p className="text-sm text-zinc-500">
          Partners linking here may append{" "}
          <span className="font-mono text-zinc-600">?agent_ref=your_handle</span> (and optional
          UTMs) so sessions attribute traffic in product analytics. Not financial advice. See{" "}
          <Link to="/faq" className="text-zinc-300 underline underline-offset-4">
            FAQ
          </Link>{" "}
          and{" "}
          <Link to="/legal/terms" className="text-zinc-300 underline underline-offset-4">
            Terms
          </Link>
          .
        </p>
      </div>
    </MarketingShell>
  );
}
