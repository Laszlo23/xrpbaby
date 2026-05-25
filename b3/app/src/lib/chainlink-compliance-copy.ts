/** Shared compliance / Chainlink alignment copy for investor surfaces. */
export const chainlinkComplianceCopy = {
  headline: "Chainlink RWA alignment (in progress)",
  body:
    "Property share transfers use permissioned on-chain compliance (REOC profile D). DTA-style subscribe/redeem, NAV feeds, and Proof of Reserve gates are rolling out per our public compliance matrix. Play raffle drops are separate from tokenized property securities.",
  matrixHref: "https://github.com/buildingculture/b3/blob/main/docs/CHAINLINK_RWA_COMPLIANCE.md",
  placesHref: "https://buildingculture.capital/transparency",
  disclaimers: [
    "Not Chainlink ACE certified until partner sandbox + audit evidence is published.",
    "PoR attests declared backing — not government land registry title.",
    "Illustrative ROI on this page is not NAV or investment advice.",
  ],
} as const;
