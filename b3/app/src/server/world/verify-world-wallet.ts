import { verifySiweMessage } from "@worldcoin/minikit-js/siwe";

import { consumeNonceIfValid } from "@/server/world/nonce-store";

export type WalletVerifyBody = {
  nonce?: string;
  /** Successful `MiniKit.walletAuth` payload / MiniKit wallet-auth result data */
  walletAuth?: unknown;
};

/** Minimal SIWE result shape used by this handler (tests may inject narrow mocks). */
export type VerifySiweFn = (
  walletAuth: Parameters<typeof verifySiweMessage>[0],
  nonce: string,
) => PromiseLike<{
  isValid: boolean;
  siweMessageData?: { address?: string; chain_id?: number } | null;
}>;

export type VerifyWorldWalletDeps = {
  verifySiwe?: VerifySiweFn;
};

export async function verifyWorldWalletAuthJson(
  body: unknown,
  deps?: VerifyWorldWalletDeps,
): Promise<{
  ok: boolean;
  status: number;
  json: Record<string, unknown>;
}> {
  if (!body || typeof body !== "object") {
    return { ok: false, status: 400, json: { ok: false, error: "invalid_json" } };
  }
  const o = body as WalletVerifyBody;
  const nonce = typeof o.nonce === "string" ? o.nonce.trim() : "";
  if (!nonce || nonce.length < 8) {
    return { ok: false, status: 400, json: { ok: false, error: "invalid_nonce" } };
  }
  if (!consumeNonceIfValid(nonce)) {
    return { ok: false, status: 401, json: { ok: false, error: "nonce_invalid_or_expired" } };
  }
  const walletAuth = o.walletAuth;
  if (walletAuth === undefined || walletAuth === null) {
    return { ok: false, status: 400, json: { ok: false, error: "missing_wallet_auth" } };
  }

  const verifySiwe = deps?.verifySiwe ?? verifySiweMessage;

  try {
    const { isValid, siweMessageData } = await verifySiwe(
      walletAuth as Parameters<typeof verifySiweMessage>[0],
      nonce,
    );
    if (!isValid || !siweMessageData?.address) {
      return { ok: false, status: 401, json: { ok: false, error: "siwe_invalid" } };
    }
    return {
      ok: true,
      status: 200,
      json: {
        ok: true,
        address: siweMessageData.address,
        chainId: siweMessageData.chain_id,
      },
    };
  } catch {
    return { ok: false, status: 401, json: { ok: false, error: "siwe_verify_failed" } };
  }
}
