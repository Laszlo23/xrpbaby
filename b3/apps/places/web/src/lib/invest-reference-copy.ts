import type { DemoPropertyDetail } from "@/lib/demo-properties";

/**
 * Invest page copy that is not on-chain. Issuer terms and offering documents always control.
 * Defaults apply when a property has no `liquidityRulesBullets` in listing metadata.
 */
export const LIQUIDITY_RULES_REFERENCE_DISCLAIMER =
  "Reference framing only — not a contract. Lock, buyback, and secondary rules follow the issuer’s offering documents and on-chain programs when deployed. Verify with counsel and the data room.";

export const DEFAULT_LIQUIDITY_RULE_BULLETS = [
  "Investment lock period — e.g. 30 days after purchase (issuer-specific; verify program docs).",
  "Sell / buyback request cooldown — e.g. 7 days before a processed cycle (not guaranteed availability).",
  "Buyback capacity — e.g. up to a fraction of treasury per cycle (issuer caps apply).",
  "Secondary trading — available when liquidity pools exist and ComplianceRegistry permits transfers.",
];

export function getLiquidityRulesBullets(demo: DemoPropertyDetail | undefined): string[] {
  if (demo?.liquidityRulesBullets && demo.liquidityRulesBullets.length > 0) {
    return demo.liquidityRulesBullets;
  }
  return DEFAULT_LIQUIDITY_RULE_BULLETS;
}

const RULE_LABELS = [
  "Minimum purchase",
  "Lock period",
  "Sell / buyback cooldown",
  "Buyback capacity",
  "Secondary trading",
] as const;

export type InvestmentRuleRow = { label: string; detail: string };

/** Maps liquidity bullets into labeled rows for the investment rules grid. */
export function getInvestmentRuleRows(demo: DemoPropertyDetail | undefined): InvestmentRuleRow[] {
  const bullets = getLiquidityRulesBullets(demo);
  return bullets.map((detail, i) => ({
    label: RULE_LABELS[i] ?? `Rule ${i + 1}`,
    detail,
  }));
}
