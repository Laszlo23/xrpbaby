/**
 * Deterministic transaction interpreter.
 *
 * Turns raw Blockscout transaction data into structured `TxFacts`: a verified,
 * human-oriented summary of what happened. The AI explainer only ever sees
 * these facts — it never invents chain data.
 */
import { BCC_ADDRESS, BCC_CHAIN_ID } from "@bc/bcc-kit";
import { formatUnits } from "viem";

import type { BsParty, BsTokenTransfer, BsTransaction } from "@/server/explorer/blockscout";
import { isBurnAddress, isZeroAddress, lookupKnownContract } from "@/server/explorer/registry";

export type TxKind =
  | "native-transfer"
  | "token-transfer"
  | "nft-transfer"
  | "swap"
  | "mint"
  | "burn"
  | "approval"
  | "contract-deploy"
  | "contract-call";

export type TxActor = {
  address: string;
  /** Best human label: registry label > Blockscout contract name > ENS/Basename. */
  label: string | null;
  isContract: boolean;
  /** Building Culture ecosystem contract. */
  ecosystem: boolean;
};

export type AssetFlow = {
  from: TxActor;
  to: TxActor;
  asset: {
    kind: "native" | "erc20" | "nft";
    symbol: string;
    name: string | null;
    address: string | null;
    decimals: number;
  };
  amountRaw: string;
  amountFormatted: string;
  tokenId: string | null;
  usdValue: number | null;
};

export type RiskFlag = {
  code: "failed" | "unlimited-approval" | "unverified-contract" | "burn";
  message: string;
};

export type TxFacts = {
  chainId: number;
  hash: string;
  status: "success" | "failed" | "pending";
  kind: TxKind;
  timestamp: string | null;
  blockNumber: number | null;
  from: TxActor;
  to: TxActor | null;
  methodName: string | null;
  nativeValueEth: string;
  nativeValueUsd: number | null;
  feeEth: string | null;
  feeUsd: number | null;
  flows: AssetFlow[];
  ecosystemTags: string[];
  riskFlags: RiskFlag[];
  /** Deterministic one-line summary (template-based, no LLM). */
  summary: string;
};

const MAX_UINT256 = 2n ** 256n - 1n;
const UNLIMITED_THRESHOLD = 2n ** 200n;

