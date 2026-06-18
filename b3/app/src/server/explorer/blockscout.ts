/**
 * Typed Blockscout API v2 fetchers (Base mainnet by default).
 *
 * Blockscout returns decoded method names, token transfers, and USD exchange
 * rates, which does most of the heavy lifting for the human-friendly explorer.
 * All fetchers return `null` / `[]` on failure — callers degrade gracefully.
 */
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

export type BsParty = {
  hash: string;
  name?: string | null;
  is_contract?: boolean;
  is_verified?: boolean | null;
  ens_domain_name?: string | null;
};

export type BsTokenInfo = {
  address?: string | null;
  address_hash?: string | null;
  symbol?: string | null;
  name?: string | null;
  decimals?: string | null;
  type?: string | null;
  exchange_rate?: string | null;
  icon_url?: string | null;
};

export type BsTokenTransfer = {
  from: BsParty;
  to: BsParty;
  token: BsTokenInfo;
  total?: { value?: string | null; decimals?: string | null; token_id?: string | null } | null;
  transaction_hash?: string;
  timestamp?: string | null;
  type?: string;
  log_index?: number | string;
};

export type BsDecodedInput = {
  method_call?: string | null;
  method_id?: string | null;
  parameters?: Array<{ name?: string; type?: string; value?: unknown }> | null;
};

export type BsTransaction = {
  hash: string;
  status?: "ok" | "error" | null;
  result?: string | null;
  method?: string | null;
  from: BsParty;
  to?: BsParty | null;
  created_contract?: BsParty | null;
  value: string;
  fee?: { type?: string; value?: string | null } | null;
  gas_used?: string | null;
  gas_price?: string | null;
  block_number?: number | null;
  block?: number | null;
  timestamp?: string | null;
  decoded_input?: BsDecodedInput | null;
  token_transfers?: BsTokenTransfer[] | null;
  tx_types?: string[] | null;
  transaction_types?: string[] | null;
  raw_input?: string | null;
  exchange_rate?: string | null;
  revert_reason?: { raw?: string } | string | null;
  confirmations?: number | null;
};

export type BsAddressInfo = {
  hash: string;
  coin_balance?: string | null;
  is_contract?: boolean;
  is_verified?: boolean | null;
  name?: string | null;
  ens_domain_name?: string | null;
  exchange_rate?: string | null;
  creation_transaction_hash?: string | null;
  token?: BsTokenInfo | null;
};

export type BsTokenBalance = {
  token: BsTokenInfo;
  value?: string | null;
  token_id?: string | null;
};

export function blockscoutBaseUrl(): string {
  return (process.env.EXPLORER_BLOCKSCOUT_URL?.trim() || "https://base.blockscout.com").replace(
    /\/$/,
    "",
  );
}

async function bsGet<T>(path: string, timeoutMs = 12_000): Promise<T | null> {
  try {
    const res = await fetch(`${blockscoutBaseUrl()}/api/v2${path}`, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchBsTransaction(hash: string): Promise<BsTransaction | null> {
  return bsGet<BsTransaction>(`/transactions/${hash}`);
}

export async function fetchBsTxTokenTransfers(hash: string): Promise<BsTokenTransfer[]> {
  const data = await bsGet<{ items?: BsTokenTransfer[] }>(`/transactions/${hash}/token-transfers`);
  return data?.items ?? [];
}

export async function fetchBsAddress(address: string): Promise<BsAddressInfo | null> {
  return bsGet<BsAddressInfo>(`/addresses/${address}`);
}

export async function fetchBsAddressTransactions(address: string): Promise<BsTransaction[]> {
  const data = await bsGet<{ items?: BsTransaction[] }>(`/addresses/${address}/transactions`);
  return data?.items ?? [];
}

export async function fetchBsAddressTokenBalances(address: string): Promise<BsTokenBalance[]> {
  const data = await bsGet<BsTokenBalance[] | { items?: BsTokenBalance[] }>(
    `/addresses/${address}/token-balances`,
  );
  if (Array.isArray(data)) return data;
  return data?.items ?? [];
}

export async function fetchBsTokenTransfers(tokenAddress: string): Promise<BsTokenTransfer[]> {
  const data = await bsGet<{ items?: BsTokenTransfer[] }>(`/tokens/${tokenAddress}/transfers`);
  return data?.items ?? [];
}

// ---------------------------------------------------------------------------
// viem RPC fallback — minimal tx data when Blockscout is unavailable.
// ---------------------------------------------------------------------------

function makeBaseRpcClient() {
  const url = process.env.BASE_RPC_URL?.trim() || "https://mainnet.base.org";
  return createPublicClient({ chain: base, transport: http(url) });
}

let rpcClient: ReturnType<typeof makeBaseRpcClient> | null = null;

function getBaseRpcClient(): ReturnType<typeof makeBaseRpcClient> {
  if (!rpcClient) rpcClient = makeBaseRpcClient();
  return rpcClient;
}

/** Minimal Blockscout-shaped tx built from raw RPC data (no decoding, no USD). */
export async function fetchTxFallbackRpc(hash: string): Promise<BsTransaction | null> {
  try {
    const client = getBaseRpcClient();
    const [tx, receipt] = await Promise.all([
      client.getTransaction({ hash: hash as `0x${string}` }),
      client.getTransactionReceipt({ hash: hash as `0x${string}` }).catch(() => null),
    ]);
    if (!tx) return null;
    const block = receipt
      ? await client.getBlock({ blockNumber: receipt.blockNumber }).catch(() => null)
      : null;
    return {
      hash,
      status: receipt ? (receipt.status === "success" ? "ok" : "error") : null,
      from: { hash: tx.from },
      to: tx.to ? { hash: tx.to } : null,
      created_contract: receipt?.contractAddress ? { hash: receipt.contractAddress } : null,
      value: tx.value.toString(),
      fee:
        receipt && receipt.effectiveGasPrice != null
          ? { value: (receipt.gasUsed * receipt.effectiveGasPrice).toString() }
          : null,
      gas_used: receipt ? receipt.gasUsed.toString() : null,
      block_number: receipt ? Number(receipt.blockNumber) : null,
      timestamp: block ? new Date(Number(block.timestamp) * 1000).toISOString() : null,
      raw_input: tx.input,
    };
  } catch {
    return null;
  }
}
