"use client";

import { useMemo } from "react";
import { zeroAddress } from "viem";
import { useReadContract, useReadContracts } from "wagmi";
import { erc20Abi, registryAbi, shareFactoryAbi } from "@/lib/contracts";
import { areListingsConfigured, getListingsChainId } from "@/lib/listings-config";
import { getProtocolAddresses } from "@/lib/protocol-addresses";
import {
  DEMO_PROPERTY_DETAILS,
  getDemoListingFallbackRows,
  type DemoPropertyDetail,
} from "@/lib/demo-properties";

const listingsChainId = getListingsChainId();

/** TanStack Query options for on-chain listing data (stable until next deploy/seed). */
const listingQueryOpts = {
  staleTime: 60_000,
  gcTime: 300_000,
} as const;

export type PropertyShareRow = {
  id: bigint;
  tokenAddress: `0x${string}`;
  name: string;
  symbol: string;
  demo?: DemoPropertyDetail;
};

export function usePropertyShareList() {
  const { registry, shareFactory } = useMemo(() => getProtocolAddresses(), []);
  const unset = !areListingsConfigured();

  const { data: nextId, isPending: isPendingNextId } = useReadContract({
    chainId: listingsChainId,
    address: registry,
    abi: registryAbi,
    functionName: "nextPropertyId",
    query: { enabled: !unset, ...listingQueryOpts },
  });

  const propertyIds = useMemo(() => {
    if (!nextId || nextId <= 1n) return [] as bigint[];
    const n = Number(nextId - 1n);
    if (!Number.isFinite(n) || n <= 0 || n > 64) return [];
    return Array.from({ length: n }, (_, i) => BigInt(i + 1));
  }, [nextId]);

  const factoryReads = useMemo(
    () =>
      propertyIds.map((id) => ({
        chainId: listingsChainId,
        address: shareFactory,
        abi: shareFactoryAbi,
        functionName: "tokenByPropertyId" as const,
        args: [id],
      })),
    [propertyIds, shareFactory],
  );

  const { data: tokenRows, isPending: isPendingFactory } = useReadContracts({
    contracts: factoryReads,
    query: {
      enabled: !unset && factoryReads.length > 0,
      ...listingQueryOpts,
    },
  });

  const pairs = useMemo(() => {
    if (!tokenRows?.length || !propertyIds.length) return [];
    const out: { id: bigint; addr: `0x${string}` }[] = [];
    tokenRows.forEach((row, i) => {
      const id = propertyIds[i];
      if (row.status !== "success" || !row.result || row.result === zeroAddress) return;
      out.push({ id, addr: row.result as `0x${string}` });
    });
    return out;
  }, [tokenRows, propertyIds]);

  const erc20Reads = useMemo(
    () =>
      pairs.flatMap((p) => [
        {
          chainId: listingsChainId,
          address: p.addr,
          abi: erc20Abi,
          functionName: "name" as const,
        },
        {
          chainId: listingsChainId,
          address: p.addr,
          abi: erc20Abi,
          functionName: "symbol" as const,
        },
      ]),
    [pairs],
  );

  const { data: erc20Rows, isPending: isPendingErc20 } = useReadContracts({
    contracts: erc20Reads,
    query: { enabled: erc20Reads.length > 0, ...listingQueryOpts },
  });

  const chainRows: PropertyShareRow[] = useMemo(() => {
    if (!erc20Rows?.length || !pairs.length) return [];
    return pairs.map((p, i) => {
      const nameResult = erc20Rows[i * 2];
      const symResult = erc20Rows[i * 2 + 1];
      const name =
        nameResult?.status === "success" && typeof nameResult.result === "string"
          ? nameResult.result
          : "PropertyShare";
      const symbol =
        symResult?.status === "success" && typeof symResult.result === "string"
          ? symResult.result
          : "???";
      const key = Number(p.id);
      const demo = DEMO_PROPERTY_DETAILS[key];
      return {
        id: p.id,
        tokenAddress: p.addr,
        name,
        symbol,
        demo,
      };
    });
  }, [erc20Rows, pairs]);

  const loadingFactoryBatch = factoryReads.length > 0 && isPendingFactory;
  const loadingErc20Batch = erc20Reads.length > 0 && isPendingErc20;
  const loading =
    unset || isPendingNextId || loadingFactoryBatch || loadingErc20Batch;

  /** Merged rows for the discovery grid: on-chain tokens when present; otherwise demo previews if registry is still empty. */
  const rows: PropertyShareRow[] = useMemo(() => {
    if (chainRows.length > 0) return chainRows;
    if (unset || loading) return [];
    if (nextId === undefined) return [];
    if (nextId > 1n) return [];
    return getDemoListingFallbackRows();
  }, [chainRows, unset, loading, nextId]);

  const isDemoFallback =
    chainRows.length === 0 && rows.length > 0 && nextId !== undefined && nextId <= 1n;

  return {
    unset,
    nextPropertyId: nextId,
    rows,
    chainRows,
    loading,
    isDemoFallback,
    propertyIds,
  };
}
