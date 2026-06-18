import { buildXrplLinkProofTransaction } from "@/lib/xrpl-link-proof";

export type CrossmarkSdk = {
  async: { detect: () => Promise<boolean> };
  methods: {
    signInAndWait: () => Promise<{ response: { data: { address?: string } } }>;
    signAndWait: (tx: Record<string, unknown>) => Promise<{
      response: { data: { txBlob?: string } };
    }>;
  };
};

declare global {
  interface Window {
    crossmark?: unknown;
  }
}

export async function loadCrossmarkSdk(): Promise<CrossmarkSdk | null> {
  if (typeof window === "undefined") return null;
  try {
    const mod = await import("@crossmarkio/sdk");
    const sdk = (mod.default ?? mod) as CrossmarkSdk;
    const detected = await sdk.async.detect();
    return detected ? sdk : null;
  } catch {
    return null;
  }
}

export async function crossmarkSignIn(): Promise<string | null> {
  const sdk = await loadCrossmarkSdk();
  if (!sdk) return null;
  const { response } = await sdk.methods.signInAndWait();
  return response.data.address ?? null;
}

export async function crossmarkSignLinkProof(
  address: string,
  nonce: string,
): Promise<string | null> {
  const sdk = await loadCrossmarkSdk();
  if (!sdk) return null;
  const tx = buildXrplLinkProofTransaction(address, nonce);
  const { response } = await sdk.methods.signAndWait(tx);
  return response.data.txBlob ?? null;
}

export function crossmarkInstalled(): boolean {
  return typeof window !== "undefined" && Boolean(window.crossmark);
}
