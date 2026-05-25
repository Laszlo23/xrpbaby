const WAD = 10n ** 18n;
const BPS = 10_000n;

export function mulDivCeil(a: bigint, b: bigint, denominator: bigint): bigint {
  if (denominator === 0n) throw new Error("mulDivCeil: zero denominator");
  return (a * b + denominator - 1n) / denominator;
}

/** Mirrors BCDFixedPriceSale `buy`: base ceil + fee ceil in payment asset smallest units. */
export function saleBuyerPaysWei(
  bcdAmountWei: bigint,
  paymentPerWholeBcd: bigint,
  feeBps: bigint,
): { baseWei: bigint; feeWei: bigint; totalWei: bigint } {
  const baseWei = mulDivCeil(bcdAmountWei, paymentPerWholeBcd, WAD);
  const feeWei = mulDivCeil(baseWei, feeBps, BPS);
  return { baseWei, feeWei, totalWei: baseWei + feeWei };
}
