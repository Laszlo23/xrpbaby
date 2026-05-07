import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import { createPublicClient, formatEther, http } from "viem";
import { getDefaultChain, getWagmiChainById } from "@/lib/chains";

export type ChainSummary = {
  label: string;
  nativeBalance?: string;
  txCount?: number;
  recentActivityHint?: string;
  error?: string;
};

export async function summarizeEvm(
  address: `0x${string}`,
  chainId?: number,
): Promise<ChainSummary> {
  try {
    const chain =
      chainId !== undefined ? (getWagmiChainById(chainId) ?? getDefaultChain()) : getDefaultChain();
    const client = createPublicClient({
      chain,
      transport: http(),
    });
    const [balance, txCount] = await Promise.all([
      client.getBalance({ address }),
      client.getTransactionCount({ address }),
    ]);
    return {
      label: chain.name,
      nativeBalance: `${formatEther(balance)} ETH`,
      txCount,
      recentActivityHint: `Nonce (tx count): ${txCount}`,
    };
  } catch (e) {
    return {
      label: "EVM",
      error: e instanceof Error ? e.message : "EVM lookup failed",
    };
  }
}

export async function summarizeSolana(address: string): Promise<ChainSummary> {
  try {
    const rpc =
      (import.meta.env.VITE_SOLANA_RPC as string | undefined) ||
      "https://api.mainnet-beta.solana.com";
    const c = new Connection(rpc);
    const pk = new PublicKey(address);
    const [bal, sigs] = await Promise.all([
      c.getBalance(pk),
      c.getSignaturesForAddress(pk, { limit: 5 }),
    ]);
    return {
      label: "Solana",
      nativeBalance: `${(bal / LAMPORTS_PER_SOL).toFixed(4)} SOL`,
      recentActivityHint: `${sigs.length} recent signatures (sample)`,
    };
  } catch (e) {
    return {
      label: "Solana",
      error: e instanceof Error ? e.message : "Solana lookup failed",
    };
  }
}

export async function summarizeSui(address: string): Promise<ChainSummary> {
  try {
    const url =
      (import.meta.env.VITE_SUI_RPC as string | undefined) || getJsonRpcFullnodeUrl("mainnet");
    const client = new SuiJsonRpcClient({ url, network: "mainnet" });
    const bal = await client.getBalance({ owner: address });
    const mist = BigInt(bal.totalBalance || "0");
    const sui = Number(mist) / 1e9;
    return {
      label: "Sui",
      nativeBalance: `${sui.toFixed(4)} SUI`,
      recentActivityHint: "Balance from fullnode (phase A)",
    };
  } catch (e) {
    return {
      label: "Sui",
      error: e instanceof Error ? e.message : "Sui lookup failed",
    };
  }
}

export async function summarizeBitcoin(address: string): Promise<ChainSummary> {
  try {
    const base =
      (import.meta.env.VITE_BTC_EXPLORER_API as string | undefined) ||
      "https://blockstream.info/api";
    const res = await fetch(`${base}/address/${encodeURIComponent(address)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = (await res.json()) as {
      chain_stats?: { funded_txo_sum?: number; spent_txo_sum?: number };
    };
    const funded = j.chain_stats?.funded_txo_sum ?? 0;
    const spent = j.chain_stats?.spent_txo_sum ?? 0;
    const sats = Math.max(0, funded - spent);
    const btc = sats / 1e8;
    return {
      label: "Bitcoin",
      nativeBalance: `${btc.toFixed(6)} BTC (approx.)`,
      recentActivityHint: "UTXO-based estimate via Blockstream",
    };
  } catch (e) {
    return {
      label: "Bitcoin",
      error: e instanceof Error ? e.message : "Bitcoin lookup failed",
    };
  }
}
