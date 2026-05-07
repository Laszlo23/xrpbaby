import { base, baseSepolia, b3Mainnet, b3Testnet, bsc } from "@/lib/chains";

export function explorerTxUrl(chainId: number, hash: string): string {
  const baseUrl = explorerTxBase(chainId);
  return `${baseUrl}${hash}`;
}

export function explorerAddressUrl(chainId: number, address: string): string {
  const baseUrl = explorerAddressBase(chainId);
  return `${baseUrl}${address}`;
}

function explorerTxBase(chainId: number): string {
  if (chainId === baseSepolia.id) return "https://sepolia.basescan.org/tx/";
  if (chainId === base.id) return "https://basescan.org/tx/";
  if (chainId === bsc.id) return "https://bscscan.com/tx/";
  if (chainId === b3Testnet.id) return "https://testnet-explorer.b3.fun/tx/";
  if (chainId === b3Mainnet.id) return "https://explorer.b3.fun/tx/";
  return "https://basescan.org/tx/";
}

function explorerAddressBase(chainId: number): string {
  if (chainId === baseSepolia.id) return "https://sepolia.basescan.org/address/";
  if (chainId === base.id) return "https://basescan.org/address/";
  if (chainId === bsc.id) return "https://bscscan.com/address/";
  if (chainId === b3Testnet.id) return "https://testnet-explorer.b3.fun/address/";
  if (chainId === b3Mainnet.id) return "https://explorer.b3.fun/address/";
  return "https://basescan.org/address/";
}
