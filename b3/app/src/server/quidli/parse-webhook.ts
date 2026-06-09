import type { QuidliPlatform } from "@/server/quidli/policy";
import { normalizeQuidliPlatform } from "@/server/quidli/policy";

export type ParsedQuidliWebhook = {
  eventId: string;
  eventType: string;
  platform: QuidliPlatform | null;
  handle: string | null;
  amountWei: string | null;
  tokenAddress: string | null;
  chainId: number | null;
  status: "completed" | "failed" | "pending" | "unknown";
  quidliRef: string | null;
  taskSlug: string | null;
  walletId: string | null;
  raw: Record<string, unknown>;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function pickString(obj: Record<string, unknown>, ...keys: string[]): string | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }
  return null;
}

function pickNestedString(
  obj: Record<string, unknown>,
  path: string[],
): string | null {
  let cur: unknown = obj;
  for (const key of path) {
    const rec = asRecord(cur);
    if (!rec) return null;
    cur = rec[key];
  }
  return typeof cur === "string" && cur.trim() ? cur.trim() : null;
}

function inferStatus(eventType: string, payload: Record<string, unknown>): ParsedQuidliWebhook["status"] {
  const t = eventType.toLowerCase();
  const statusField = pickString(payload, "status", "delivery_status", "state")?.toLowerCase();
  if (t.includes("failed") || statusField === "failed" || statusField === "error") return "failed";
  if (
    t.includes("completed") ||
    t.includes("delivered") ||
    t.includes("success") ||
    statusField === "completed" ||
    statusField === "delivered"
  ) {
    return "completed";
  }
  if (t.includes("pending") || statusField === "pending" || statusField === "processing") {
    return "pending";
  }
  return "unknown";
}

export function parseQuidliWebhook(payload: unknown): ParsedQuidliWebhook | null {
  const root = asRecord(payload);
  if (!root) return null;

  const data = asRecord(root.data) ?? root;
  const eventType =
    pickString(root, "type", "event", "event_type", "name") ||
    pickString(data, "type", "event", "event_type", "name") ||
    "quidli.webhook";

  const eventId =
    pickString(root, "id", "event_id", "eventId") ||
    pickString(data, "id", "event_id", "eventId", "delivery_id", "deliveryId") ||
    `hash:${JSON.stringify(root).slice(0, 120)}`;

  const platformRaw =
    pickString(data, "platform", "network", "social_platform") ||
    pickString(root, "platform", "network");
  const platform = platformRaw ? normalizeQuidliPlatform(platformRaw) : null;

  const handle =
    pickString(data, "handle", "username", "recipient", "to", "user") ||
    pickString(root, "handle", "username", "recipient") ||
    pickNestedString(data, ["recipient", "username"]) ||
    pickNestedString(data, ["user", "username"]);

  const amountWei =
    pickString(data, "amount", "amount_wei", "amountWei", "value") ||
    pickString(root, "amount", "amount_wei", "amountWei");

  const tokenAddress =
    pickString(data, "token_address", "tokenAddress", "token") ||
    pickNestedString(data, ["token", "address"]) ||
    pickString(root, "token_address", "tokenAddress");

  const chainRaw = pickString(data, "chain_id", "chainId") || pickString(root, "chain_id", "chainId");
  const chainId = chainRaw ? Number(chainRaw) : null;

  const quidliRef =
    pickString(data, "reference", "ref", "delivery_id", "id") ||
    pickString(root, "reference", "ref");

  const taskSlug =
    pickString(data, "task_slug", "taskSlug", "memo")?.match(/task:([a-z0-9_-]+)/i)?.[1] ??
    pickString(data, "task_slug", "taskSlug");

  const walletId = pickString(data, "wallet_id", "walletId");

  return {
    eventId,
    eventType,
    platform,
    handle,
    amountWei,
    tokenAddress,
    chainId: chainId != null && Number.isFinite(chainId) ? chainId : null,
    status: inferStatus(eventType, data),
    quidliRef,
    taskSlug,
    walletId,
    raw: root,
  };
}
