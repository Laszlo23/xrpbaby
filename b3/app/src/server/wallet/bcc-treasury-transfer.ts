import { createPublicClient, createWalletClient, erc20Abi, http, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";
import { BCC_ADDRESS } from "@bc/bcc-kit";

export type BccTreasuryTransferResult =
  | { ok: false; mode: "disabled" | "not_configured" | "failed"; error: string }
  | {
      ok: true;
      mode: "onchain";
      txHash: `0x${string}`;
      chainId: number;
      tokenAddress: Address;
      from: Address;
    };

function env() {
  return process.env as Record<string, string | undefined>;
}

function parseAddress(raw: string | undefined): Address | undefined {
  const v = raw?.trim() ?? "";
  if (!/^0x[a-fA-F0-9]{40}$/.test(v)) return undefined;
  return v as Address;
}

function parseChainId(raw: string | undefined): number {
  const n = Number(raw);
  if (Number.isFinite(n) && n > 0) return Math.floor(n);
  return base.id;
}

function resolveChain(chainId: number) {
  if (chainId === base.id) return base;
  if (chainId === baseSepolia.id) return baseSepolia;
  return base;
}

export function resolveBccTreasuryRpcUrl(chainId: number): string | undefined {
  const e = env();
  return (
    e.BCC_TREASURY_RPC_URL?.trim() ||
    e.PANIC_SWITCH_BCC_REWARD_RPC_URL?.trim() ||
    e.BASE_RPC_URL?.trim() ||
    e.AGENT_BASE_RPC_URL?.trim() ||
    (chainId === base.id ? "https://mainnet.base.org" : undefined)
  );
}

export function resolveBccTreasuryPrivateKey(): string | undefined {
  const e = env();
  const key = e.BCC_TREASURY_PRIVATE_KEY?.trim() || e.PANIC_SWITCH_BCC_REWARD_PRIVATE_KEY?.trim();
  if (!key || !/^0x[a-fA-F0-9]{64}$/.test(key)) return undefined;
  return key;
}

export function isBccTreasuryOnchainEnabled(): boolean {
  const e = env();
  if (e.BCC_TREASURY_ONCHAIN === "1") return true;
  if (e.PANIC_SWITCH_BCC_REWARD_ONCHAIN === "1") return true;
  return false;
}

export function resolveBccTokenAddress(): Address {
  const e = env();
  return (
    parseAddress(e.BCC_TREASURY_TOKEN_ADDRESS) ??
    parseAddress(e.PANIC_SWITCH_BCC_REWARD_TOKEN_ADDRESS) ??
    parseAddress(e.VITE_BCC_TOKEN_ADDRESS) ??
    (BCC_ADDRESS as Address)
  );
}

export function resolveBccTreasuryChainId(): number {
  const e = env();
  return parseChainId(e.BCC_TREASURY_CHAIN_ID ?? e.PANIC_SWITCH_BCC_REWARD_CHAIN_ID);
}

/** Comma-separated payout whitelist; empty = open to all. */
export function parseBccPayoutWhitelist(): Set<string> {
  const raw = env().BCC_PAYOUT_WHITELIST?.trim();
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((a) => a.trim().toLowerCase())
      .filter((a) => /^0x[a-f0-9]{40}$/.test(a)),
  );
}

export function isBccPayoutWhitelistActive(): boolean {
  return parseBccPayoutWhitelist().size > 0;
}

export function isAddressOnBccPayoutWhitelist(address: string): boolean {
  const list = parseBccPayoutWhitelist();
  if (list.size === 0) return true;
  return list.has(address.toLowerCase());
}

/** Transfer BCC from treasury hot wallet to recipient. */
export async function trySendBccFromTreasury(input: {
  to: Address;
  amountWei: bigint;
  memo?: string;
}): Promise<BccTreasuryTransferResult> {
  void input.memo;
  if (!isBccTreasuryOnchainEnabled()) {
    return { ok: false, mode: "disabled", error: "bcc_treasury_onchain_disabled" };
  }

  if (!isAddressOnBccPayoutWhitelist(input.to)) {
    return { ok: false, mode: "failed", error: "not_on_payout_whitelist" };
  }

  const privateKey = resolveBccTreasuryPrivateKey();
  if (!privateKey) {
    return { ok: false, mode: "not_configured", error: "bcc_treasury_private_key_missing" };
  }

  const chainId = resolveBccTreasuryChainId();
  const rpcUrl = resolveBccTreasuryRpcUrl(chainId);
  if (!rpcUrl) {
    return { ok: false, mode: "not_configured", error: "bcc_treasury_rpc_missing" };
  }

  if (input.amountWei <= 0n) {
    return { ok: false, mode: "failed", error: "invalid_transfer_amount" };
  }

  try {
    const chain = resolveChain(chainId);
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const transport = http(rpcUrl);
    const walletClient = createWalletClient({ account, chain, transport });
    const publicClient = createPublicClient({ chain, transport });
    const tokenAddress = resolveBccTokenAddress();

    const txHash = await walletClient.writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "transfer",
      args: [input.to, input.amountWei],
      account,
      chain,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    if (receipt.status !== "success") {
      return { ok: false, mode: "failed", error: "bcc_treasury_tx_failed" };
    }

    return {
      ok: true,
      mode: "onchain",
      txHash,
      chainId,
      tokenAddress,
      from: account.address,
    };
  } catch (e2) {
    return {
      ok: false,
      mode: "failed",
      error: e2 instanceof Error ? e2.message : "bcc_treasury_tx_error",
    };
  }
}
