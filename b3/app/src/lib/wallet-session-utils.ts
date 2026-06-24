import type { ConnectedWallet } from "@privy-io/react-auth";

export type WalletKind = "smart" | "external" | "unknown";

export function shortWalletAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function isPrivySmartWalletClientType(walletClientType?: string | null): boolean {
  return walletClientType === "privy" || walletClientType === "privy-v2";
}

export function walletKindFromClientType(walletClientType?: string | null): WalletKind {
  if (!walletClientType) return "unknown";
  if (isPrivySmartWalletClientType(walletClientType)) return "smart";
  return "external";
}

const EXTERNAL_LABELS: Record<string, string> = {
  metamask: "MetaMask",
  coinbase_wallet: "Coinbase Wallet",
  base_account: "Base Account",
  wallet_connect: "WalletConnect",
  detected_ethereum_wallets: "Browser wallet",
  brave_wallet: "Brave Wallet",
  rainbow: "Rainbow",
  phantom: "Phantom",
};

export function walletKindLabelFromClientType(walletClientType?: string | null): string {
  if (!walletClientType) return "Wallet";
  if (isPrivySmartWalletClientType(walletClientType)) return "Smart wallet";
  const key = walletClientType.toLowerCase();
  return EXTERNAL_LABELS[key] ?? walletClientType.replace(/_/g, " ");
}

export function resolveWalletDisplayLabel(input: {
  primaryName: string | null;
  address?: string;
  identityLoading?: boolean;
}): string {
  if (input.identityLoading) return "…";
  if (input.primaryName) return input.primaryName;
  if (input.address) return shortWalletAddress(input.address);
  return "…";
}

export function findEmbeddedSmartWallet(wallets: ConnectedWallet[]): ConnectedWallet | undefined {
  return wallets.find(
    (w) => w.type === "ethereum" && w.address && isPrivySmartWalletClientType(w.walletClientType),
  );
}

export function findWalletByAddress(
  wallets: ConnectedWallet[],
  address: string | undefined,
): ConnectedWallet | undefined {
  if (!address) return undefined;
  const needle = address.toLowerCase();
  return wallets.find((w) => w.address?.toLowerCase() === needle);
}

export function resolveStableSessionAddress(input: {
  liveAddress?: string;
  latchedAddress?: string;
  authenticated: boolean;
}): string | undefined {
  if (input.liveAddress) return input.liveAddress.toLowerCase();
  if (input.authenticated && input.latchedAddress) return input.latchedAddress.toLowerCase();
  return undefined;
}

export function resolveWasConnected(input: {
  authenticated: boolean;
  address?: string;
  latchedAddress?: string;
}): boolean {
  return input.authenticated && Boolean(input.address ?? input.latchedAddress);
}
