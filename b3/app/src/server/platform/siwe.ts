import { SiweMessage } from "siwe";

import { verifySiweSignature } from "@bc/identity/server";

import {
  consumeNonceIfValid,
  createWalletAuthNonce,
  rememberNonce,
} from "@/server/world/nonce-store";

export { createWalletAuthNonce, rememberNonce };

export type SiweAuthInput = {
  address: string;
  message: string;
  signature: string;
};

export async function requireSiweAuth(
  input: SiweAuthInput,
): Promise<{ address: string } | { error: string; status: number }> {
  let verifiedAddress: string;
  try {
    verifiedAddress = await verifySiweSignature(input.message, input.signature);
  } catch {
    return { error: "invalid_signature", status: 401 };
  }
  if (verifiedAddress.toLowerCase() !== input.address.toLowerCase()) {
    return { error: "address_mismatch", status: 401 };
  }

  let siwe: SiweMessage;
  try {
    siwe = new SiweMessage(input.message);
  } catch {
    return { error: "invalid_message", status: 400 };
  }
  const nonce = siwe.nonce?.trim();
  if (!nonce || !consumeNonceIfValid(nonce)) {
    return { error: "nonce_invalid_or_expired", status: 401 };
  }

  return { address: verifiedAddress };
}

/** SIWE auth when the client sends message + signature only (address recovered from signature). */
export async function requireSiweAuthFromMessage(
  message: string,
  signature: string,
): Promise<{ address: string } | { error: string; status: number }> {
  let verifiedAddress: string;
  try {
    verifiedAddress = await verifySiweSignature(message, signature);
  } catch {
    return { error: "invalid_signature", status: 401 };
  }
  return requireSiweAuth({ address: verifiedAddress, message, signature });
}
