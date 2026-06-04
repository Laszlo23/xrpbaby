type EligibilityLike = {
  configured?: boolean;
  status?: string;
  canHoldRestrictedShares?: boolean;
  placesUrl?: string;
};

export function complianceStatusLabel(status: string | undefined): string {
  switch (status) {
    case "verified":
      return "verified";
    case "pending":
      return "pending review";
    case "revoked":
      return "revoked";
    case "none":
      return "not verified yet";
    case "unconfigured":
      return "registry not wired (dev)";
    default:
      return status ?? "unknown";
  }
}

export function complianceHint(eligibility: EligibilityLike): string {
  if (!eligibility.configured) {
    return "Set COMPLIANCE_REGISTRY_ADDRESS on the app server to enable Places share compliance checks (see docs/ECOSYSTEM_WALLETS.md).";
  }
  if (eligibility.canHoldRestrictedShares) {
    return "Eligible for restricted property shares on Places.";
  }
  if (eligibility.status === "pending") {
    return "KYC submitted — complete or refresh status on Places.";
  }
  if (eligibility.status === "none") {
    return `Complete verification on Places before holding restricted shares.`;
  }
  if (eligibility.status === "revoked") {
    return "Compliance revoked — contact support via Places.";
  }
  return "Verification may be required for tokenized property shares (not NFT marketplace or culture passes).";
}
