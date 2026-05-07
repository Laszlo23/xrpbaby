import type { EnvLike } from "@bc/contracts-sdk";

/** Process env as contracts-sdk `EnvLike` (VITE_* + server names). */
export function contractsEnv(): EnvLike {
  return { ...process.env } as EnvLike;
}

export function agentsPaused(): boolean {
  const v = process.env.AGENTS_PAUSED?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

/** When false, chain writes are logged only (no broadcast). */
export function econLive(): boolean {
  const v = process.env.ECON_LIVE?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export function databaseUrl(): string | undefined {
  return process.env.DATABASE_URL?.trim();
}

export function strapiUrl(): string | undefined {
  return process.env.STRAPI_URL?.trim() || process.env.AGENT_STRAPI_URL?.trim();
}

export function strapiApiToken(): string | undefined {
  return process.env.STRAPI_API_TOKEN?.trim() || process.env.AGENT_STRAPI_API_TOKEN?.trim();
}

export function slackWebhookUrl(): string | undefined {
  return process.env.SLACK_WEBHOOK_URL?.trim() || process.env.AGENT_SLACK_WEBHOOK_URL?.trim();
}

export function baseRpcUrl(): string {
  return (
    process.env.AGENT_BASE_RPC_URL?.trim() ||
    process.env.BASE_RPC_URL?.trim() ||
    process.env.VITE_BASE_RPC_URL?.trim() ||
    "https://mainnet.base.org"
  );
}

export function chainId(): number {
  const n = Number(process.env.AGENT_CHAIN_ID ?? process.env.VITE_EVM_CHAIN_ID ?? "8453");
  return Number.isFinite(n) ? n : 8453;
}

/** Hex private key for `ags-distributor-1` (0x…). Prefer decrypting from file in production. */
export function agsDistributorPrivateKey(): `0x${string}` | undefined {
  const k = process.env.AGENT_AGS_DISTRIBUTOR_PRIVATE_KEY?.trim();
  if (!k || !/^0x[0-9a-fA-F]{64}$/.test(k)) return undefined;
  return k as `0x${string}`;
}
