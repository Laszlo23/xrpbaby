import {
  createPublicClient,
  createWalletClient,
  decodeEventLog,
  encodeFunctionData,
  http,
  type Address,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { resolveServiceDealChain, serviceDealConfig, serviceDealEscrowAbi } from "./config";

function rpcUrl(chainId: number): string | undefined {
  return (
    process.env.SERVICE_DEAL_RPC_URL?.trim() ||
    process.env.BASE_RPC_URL?.trim() ||
    process.env.AGENT_BASE_RPC_URL?.trim() ||
    (chainId === 8453 ? "https://mainnet.base.org" : undefined)
  );
}

export function buildCreateDealCalldata(input: {
  provider: Address;
  amount: bigint;
  metadataHash: Hex;
  deliverBy: bigint;
  vetoWindowSeconds?: bigint;
}) {
  return encodeFunctionData({
    abi: serviceDealEscrowAbi,
    functionName: "createDeal",
    args: [
      input.provider,
      input.amount,
      input.metadataHash,
      input.deliverBy,
      input.vetoWindowSeconds ?? 0n,
    ],
  });
}

export function buildFundCalldata(dealId: bigint) {
  return encodeFunctionData({
    abi: serviceDealEscrowAbi,
    functionName: "fund",
    args: [dealId],
  });
}

export function buildSubmitEvidenceCalldata(dealId: bigint, evidenceHash: Hex) {
  return encodeFunctionData({
    abi: serviceDealEscrowAbi,
    functionName: "submitEvidence",
    args: [dealId, evidenceHash],
  });
}

export function buildOverrideRulingCalldata(dealId: bigint, payoutBps: number, rulingHash: Hex) {
  return encodeFunctionData({
    abi: serviceDealEscrowAbi,
    functionName: "overrideRuling",
    args: [dealId, payoutBps, rulingHash],
  });
}

export async function readOnChainDeal(dealId: bigint) {
  const cfg = serviceDealConfig();
  const url = cfg ? rpcUrl(cfg.chainId) : undefined;
  if (!cfg || !url) return null;

  const chain = resolveServiceDealChain(cfg.chainId);
  const client = createPublicClient({ chain, transport: http(url) });
  const row = await client.readContract({
    address: cfg.escrowAddress,
    abi: serviceDealEscrowAbi,
    functionName: "deals",
    args: [dealId],
  });

  return {
    payer: row[0],
    provider: row[1],
    amount: row[2],
    metadataHash: row[3],
    deliverBy: row[4],
    vetoWindowSeconds: row[5],
    evidenceHash: row[6],
    rulingHash: row[7],
    payoutBps: row[8],
    ruledAt: row[9],
    state: row[10],
  };
}

async function aiOracleWallet() {
  const cfg = serviceDealConfig();
  const key = process.env.SERVICE_DEAL_AI_ORACLE_PRIVATE_KEY?.trim();
  if (!cfg || !key || !/^0x[a-fA-F0-9]{64}$/.test(key)) {
    return { ok: false as const, error: "ai_oracle_not_configured" };
  }
  const url = rpcUrl(cfg.chainId);
  if (!url) return { ok: false as const, error: "rpc_missing" };

  const chain = resolveServiceDealChain(cfg.chainId);
  const account = privateKeyToAccount(key as Hex);
  const transport = http(url);
  return {
    ok: true as const,
    cfg,
    chain,
    account,
    walletClient: createWalletClient({ account, chain, transport }),
    publicClient: createPublicClient({ chain, transport }),
  };
}

export async function submitEvidenceOnChain(dealId: bigint, evidenceHash: Hex, providerKey: Hex) {
  const cfg = serviceDealConfig();
  const url = cfg ? rpcUrl(cfg.chainId) : undefined;
  if (!cfg || !url) return { ok: false as const, error: "escrow_not_configured" };

  try {
    const chain = resolveServiceDealChain(cfg.chainId);
    const account = privateKeyToAccount(providerKey);
    const transport = http(url);
    const walletClient = createWalletClient({ account, chain, transport });
    const txHash = await walletClient.writeContract({
      address: cfg.escrowAddress,
      abi: serviceDealEscrowAbi,
      functionName: "submitEvidence",
      args: [dealId, evidenceHash],
      account,
      chain,
    });
    return { ok: true as const, txHash };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "submit_evidence_failed",
    };
  }
}

export async function proposeRulingOnChain(dealId: bigint, payoutBps: number, rulingHash: Hex) {
  const ctx = await aiOracleWallet();
  if (!ctx.ok) return ctx;

  try {
    const txHash = await ctx.walletClient.writeContract({
      address: ctx.cfg.escrowAddress,
      abi: serviceDealEscrowAbi,
      functionName: "proposeRuling",
      args: [dealId, payoutBps, rulingHash],
      account: ctx.account,
      chain: ctx.chain,
    });
    return { ok: true as const, txHash };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "propose_ruling_failed",
    };
  }
}

export async function settleDealOnChain(dealId: bigint) {
  const ctx = await aiOracleWallet();
  if (!ctx.ok) return ctx;

  try {
    const txHash = await ctx.walletClient.writeContract({
      address: ctx.cfg.escrowAddress,
      abi: serviceDealEscrowAbi,
      functionName: "settle",
      args: [dealId],
      account: ctx.account,
      chain: ctx.chain,
    });
    return { ok: true as const, txHash };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "settle_failed",
    };
  }
}

export async function syncDealIdFromCreateTx(txHash: Hex): Promise<string | null> {
  const cfg = serviceDealConfig();
  const url = cfg ? rpcUrl(cfg.chainId) : undefined;
  if (!cfg || !url) return null;

  const chain = resolveServiceDealChain(cfg.chainId);
  const client = createPublicClient({ chain, transport: http(url) });
  const receipt = await client.waitForTransactionReceipt({ hash: txHash });

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== cfg.escrowAddress.toLowerCase()) continue;
    try {
      const parsed = decodeEventLog({
        abi: serviceDealEscrowAbi,
        eventName: "DealCreated",
        data: log.data,
        topics: log.topics,
      });
      return parsed.args.dealId.toString();
    } catch {
      // ignore unrelated logs
    }
  }
  return null;
}
