"use client";

import { useEffect, useMemo, useState } from "react";
import { useReadContract } from "wagmi";
import { primaryShareSaleErc20Abi } from "@/lib/contracts";
import { getListingsChainId } from "@/lib/listings-config";
import { getPrimarySaleForProperty, type PrimarySaleEntry } from "@/lib/primary-sales-config";

const zero = "0x0000000000000000000000000000000000000000" as const;

export type PrimarySaleQuote = {
  config: PrimarySaleEntry | undefined;
  saleAddress: `0x${string}`;
  onChainSale: boolean;
  pricePerShare: bigint | undefined;
  paymentToken: `0x${string}`;
  effectiveDecimals: number;
  paySymbol: string;
  shareTokenFromSale: `0x${string}` | undefined;
  isShareTokenSuccess: boolean;
};

/**
 * Read-only primary sale binding: config from primary-sales.json + on-chain shareToken, price, payment.
 * Reuse for Invest journey and Trade primary panel to avoid duplicating contract read logic.
 */
export function usePrimarySaleQuote(shareTokenAddress: `0x${string}` | undefined, propertyId: bigint | undefined) {
  const listingsChainId = getListingsChainId();
  const [config, setConfig] = useState<PrimarySaleEntry | undefined>(undefined);

  useEffect(() => {
    if (propertyId === undefined) {
      setConfig(undefined);
      return;
    }
    setConfig(getPrimarySaleForProperty(propertyId, listingsChainId));
  }, [propertyId, listingsChainId]);

  const saleAddr = (config?.saleAddress ?? zero) as `0x${string}`;

  const { data: saleShareTok, isSuccess: isShareTokenSuccess } = useReadContract({
    address: saleAddr !== zero ? saleAddr : undefined,
    abi: primaryShareSaleErc20Abi,
    functionName: "shareToken",
    query: { enabled: saleAddr !== zero },
  });

  const onChainSale = useMemo(() => {
    if (!config || saleAddr === zero || !shareTokenAddress) return false;
    if (typeof saleShareTok !== "string") return false;
    return saleShareTok.toLowerCase() === shareTokenAddress.toLowerCase();
  }, [config, saleAddr, shareTokenAddress, saleShareTok]);

  const { data: pricePerShare } = useReadContract({
    address: onChainSale ? saleAddr : undefined,
    abi: primaryShareSaleErc20Abi,
    functionName: "pricePerShare",
    query: { enabled: onChainSale },
  });

  const { data: paymentTokRead } = useReadContract({
    address: onChainSale ? saleAddr : undefined,
    abi: primaryShareSaleErc20Abi,
    functionName: "paymentToken",
    query: { enabled: onChainSale },
  });

  const paymentToken = (typeof paymentTokRead === "string" ? paymentTokRead : zero) as `0x${string}`;

  const effectiveDecimals = config?.paymentDecimals ?? 6;
  const paySymbol = config?.paymentSymbol ?? "USDC";

  const quote: PrimarySaleQuote = useMemo(
    () => ({
      config,
      saleAddress: saleAddr,
      onChainSale,
      pricePerShare,
      paymentToken,
      effectiveDecimals,
      paySymbol,
      shareTokenFromSale: typeof saleShareTok === "string" ? (saleShareTok as `0x${string}`) : undefined,
      isShareTokenSuccess,
    }),
    [
      config,
      saleAddr,
      onChainSale,
      pricePerShare,
      paymentToken,
      effectiveDecimals,
      paySymbol,
      saleShareTok,
      isShareTokenSuccess,
    ],
  );

  return quote;
}
