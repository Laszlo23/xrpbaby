/** Map wagmi/viem wallet errors to user-facing copy (Brave Shields, wrong chain, rejections). */
export function formatWalletWriteError(err: unknown): string {
  const msg =
    err instanceof Error ? err.message : typeof err === "string" ? err : "Transaction failed";

  const lower = msg.toLowerCase();

  if (
    lower.includes("user rejected") ||
    lower.includes("user denied") ||
    lower.includes("rejected the request")
  ) {
    return "Transaction rejected in your wallet.";
  }

  if (lower.includes("wrong network") || lower.includes("chain mismatch")) {
    return "Wrong network — switch to Base in your wallet.";
  }

  if (lower.includes("insufficient funds")) {
    return "Insufficient ETH for gas on Base.";
  }

  if (lower.includes("popup") || lower.includes("blocked") || lower.includes("not allowed")) {
    return "Wallet popup blocked — allow popups for this site (Brave Shields → allow wallet).";
  }

  if (lower.includes("connector not connected") || lower.includes("not connected")) {
    return "Wallet not connected — reconnect and try again.";
  }

  if (lower.includes("prior")) {
    return "Mint the previous chapter first, or buy a Skip Key on chapter 1.";
  }

  if (lower.includes("payment") || lower.includes("insufficient payment")) {
    return "Incorrect mint price — refresh and try again.";
  }

  return msg.length > 160 ? `${msg.slice(0, 157)}…` : msg;
}
