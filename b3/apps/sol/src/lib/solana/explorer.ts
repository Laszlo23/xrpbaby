export function getSolanaExplorerTxUrl(
  signature: string,
  network: string = import.meta.env.VITE_SOLANA_NETWORK ?? "devnet",
): string {
  const base = `https://explorer.solana.com/tx/${signature}`;
  if (network === "mainnet-beta" || network === "mainnet") return base;
  return `${base}?cluster=${network}`;
}