export function shortAddress(address: string): string {
  if (address.length < 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function buildActor(chainId: number, party: BsParty | null | undefined): TxActor | null {
  if (!party?.hash) return null;
  const known = lookupKnownContract(chainId, party.hash);
  const label = known?.label ?? party.name ?? party.ens_domain_name ?? null;
  return {
    address: party.hash.toLowerCase(),
    label,
    isContract: known != null || Boolean(party.is_contract),
    ecosystem: known?.ecosystem ?? false,
  };
}

export function actorDisplay(actor: TxActor): string {
  return actor.label ?? shortAddress(actor.address);
}

function formatTokenAmount(valueRaw: string, decimals: number): string {
  try {
    const formatted = formatUnits(BigInt(valueRaw), decimals);
    const n = Number(formatted);
    if (!Number.isFinite(n)) return formatted;
    if (n === 0) return "0";
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
    if (n >= 1) return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
    return n.toLocaleString("en-US", { maximumFractionDigits: 6 });
  } catch {
    return valueRaw;
  }
}

function usdFromRate(
  amountRaw: string,
  decimals: number,
  rate: string | null | undefined,
): number | null {
  const r = Number(rate);
  if (!Number.isFinite(r) || r <= 0) return null;
  try {
    const amount = Number(formatUnits(BigInt(amountRaw), decimals));
    if (!Number.isFinite(amount)) return null;
    return Math.round(amount * r * 100) / 100;
  } catch {
    return null;
  }
}

function transferToFlow(chainId: number, t: BsTokenTransfer): AssetFlow | null {
  const from = buildActor(chainId, t.from);
  const to = buildActor(chainId, t.to);
  if (!from || !to) return null;
  const tokenAddress = (t.token.address_hash ?? t.token.address ?? null)?.toLowerCase() ?? null;
  const tokenType = (t.token.type ?? "").toUpperCase();
  const isNft = tokenType.includes("721") || tokenType.includes("1155");
  const decimals = isNft ? 0 : Number(t.token.decimals ?? "18") || 18;
  const amountRaw = t.total?.value ?? (isNft ? "1" : "0");
  const known = tokenAddress ? lookupKnownContract(chainId, tokenAddress) : null;
  return {
    from,
    to,
    asset: {
      kind: isNft ? "nft" : "erc20",
      symbol: t.token.symbol ?? (isNft ? "NFT" : "tokens"),
      name: known?.label ?? t.token.name ?? null,
      address: tokenAddress,
      decimals,
    },
    amountRaw,
    amountFormatted: isNft ? amountRaw : formatTokenAmount(amountRaw, decimals),
    tokenId: t.total?.token_id ?? null,
    usdValue: isNft ? null : usdFromRate(amountRaw, decimals, t.token.exchange_rate),
  };
}

function detectApproval(tx: BsTransaction): { spender: string | null; unlimited: boolean } | null {
  const method = (tx.decoded_input?.method_call ?? tx.method ?? "").toLowerCase();
  if (!method.startsWith("approve") && !method.startsWith("setapprovalforall")) return null;
  let spender: string | null = null;
  let unlimited = method.startsWith("setapprovalforall");
  for (const p of tx.decoded_input?.parameters ?? []) {
    const name = (p.name ?? "").toLowerCase();
    if (
      (name === "spender" || name === "operator" || name === "to") &&
      typeof p.value === "string"
    ) {
      spender = p.value;
    }
    if ((name === "amount" || name === "value" || name === "wad") && typeof p.value === "string") {
      try {
        const v = BigInt(p.value);
        if (v === MAX_UINT256 || v >= UNLIMITED_THRESHOLD) unlimited = true;
      } catch {
        // non-numeric param — ignore
      }
    }
    if (name === "approved" && p.value === true) unlimited = true;
  }
  return { spender, unlimited };
}

function classify(tx: BsTransaction, flows: AssetFlow[]): TxKind {
  if (!tx.to && tx.created_contract) return "contract-deploy";
  if (detectApproval(tx)) return "approval";

  const sender = tx.from.hash.toLowerCase();
  const sent = flows.filter((f) => f.from.address === sender);
  const received = flows.filter((f) => f.to.address === sender);

  if (flows.length > 0) {
    const allMint = flows.every((f) => isZeroAddress(f.from.address));
    if (allMint) return "mint";
    const allBurn = flows.every((f) => isBurnAddress(f.to.address));
    if (allBurn) return "burn";
    if (sent.length > 0 && received.length > 0) return "swap";
    const nativeOut = BigInt(tx.value || "0") > 0n;
    if (nativeOut && received.length > 0) return "swap";
    if (flows.some((f) => f.asset.kind === "nft")) return "nft-transfer";
    return "token-transfer";
  }

  const hasInput = (tx.raw_input ?? "0x").length > 2;
  if (!hasInput && BigInt(tx.value || "0") > 0n) return "native-transfer";
  return "contract-call";
}

function buildSummary(facts: Omit<TxFacts, "summary">): string {
  const who = actorDisplay(facts.from);
  const failed = facts.status === "failed" ? " (failed)" : "";
  const flow = facts.flows[0];

  switch (facts.kind) {
    case "native-transfer":
      return `${who} sent ${facts.nativeValueEth} ETH to ${facts.to ? actorDisplay(facts.to) : "someone"}${failed}`;
    case "token-transfer": {
      if (!flow) return `${who} moved tokens${failed}`;
      return `${actorDisplay(flow.from)} sent ${flow.amountFormatted} ${flow.asset.symbol} to ${actorDisplay(flow.to)}${failed}`;
    }
    case "nft-transfer": {
      if (!flow) return `${who} moved an NFT${failed}`;
      const item = flow.tokenId ? `${flow.asset.symbol} #${flow.tokenId}` : flow.asset.symbol;
      return `${actorDisplay(flow.from)} sent ${item} to ${actorDisplay(flow.to)}${failed}`;
    }
    case "swap": {
      const sender = facts.from.address;
      const out = facts.flows.find((f) => f.from.address === sender);
      const inn = facts.flows.find((f) => f.to.address === sender);
      const gave = out
        ? `${out.amountFormatted} ${out.asset.symbol}`
        : `${facts.nativeValueEth} ETH`;
      const got = inn ? `${inn.amountFormatted} ${inn.asset.symbol}` : "tokens";
      return `${who} swapped ${gave} for ${got}${failed}`;
    }
    case "mint": {
      if (!flow) return `${who} minted tokens${failed}`;
      const item =
        flow.asset.kind === "nft"
          ? `${flow.asset.symbol}${flow.tokenId ? ` #${flow.tokenId}` : ""}`
          : `${flow.amountFormatted} ${flow.asset.symbol}`;
      return `${actorDisplay(flow.to)} minted ${item}${failed}`;
    }
    case "burn": {
      if (!flow) return `${who} burned tokens${failed}`;
      return `${who} burned ${flow.amountFormatted} ${flow.asset.symbol} — gone forever${failed}`;
    }
    case "approval": {
      const target = facts.to ? actorDisplay(facts.to) : "a contract";
      return `${who} gave ${target} permission to move their tokens${failed}`;
    }
    case "contract-deploy":
      return `${who} deployed a new smart contract${failed}`;
    case "contract-call": {
      const target = facts.to ? actorDisplay(facts.to) : "a contract";
      const method = facts.methodName ? ` (${facts.methodName})` : "";
      return `${who} interacted with ${target}${method}${failed}`;
    }
    default: {
      const _exhaustive: never = facts.kind;
      return _exhaustive;
    }
  }
}

/** Build verified, structured facts from Blockscout tx data. Pure function. */
export function interpretTransaction(
  tx: BsTransaction,
  extraTransfers: BsTokenTransfer[] = [],
  chainId: number = BCC_CHAIN_ID,
): TxFacts {
  const transfers = tx.token_transfers?.length ? tx.token_transfers : extraTransfers;
  const flows = transfers
    .map((t) => transferToFlow(chainId, t))
    .filter((f): f is AssetFlow => f != null)
    .slice(0, 20);

  const from = buildActor(chainId, tx.from) ?? {
    address: "0x0000000000000000000000000000000000000000",
    label: null,
    isContract: false,
    ecosystem: false,
  };
  const to = buildActor(chainId, tx.to ?? tx.created_contract);

  const status: TxFacts["status"] =
    tx.status === "ok" ? "success" : tx.status === "error" ? "failed" : "pending";

  const nativeValueEth = formatTokenAmount(tx.value || "0", 18);
  const feeRaw = tx.fee?.value ?? null;
  const kind = classify(tx, flows);

  const ecosystemTags = new Set<string>();
  for (const actor of [from, to, ...flows.flatMap((f) => [f.from, f.to])]) {
    if (actor?.ecosystem && actor.label) ecosystemTags.add(actor.label);
  }
  for (const f of flows) {
    if (f.asset.address === BCC_ADDRESS.toLowerCase()) ecosystemTags.add("BCC");
  }

  const riskFlags: RiskFlag[] = [];
  if (status === "failed") {
    riskFlags.push({
      code: "failed",
      message:
        "This transaction failed — nothing was transferred, but the network fee was still paid.",
    });
  }
  const approval = detectApproval(tx);
  if (approval?.unlimited) {
    riskFlags.push({
      code: "unlimited-approval",
      message:
        "This grants unlimited spending permission. The approved contract can move all of these tokens at any time until the approval is revoked.",
    });
  }
  if (kind === "burn") {
    riskFlags.push({
      code: "burn",
      message: "Tokens sent to a burn address are destroyed and can never be recovered.",
    });
  }

  const facts: Omit<TxFacts, "summary"> = {
    chainId,
    hash: tx.hash,
    status,
    kind,
    timestamp: tx.timestamp ?? null,
    blockNumber: tx.block_number ?? tx.block ?? null,
    from,
    to,
    methodName: tx.decoded_input?.method_call?.split("(")[0] ?? tx.method ?? null,
    nativeValueEth,
    nativeValueUsd: usdFromRate(tx.value || "0", 18, tx.exchange_rate),
    feeEth: feeRaw ? formatTokenAmount(feeRaw, 18) : null,
    feeUsd: feeRaw ? usdFromRate(feeRaw, 18, tx.exchange_rate) : null,
    flows,
    ecosystemTags: [...ecosystemTags],
    riskFlags,
  };

  return { ...facts, summary: buildSummary(facts) };
}

/** Template one-liner for a standalone token transfer (feed items). */
export function describeTokenTransfer(t: BsTokenTransfer, chainId: number = BCC_CHAIN_ID): string {
  const flow = transferToFlow(chainId, t);
  if (!flow) return "Token transfer";
  if (isZeroAddress(flow.from.address)) {
    return `${actorDisplay(flow.to)} received ${flow.amountFormatted} freshly minted ${flow.asset.symbol}`;
  }
  if (isBurnAddress(flow.to.address)) {
    return `${actorDisplay(flow.from)} burned ${flow.amountFormatted} ${flow.asset.symbol}`;
  }
  return `${actorDisplay(flow.from)} sent ${flow.amountFormatted} ${flow.asset.symbol} to ${actorDisplay(flow.to)}`;
}
