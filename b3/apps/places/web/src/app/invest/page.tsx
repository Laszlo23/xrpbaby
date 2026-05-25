"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatEther, formatUnits } from "viem";
import { useAccount, useReadContracts } from "wagmi";
import { ComplianceStatus } from "@/components/ComplianceStatus";
import { ContactConciergeCta } from "@/components/ContactConciergeCta";
import { FundingMeter } from "@/components/FundingMeter";
import { TrustSection } from "@/components/TrustSection";
import { Web3TradeGuard } from "@/components/Web3TradeGuard";
import { InvestAfterSection } from "@/components/invest/InvestAfterSection";
import { InvestCoreMetrics } from "@/components/invest/InvestCoreMetrics";
import { InvestGlobalInvestorsStrip } from "@/components/invest/InvestGlobalInvestorsStrip";
import { InvestHero } from "@/components/invest/InvestHero";
import { InvestLiquidityExitSection } from "@/components/invest/InvestLiquidityExitSection";
import { InvestOwnershipSection } from "@/components/invest/InvestOwnershipSection";
import { InvestPositionBuilder } from "@/components/invest/InvestPositionBuilder";
import { InvestPropertyHero } from "@/components/invest/InvestPropertyHero";
import { InvestPropertySwitcher } from "@/components/invest/InvestPropertySwitcher";
import { InvestTradeLinks } from "@/components/invest/InvestTradeLinks";
import { PropertyInvestTrustStrip } from "@/components/PropertyInvestTrustStrip";
import { erc20Abi } from "@/lib/contracts";
import { demoAvailableShares } from "@/lib/demo-investment-math";
import { getFundingStats } from "@/lib/funding-stats";
import { getListingsChainDisplayName, getListingsChainId } from "@/lib/listings-config";
import { useListingsProtocolAddresses } from "@/lib/use-listings-protocol-addresses";
import { usePrimarySaleQuote } from "@/lib/use-primary-sale-quote";
import { usePropertyShareList } from "@/lib/usePropertyShareList";

