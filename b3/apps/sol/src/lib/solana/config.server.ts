import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

export function getSolanaRpcUrlServer(): string {
  return process.env.VITE_SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
}

export function getBccMintAddressServer(): string | undefined {
  const mint = process.env.VITE_BCC_MINT;
  return mint && mint.length > 0 ? mint : undefined;
}

export function getTreasuryKeypair(): Keypair {
  const secret = process.env.TREASURY_SECRET_KEY;
  if (!secret) {
    throw new Error("TREASURY_SECRET_KEY is not configured");
  }

  try {
    const parsed = JSON.parse(secret) as number[];
    if (Array.isArray(parsed)) {
      return Keypair.fromSecretKey(Uint8Array.from(parsed));
    }
  } catch {
    // not JSON — try base58
  }

  return Keypair.fromSecretKey(bs58.decode(secret));
}
