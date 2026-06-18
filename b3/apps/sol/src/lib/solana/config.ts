import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";

export function getSolanaNetwork(): WalletAdapterNetwork {
  const network = import.meta.env.VITE_SOLANA_NETWORK ?? "devnet";
  switch (network) {
    case "mainnet-beta":
      return WalletAdapterNetwork.Mainnet;
    case "testnet":
      return WalletAdapterNetwork.Testnet;
    case "devnet":
      return WalletAdapterNetwork.Devnet;
    default:
      return WalletAdapterNetwork.Devnet;
  }
}

export function getSolanaRpcUrl(): string {
  return import.meta.env.VITE_SOLANA_RPC_URL ?? clusterApiUrl(getSolanaNetwork());
}

export function getBccMintAddress(): string | undefined {
  const mint = import.meta.env.VITE_BCC_MINT;
  return mint && mint.length > 0 ? mint : undefined;
}

export function getExplorerUrl(signatureOrAddress: string, type: "tx" | "address" = "tx"): string {
  const network = import.meta.env.VITE_SOLANA_NETWORK ?? "devnet";
  const cluster = network === "mainnet-beta" ? "" : `?cluster=${network}`;
  const path = type === "tx" ? "tx" : "address";
  return `https://explorer.solana.com/${path}/${signatureOrAddress}${cluster}`;
}
