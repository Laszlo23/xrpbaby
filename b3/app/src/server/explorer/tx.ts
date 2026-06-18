/**
 * Transaction lookup orchestrator: Blockscout first, raw RPC fallback.
 */
import { BCC_CHAIN_ID } from "@bc/bcc-kit";

import {
  fetchBsTransaction,
  fetchBsTxTokenTransfers,
  fetchTxFallbackRpc,
} from "@/server/explorer/blockscout";
import { interpretTransaction, type TxFacts } from "@/server/explorer/interpret";
import { normalizeExplorerQuery } from "@/lib/explorer-query";

export type TxLookupResult =
  | { ok: true; facts: TxFacts; source: "blockscout" | "rpc" }
  | { ok: false; error: "not_found" | "unavailable" };

export async function getTxFacts(hash: string): Promise<TxLookupResult> {
  const tx = await fetchBsTransaction(hash);
  if (tx) {
    const transfers = tx.token_transfers?.length ? [] : await fetchBsTxTokenTransfers(hash);
    return {
      ok: true,
      facts: interpretTransaction(tx, transfers, BCC_CHAIN_ID),
      source: "blockscout",
    };
  }

  const fallback = await fetchTxFallbackRpc(hash);
  if (fallback) {
    return { ok: true, facts: interpretTransaction(fallback, [], BCC_CHAIN_ID), source: "rpc" };
  }
  return { ok: false, error: "not_found" };
}

export function isTxHash(input: string): boolean {
  return /^0x[0-9a-f]{64}$/.test(normalizeExplorerQuery(input));
}

export function isEvmAddress(input: string): boolean {
  return /^0x[0-9a-f]{40}$/.test(normalizeExplorerQuery(input));
}
