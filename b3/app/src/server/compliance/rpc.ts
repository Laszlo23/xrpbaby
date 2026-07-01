import { resolveBaseRpcUrl } from "@/server/rpc/resolve-base-rpc";

/** Base RPC for ComplianceRegistry reads — prefers Alchemy when configured. */
export function resolveComplianceRpc(): string {
  return resolveBaseRpcUrl();
}
