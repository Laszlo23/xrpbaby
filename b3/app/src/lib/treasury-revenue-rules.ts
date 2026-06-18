/** Published treasury revenue routing — manual until BccFeeRouter is deployed. */

export type TreasuryRevenueBucket = {
  id: string;
  label: string;
  percent: number;
  description: string;
};

export const TREASURY_REVENUE_RULES: TreasuryRevenueBucket[] = [
  {
    id: "treasury",
    label: "Treasury",
    percent: 40,
    description: "Protocol reserves held in Gnosis Safe on Base.",
  },
  {
    id: "buyback",
    label: "Buyback",
    percent: 30,
    description: "Market buybacks executed by multisig policy.",
  },
  {
    id: "builders",
    label: "Builders",
    percent: 20,
    description: "Culture Points rewards, Roots staking, and builder grants.",
  },
  {
    id: "burn",
    label: "Burn",
    percent: 10,
    description: "Permanent supply reduction to dead address.",
  },
];

export const TREASURY_SAFE_ADDRESS = "0xCe03F6E734cC48393Ce41b257E998c68b521EB5c" as const;
