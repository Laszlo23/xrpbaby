import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/** Base RPC for ComplianceRegistry reads — prefers Alchemy when public RPC is rate-limited. */
export function resolveComplianceRpc(): string {
  const fromEnv = process.env.VITE_BASE_RPC_URL?.trim() || process.env.BASE_RPC_URL?.trim();
  if (fromEnv && !fromEnv.includes("mainnet.base.org")) return fromEnv;
  try {
    const identityEnv = resolve(process.cwd(), "../apps/identity/.env");
    const key = readFileSync(identityEnv, "utf8")
      .match(/^ALCHEMY_API_KEY=(.+)/m)?.[1]
      ?.trim();
    if (key) return `https://base-mainnet.g.alchemy.com/v2/${key}`;
  } catch {
    /* ignore */
  }
  return fromEnv || "https://mainnet.base.org";
}
