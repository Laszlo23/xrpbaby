/**
 * Client-side helpers and shared types for the human-friendly explorer UI.
 * Types are re-exported (type-only) from the server modules so UI and API
 * never drift apart.
 */
import type { TxKind } from "@/server/explorer/interpret";

export type { AssetFlow, RiskFlag, TxActor, TxFacts, TxKind } from "@/server/explorer/interpret";
export type { AddressHolding, AddressOverview, AddressRecentTx } from "@/server/explorer/address";
export type { ExplorerFeed, FeedItem } from "@/server/explorer/feed";
export type { TxExplanationContent } from "@/server/explorer/explain";

export function shortAddress(address: string): string {
  if (address.length < 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const TX_KIND_LABELS: Record<TxKind, { label: string; emojiFree: string }> = {
  "native-transfer": { label: "ETH transfer", emojiFree: "Money moved" },
  "token-transfer": { label: "Token transfer", emojiFree: "Tokens moved" },
  "nft-transfer": { label: "Collectible transfer", emojiFree: "Collectible moved" },
  swap: { label: "Swap", emojiFree: "Tokens exchanged" },
  mint: { label: "Mint", emojiFree: "Something new created" },
  burn: { label: "Burn", emojiFree: "Tokens destroyed" },
  approval: { label: "Permission granted", emojiFree: "Spending permission" },
  "contract-deploy": { label: "Contract deployed", emojiFree: "New program published" },
  "contract-call": { label: "Contract interaction", emojiFree: "Program used" },
};
