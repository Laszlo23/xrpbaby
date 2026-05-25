import { formatUnits } from "viem";

/** Convert ETH wei ticket price to equivalent BCD amount (integer scale, 18 decimals display). */
export function ethWeiToBcdAmountWei(ethWei: bigint, bcdPerWholeEth: bigint): bigint {
  if (bcdPerWholeEth <= 0n) return 0n;
  return (ethWei * bcdPerWholeEth) / 10n ** 18n;
}

/** Human-readable BCD amount from ETH wei using env ratio (18 decimals). */
export function formatEthWeiAsBcd(ethWei: bigint, bcdPerWholeEth: bigint): string {
  const bcdWei = ethWeiToBcdAmountWei(ethWei, bcdPerWholeEth);
  const s = formatUnits(bcdWei, 18);
  const n = Number(s);
  if (!Number.isFinite(n)) return s;
  if (n >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (n >= 1) return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
  return n.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

/** Preview BCD received for ETH amount (wei) at fixed rate. */
export function ethWeiToBcdPreview(ethWei: bigint, bcdPerWholeEth: bigint): bigint {
  return ethWeiToBcdAmountWei(ethWei, bcdPerWholeEth);
}
