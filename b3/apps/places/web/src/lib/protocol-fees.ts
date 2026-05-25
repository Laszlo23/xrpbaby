/**
 * Reference fee and policy parameters for the protocol (see docs/economics-fee-schedule.md).
 * On-chain fee collection may use different contracts; these values are the product "source of truth" for UI and disclosures.
 */
export const PROTOCOL_FEES = {
  /** Max primary issuance fee on integrated primary sales (basis points, 100 = 1%) */
  primaryIssuanceBpsMax: 500,
  /** Default assumption for documentation (bps) */
  primaryIssuanceBpsDefault: 250,
  /** Secondary AMM / router fee tier (bps) — must match deployed pool settings */
  secondaryTradingBpsMax: 100,
  secondaryTradingBpsDefault: 30,
  /** Optional operator SaaS (offchain, basis points of subscription) */
  operatorSaaSBpsMax: 0,
  /** Minimum onchain notice for fee parameter changes (days) */
  feeChangeNoticeDays: 7,
} as const;

export const TREASURY_POLICY = {
  /** Documented timelock / notice for material fee changes */
  timelockDescription: "Material fee increases use a public notice period (see feeChangeNoticeDays).",
  /** Where protocol fees should accrue in production */
  recommendedCustody: "Base Safe multisig with published signers",
} as const;

export const FOUNDER_VS_PROTOCOL = {
  companyEquity: "Founder and team compensation: salary, equity, and investor rounds are offchain (SAFE, priced round) and separate from property SPV returns.",
  protocolRevenue: "Protocol treasury: primary and secondary fees per the published schedule; not a claim on real-estate title.",
} as const;
