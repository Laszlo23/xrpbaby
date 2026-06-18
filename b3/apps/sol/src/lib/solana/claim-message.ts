export function buildClaimMessage(
  walletAddress: string,
  missionSlug: string,
  nonce: string,
): string {
  return `Building Culture Academy — Claim Reward\nWallet: ${walletAddress}\nMission: ${missionSlug}\nNonce: ${nonce}`;
}

export function buildLinkMemberMessage(
  email: string,
  walletAddress: string,
  nonce: string,
): string {
  return `RESET — Link Member\nEmail: ${email}\nWallet: ${walletAddress}\nNonce: ${nonce}`;
}

export function buildAnchorProofMessage(
  walletAddress: string,
  periodKey: string,
  contentHash: string,
  nonce: string,
): string {
  return `RESET — Anchor Proof\nWallet: ${walletAddress}\nPeriod: ${periodKey}\nHash: ${contentHash}\nNonce: ${nonce}`;
}