function parseShareFloat(wei: bigint): number {
  const s = formatEther(wei);
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

function InvestPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const propertyParam = searchParams.get("property");
  const { address } = useAccount();
  const { explorer: explorerBase } = useListingsProtocolAddresses();
  const listingsChainId = getListingsChainId();
  const chainLabel = getListingsChainDisplayName(listingsChainId);

  const { chainRows: rows, loading, unset } = usePropertyShareList();
  const [selectedId, setSelectedId] = useState("");
  const [wholeShares, setWholeShares] = useState(1);

  useEffect(() => {
    if (rows.length === 0) return;
    if (propertyParam && rows.some((r) => r.id.toString() === propertyParam)) {
      setSelectedId(propertyParam);
      return;
    }
    if (selectedId === "") {
      setSelectedId(rows[0].id.toString());
    }
  }, [rows, propertyParam, selectedId]);

  const selected = useMemo(() => {
    if (!selectedId && rows[0]) return rows[0];
    const id = BigInt(selectedId || "0");
    return rows.find((r) => r.id === id) ?? rows[0];
  }, [rows, selectedId]);

  useEffect(() => {
    setWholeShares(1);
  }, [selected?.id]);

  const demo = selected?.demo;
  const propertyId = selected?.id ?? 0n;
  const goalUsd = demo?.illustrativePropertyValueUsd ?? 10_000_000;
  const funding = propertyId > 0n ? getFundingStats(propertyId, goalUsd) : getFundingStats(1n, goalUsd);
  const fundingCurrency = demo?.creditLines?.length ? "EUR" : "USD";

  const quote = usePrimarySaleQuote(selected?.tokenAddress, selected?.id);

  const unitPriceUsd = useMemo(() => {
    if (quote.onChainSale && quote.pricePerShare !== undefined) {
      return Number(formatUnits(quote.pricePerShare, quote.effectiveDecimals));
    }
    return demo?.illustrativeShareUsd ?? 1000;
  }, [quote.onChainSale, quote.pricePerShare, quote.effectiveDecimals, demo?.illustrativeShareUsd]);

  const paySymbol = quote.onChainSale ? quote.paySymbol : "USDC";
  const totalPayUsd = wholeShares * unitPriceUsd;
  const totalPayDisplay = totalPayUsd.toLocaleString("en-US", { maximumFractionDigits: 2 });

  const balanceReads = useMemo(
    () =>
      address
        ? rows.map((r) => ({
            address: r.tokenAddress,
            abi: erc20Abi,
            functionName: "balanceOf" as const,
            args: [address] as const,
          }))
        : [],
    [rows, address],
  );

  const { data: balanceRows } = useReadContracts({
    contracts: balanceReads,
    query: { enabled: !!address && balanceReads.length > 0 },
  });

  const withBalances = useMemo(() => {
    if (!balanceRows?.length) return rows.map((r) => ({ ...r, balance: undefined as bigint | undefined }));
    return rows.map((r, i) => {
      const row = balanceRows[i];
      const bal = row?.status === "success" && typeof row.result === "bigint" ? row.result : undefined;
      return { ...r, balance: bal };
    });
  }, [rows, balanceRows]);

  const { totalUsdEst, propertiesHeldCount } = useMemo(() => {
    let total = 0;
    let count = 0;
    for (const r of withBalances) {
      const bal = r.balance ?? 0n;
      if (bal === 0n) continue;
      count += 1;
      const shares = parseShareFloat(bal);
      const px = r.demo?.illustrativeShareUsd ?? 0;
      total += shares * px;
    }
    return { totalUsdEst: total, propertiesHeldCount: count };
  }, [withBalances]);

  const selectedBal = useMemo(() => {
    if (!selected) return undefined;
    const row = withBalances.find((r) => r.id === selected.id);
    return row?.balance;
  }, [withBalances, selected]);

  const alreadyOwnsSelected = selectedBal !== undefined && selectedBal > 0n;

  const availableModel =
    demo && propertyId > 0n ? demoAvailableShares(propertyId, goalUsd) : 0;

  let sharePriceLabel = "—";
  let sharePriceSub: string | undefined;
  if (quote.onChainSale && quote.pricePerShare !== undefined) {
    sharePriceLabel = `${formatUnits(quote.pricePerShare, quote.effectiveDecimals)} ${paySymbol}`;
  } else if (demo?.illustrativeShareUsd != null) {
    sharePriceLabel = `~$${demo.illustrativeShareUsd.toLocaleString()} USDC (reference)`;
    sharePriceSub = "Bind to on-chain primary sale when configured in primary-sales.json.";
  }

  function onSelectProperty(id: string) {
    setSelectedId(id);
    router.replace(`/invest?property=${id}`, { scroll: false });
  }

  if (unset) {
    return (
      <div className="mx-auto max-w-[1280px] space-y-6 pb-16">
        <InvestHero />
        <p className="text-zinc-400">
          Configure registry and share factory in <code className="text-gold-400">.env.local</code> to load listings.
        </p>
      </div>
    );
  }

  if (loading && rows.length === 0) {
    return (
      <div className="mx-auto max-w-[1280px] pb-16">
        <p className="animate-pulse text-zinc-500">Loading invest journey…</p>
      </div>
    );
  }

  if (!selected || rows.length === 0) {
    return (
      <div className="mx-auto max-w-[1280px] space-y-6 pb-16">
        <InvestHero />
        <p className="text-zinc-400">No share tokens listed yet.</p>
        <Link href="/properties" className="text-brand hover:underline">
          Browse properties →
        </Link>
      </div>
    );
  }

  if (!demo) {
    return (
      <div className="mx-auto max-w-[1280px] space-y-6 pb-16">
        <InvestHero />
        <InvestPropertySwitcher rows={rows} selectedId={selected.id.toString()} onSelect={onSelectProperty} />
        <p className="text-zinc-400">No listing narrative on file for this property — open the property page or Trade for execution details.</p>
        <Link href={`/trade?property=${selected.id.toString()}`} className="text-brand hover:underline">
          Go to Trade →
        </Link>
      </div>
    );
  }

  const propertyTitle = demo.investorCardTitle ?? demo.headline;

  return (
    <div className="mx-auto max-w-[1280px] space-y-10 pb-16">
      <InvestHero />

      <InvestPropertyHero propertyId={propertyId} demo={demo} />

      <InvestPropertySwitcher rows={rows} selectedId={selected.id.toString()} onSelect={onSelectProperty} />

      <InvestGlobalInvestorsStrip propertyId={propertyId} funding={funding} />

      <FundingMeter stats={funding} variant="compact" label="Funding progress (reference)" currency={fundingCurrency} />

      <InvestCoreMetrics demo={demo} sharePriceLabel={sharePriceLabel} sharePriceSub={sharePriceSub} />

      <Web3TradeGuard offlinePrimarySale={!quote.onChainSale}>
        <InvestPositionBuilder
          demo={demo}
          symbol={selected.symbol}
          propertyTitle={propertyTitle}
          referenceAssetValue={goalUsd}
          availableSharesModel={availableModel}
          portfolioValueRefUsd={totalUsdEst}
          propertiesHeldCount={propertiesHeldCount}
          alreadyOwnsSelected={alreadyOwnsSelected}
          quote={quote}
          wholeShares={wholeShares}
          onWholeSharesChange={setWholeShares}
        />
      </Web3TradeGuard>

      <InvestLiquidityExitSection demo={demo} />

      <InvestOwnershipSection demo={demo} />

      <PropertyInvestTrustStrip
        propertyId={propertyId}
        tokenAddress={selected.tokenAddress}
        explorerBase={explorerBase}
        demo={demo}
      />

      <InvestTradeLinks
        propertyIdStr={selected.id.toString()}
        chainLabel={chainLabel}
        paySymbol={paySymbol}
        totalPayDisplay={totalPayDisplay}
        wholeShares={wholeShares}
        symbol={selected.symbol}
      />

      <ContactConciergeCta />

      <InvestAfterSection />

      <ComplianceStatus />

      <TrustSection />
    </div>
  );
}

export default function InvestPage() {
  return (
    <Suspense
      fallback={<div className="mx-auto max-w-[1280px] px-4 py-20 text-center text-muted">Loading…</div>}
    >
      <InvestPageInner />
    </Suspense>
  );
}
