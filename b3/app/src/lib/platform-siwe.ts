import { SiweMessage } from "siwe";
import type { Address } from "viem";

import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { getPublicAppOrigin } from "@/lib/app-origin";

async function fetchPlatformSiweNonce(): Promise<string> {
  const res = await fetch("/api/platform/siwe-nonce", { cache: "no-store" });
  if (!res.ok) throw new Error("siwe_nonce_unavailable");
  const data = (await res.json()) as { nonce?: string };
  if (!data.nonce) throw new Error("siwe_nonce_missing");
  return data.nonce;
}

export async function buildPlatformSiweMessage(
  address: Address,
  chainId: number,
  statement = `Create your pass on ${BRAND_DISPLAY_NAME}.`,
): Promise<{ prepared: string; nonce: string }> {
  const nonce = await fetchPlatformSiweNonce();
  const message = new SiweMessage({
    domain: typeof window !== "undefined" ? window.location.host : "localhost",
    address,
    statement,
    uri: getPublicAppOrigin(),
    version: "1",
    chainId,
    nonce,
  });
  return { prepared: message.prepareMessage(), nonce: message.nonce };
}
