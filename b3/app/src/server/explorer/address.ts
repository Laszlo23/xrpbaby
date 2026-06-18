/**
 * Address ("wallet profile") overview for the human-friendly explorer.
 */
import { BCC_CHAIN_ID } from "@bc/bcc-kit";
import { formatUnits } from "viem";

import {
  fetchBsAddress,
  fetchBsAddressTokenBalances,
  fetchBsAddressTransactions,
} from "@/server/explorer/blockscout";
import { interpretTransaction, type TxFacts } from "@/server/explorer/interpret";
import { lookupKnownContract, type KnownContract } from "@/server/explorer/registry";

export type AddressHolding = {
  symbol: string;
  name: string | null;
  address: string | null;
  amountFormatted: string;
  usdValue: number | null;
  kind: "erc20" | "nft";
};

export type AddressRecentTx = {
  hash: string;
  summary: string;
  kind: TxFacts["kind"];
  status: TxFacts["status"];
  timestamp: string | null;
  ecosystemTags: string[];
};

export type AddressOverview = {
  ok: boolean;
  chainId: number;
  address: string;
  label: string | null;
  isContract: boolean;
  known: KnownContract | null;
  ethBalance: string | null;
  ethBalanceUsd: number | null;
  holdings: AddressHolding[];
  recentTxs: AddressRecentTx[];
};

function formatEth(wei: string): string {
  try {
    const n = Number(formatUnits(BigInt(wei), 18));
    if (!Number.isFinite(n)) return "0";
    return n.toLocaleString("en-US", { maximumFractionDigits: 5 });
  } catch {
    return "0";
  }
}

export async function getAddressOverview(address: string): Promise<AddressOverview> {
  const addr = address.toLowerCase();
  const known = lookupKnownContract(BCC_CHAIN_ID, addr);

  const [info, balances, txs] = await Promise.all([
    fetchBsAddress(addr),
    fetchBsAddressTokenBalances(addr),
    fetchBsAddressTransactions(addr),
  ]);

  const rate = Number(info?.exchange_rate);
  const ethBalance = info?.coin_balance ? formatEth(info.coin_balance) : null;
  const ethBalanceUsd =
    info?.coin_balance && Number.isFinite(rate) && rate > 0
      ? Math.round(Number(formatUnits(BigInt(info.coin_balance), 18)) * rate * 100) / 100
      : null;

  const holdings: AddressHolding[] = balances
    .filter((b) => b.token && (b.value ?? "0") !== "0")
    .slice(0, 24)
    .map((b) => {
      const type = (b.token.type ?? "").toUpperCase();
      const isNft = type.includes("721") || type.includes("1155");
      const decimals = isNft ? 0 : Number(b.token.decimals ?? "18") || 18;
      const tokenAddr = (b.token.address_hash ?? b.token.address ?? null)?.toLowerCase() ?? null;
      const tokenKnown = tokenAddr ? lookupKnownContract(BCC_CHAIN_ID, tokenAddr) : null;
      let amountFormatted = b.value ?? "0";
      let usdValue: number | null = null;
      if (!isNft) {
        try {
          const n = Number(formatUnits(BigInt(b.value ?? "0"), decimals));
          amountFormatted = n.toLocaleString("en-US", { maximumFractionDigits: 4 });
          const tokenRate = Number(b.token.exchange_rate);
          if (Number.isFinite(tokenRate) && tokenRate > 0 && Number.isFinite(n)) {
            usdValue = Math.round(n * tokenRate * 100) / 100;
          }
        } catch {
          // keep raw value
        }
      }
      return {
        symbol: b.token.symbol ?? (isNft ? "NFT" : "?"),
        name: tokenKnown?.label ?? b.token.name ?? null,
        address: tokenAddr,
        amountFormatted,
        usdValue,
        kind: isNft ? ("nft" as const) : ("erc20" as const),
      };
    });

  const recentTxs: AddressRecentTx[] = txs.slice(0, 15).map((tx) => {
    const facts = interpretTransaction(tx, [], BCC_CHAIN_ID);
    return {
      hash: tx.hash,
      summary: facts.summary,
      kind: facts.kind,
      status: facts.status,
      timestamp: facts.timestamp,
      ecosystemTags: facts.ecosystemTags,
    };
  });

  return {
    ok: info != null || balances.length > 0 || txs.length > 0,
    chainId: BCC_CHAIN_ID,
    address: addr,
    label: known?.label ?? info?.name ?? info?.ens_domain_name ?? null,
    isContract: known != null || Boolean(info?.is_contract),
    known,
    ethBalance,
    ethBalanceUsd,
    holdings,
    recentTxs,
  };
}
