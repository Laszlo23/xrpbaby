import {
  quidliApiBase,
  quidliApiKey,
  quidliRewardChainId,
  quidliRewardTokenAddress,
  quidliSendPath,
} from "@/server/quidli/env";
import type { QuidliPlatform } from "@/server/quidli/policy";

export type QuidliSendParams = {
  platform: QuidliPlatform;
  handle: string;
  amountWei: string;
  memo?: string;
  idempotencyKey: string;
};

export type QuidliSendResult =
  | { ok: true; quidliRef: string | null; status: "submitted"; raw: unknown }
  | { ok: false; error: string; detail?: string };

function authHeaders(apiKey: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${apiKey}`,
    "x-quidli-api-key": apiKey,
  };
}

function buildSendBody(params: QuidliSendParams): Record<string, unknown> {
  return {
    platform: params.platform,
    recipient: params.handle,
    username: params.handle,
    handle: params.handle,
    token_address: quidliRewardTokenAddress(),
    tokenAddress: quidliRewardTokenAddress(),
    chain_id: quidliRewardChainId(),
    chainId: quidliRewardChainId(),
    amount: params.amountWei,
    amount_wei: params.amountWei,
    memo: params.memo,
    idempotency_key: params.idempotencyKey,
    idempotencyKey: params.idempotencyKey,
  };
}

function extractRef(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  for (const k of ["id", "reference", "ref", "delivery_id", "deliveryId"]) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  const nested = o.data;
  if (nested && typeof nested === "object") {
    return extractRef(nested);
  }
  return null;
}

export async function quidliSendToSocial(params: QuidliSendParams): Promise<QuidliSendResult> {
  const apiKey = quidliApiKey();
  if (!apiKey) {
    return { ok: false, error: "not_configured" };
  }

  const base = quidliApiBase();
  const primaryPath = quidliSendPath();
  const fallbackPaths = ["/v1/drops", "/v1/tips", "/v1/connect/drops"];
  const paths = [primaryPath, ...fallbackPaths.filter((p) => p !== primaryPath)];

  const body = buildSendBody(params);
  let lastDetail: string | undefined;

  for (const path of paths) {
    try {
      const res = await fetch(`${base}${path}`, {
        method: "POST",
        headers: authHeaders(apiKey),
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
      });
      const text = await res.text();
      let parsed: unknown = null;
      if (text.trim()) {
        try {
          parsed = JSON.parse(text) as unknown;
        } catch {
          parsed = { raw: text.slice(0, 2000) };
        }
      }

      if (res.ok) {
        return {
          ok: true,
          quidliRef: extractRef(parsed),
          status: "submitted",
          raw: parsed,
        };
      }

      lastDetail = `HTTP ${res.status}: ${text.slice(0, 500)}`;
      if (res.status !== 404 && res.status !== 405) {
        return { ok: false, error: `http_${res.status}`, detail: lastDetail };
      }
    } catch (err) {
      lastDetail = err instanceof Error ? err.message : String(err);
    }
  }

  return {
    ok: false,
    error: "api_unreachable_use_dashboard",
    detail: lastDetail,
  };
}
