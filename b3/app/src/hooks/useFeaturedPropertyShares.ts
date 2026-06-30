import { useMemo } from "react";
import { erc20Abi } from "viem";
import { useReadContracts } from "wagmi";
import {
  FEATURED_PROPERTY_IDS,
  getCatalogEntry,
} from "@bc/places-portfolio";
import { PLACES_CHAIN_ID } from "@/lib/places-config";

const DEMO_WHOLE_SUPPLY = 1_000_000n;

export type FeaturedShareStat = {
  propertyId: number;
  totalSupply: bigint | null;
  sharesLabel: string;
};

export function useFeaturedPropertyShares(): {
  stats: FeaturedShareStat[];
  loading: boolean;
} {
  const contracts = useMemo(
    () =>
      FEATURED_PROPERTY_IDS.map((id) => {
        const entry = getCatalogEntry(id);
        const token = entry?.shareToken as `0x${string}` | undefined;
        return token
          ? ({
              chainId: PLACES_CHAIN_ID,
              address: token,
              abi: erc20Abi,
              functionName: "totalSupply" as const,
            } as const)
          : null;
      }).filter(Boolean),
    [],
  );

  const { data, isPending } = useReadContracts({
    contracts: contracts as {
      chainId: number;
      address: `0x${string}`;
      abi: typeof erc20Abi;
      functionName: "totalSupply";
    }[],
    query: { staleTime: 60_000 },
  });

  const stats = useMemo(() => {
    return FEATURED_PROPERTY_IDS.map((propertyId, index) => {
      const row = data?.[index];
      const totalSupply =
        row?.status === "success" && typeof row.result === "bigint" ? row.result : null;
      const issued = totalSupply ?? 0n;
      const sharesLabel =
        totalSupply != null
          ? `${issued.toLocaleString("en-US")} / ${DEMO_WHOLE_SUPPLY.toLocaleString("en-US")}`
          : `${getCatalogEntry(propertyId)?.symbol ?? "OG"} · on-chain`;
      return { propertyId, totalSupply, sharesLabel };
    });
  }, [data]);

  return { stats, loading: isPending && !data };
}
