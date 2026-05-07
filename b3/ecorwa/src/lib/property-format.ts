/** Formats reference EUR value (field name legacy “Usd” from ogchain). */
export function formatPropertyValueEur(p: { illustrativePropertyValueUsd?: number }): string {
  const v = p.illustrativePropertyValueUsd;
  if (v == null) return "—";
  if (v >= 1_000_000) return `€${(v / 1e6).toFixed(1)}M`;
  return new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);
}

export function formatAnnualRentEur(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

/** Gross yield on illustrative reference value (USD field treated as EUR magnitude). */
export function getEstimatedYieldPercent(p: {
  illustrativePropertyValueUsd?: number;
  annualRentalIncomeEur: number;
}): number {
  const v = p.illustrativePropertyValueUsd;
  if (v == null || v <= 0) return 0;
  return (p.annualRentalIncomeEur / v) * 100;
}
