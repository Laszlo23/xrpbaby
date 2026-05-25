import type { PrimarySalesFile } from "@/lib/primary-sales-types";
import rawPrimarySales from "@/data/primary-sales.json";

const fileSales = rawPrimarySales as PrimarySalesFile;

const zero = "0x0000000000000000000000000000000000000000" as const;

export type PrimarySaleEntry = PrimarySalesFile["sales"][number];

function loadMergedSales(): PrimarySaleEntry[] {
  const base = [...fileSales.sales];
  const extra =
    typeof process.env.NEXT_PUBLIC_PRIMARY_SALES_JSON === "string"
      ? process.env.NEXT_PUBLIC_PRIMARY_SALES_JSON.trim()
      : "";
  if (extra) {
    try {
      const parsed = JSON.parse(extra) as PrimarySalesFile;
      if (parsed.sales?.length) base.push(...parsed.sales);
    } catch {
      // ignore malformed env in production builds
    }
  }
  return base.filter((s) => s.saleAddress?.toLowerCase() !== zero);
}

const merged = loadMergedSales();

/**
 * Issuer primary sale (`PrimaryShareSaleERC20`) for a property when configured.
 * Addresses come from [`web/src/data/primary-sales.json`] and optional `NEXT_PUBLIC_PRIMARY_SALES_JSON`.
 */
export function getPrimarySaleForProperty(
  propertyId: bigint,
  chainId: number,
): PrimarySaleEntry | undefined {
  const idStr = propertyId.toString();
  return merged.find((s) => s.propertyId === idStr && s.chainId === chainId);
}
