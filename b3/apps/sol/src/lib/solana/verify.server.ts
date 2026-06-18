import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import nacl from "tweetnacl";

import { buildClaimMessage } from "./claim-message";

export function verifyWalletMessage(
  message: string,
  walletAddress: string,
  signatureBase58: string,
): boolean {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const signature = bs58.decode(signatureBase58);
    const publicKey = new PublicKey(walletAddress);
    return nacl.sign.detached.verify(messageBytes, signature, publicKey.toBytes());
  } catch {
    return false;
  }
}

export function verifyClaimSignature(
  walletAddress: string,
  missionSlug: string,
  nonce: string,
  signatureBase58: string,
): boolean {
  const message = buildClaimMessage(walletAddress, missionSlug, nonce);
  return verifyWalletMessage(message, walletAddress, signatureBase58);
}
