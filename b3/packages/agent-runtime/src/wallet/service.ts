import {
  createWalletClient,
  http,
  parseEther,
  type Address,
  type Hash,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { agentsPaused, baseRpcUrl, chainId } from "../env.js";
import { checkGasCap, recordGasSpend, utcSpendDate } from "../budget.js";
import { insertAgentActionLog } from "../ledger-pg.js";

export type WalletTier = "ops" | "deployer" | "ags";

function resolvePrivateKey(tier: WalletTier): `0x${string}` | undefined {
  if (tier === "deployer") {
    const k = process.env.AGENT_DEPLOYER_PRIVATE_KEY?.trim();
    if (k && /^0x[0-9a-fA-F]{64}$/.test(k)) return k as `0x${string}`;
  }
  if (tier === "ops") {
    const k =
      process.env.AGENT_OPS_PRIVATE_KEY?.trim() ||
      process.env.AGENT_AGS_DISTRIBUTOR_PRIVATE_KEY?.trim();
    if (k && /^0x[0-9a-fA-F]{64}$/.test(k)) return k as `0x${string}`;
  }
  if (tier === "ags") {
    const k = process.env.AGENT_AGS_DISTRIBUTOR_PRIVATE_KEY?.trim();
    if (k && /^0x[0-9a-fA-F]{64}$/.test(k)) return k as `0x${string}`;
  }
  return undefined;
}

function dailyGasCapEth(tier: WalletTier): number {
  if (tier === "deployer") {
    return Number(process.env.AGENT_DEPLOYER_DAILY_GAS_CAP_ETH ?? "0.05");
  }
  return Number(process.env.AGENT_OPS_DAILY_GAS_CAP_ETH ?? "0.05");
}

export type SignAndSendParams = {
  walletTier: WalletTier;
  to: Address;
  valueWei?: bigint | string;
  data?: Hex;
  agentId: string;
  dbUrl: string;
};

export type SignAndSendResult = {
  ok: boolean;
  txHash?: Hash;
  dryRun: boolean;
  error?: string;
  gasEth?: number;
};

export async function signAndSend(params: SignAndSendParams): Promise<SignAndSendResult> {
  const { walletTier, to, agentId, dbUrl } = params;
  const value =
    typeof params.valueWei === "string"
      ? BigInt(params.valueWei)
      : (params.valueWei ?? 0n);
  const data = params.data ?? "0x";

  if (agentsPaused()) {
    return { ok: false, dryRun: true, error: "AGENTS_PAUSED" };
  }

  const pk = resolvePrivateKey(walletTier);
  const estGasEth = Number(parseEther("0.001"));
  const gasCheck = await checkGasCap(dbUrl, agentId, dailyGasCapEth(walletTier), estGasEth);
  if (!gasCheck.ok) {
    return { ok: false, dryRun: true, error: gasCheck.reason };
  }

  if (!pk) {
    await insertAgentActionLog(dbUrl, {
      agentId,
      action: "wallet.sign_and_send",
      params: { walletTier, to, value: value.toString(), dryRun: true },
      dryRun: true,
      status: "skipped",
      errorMsg: "no_private_key",
      txHash: null,
    });
    return { ok: false, dryRun: true, error: "no_private_key" };
  }

  const cid = chainId();
  const rpc = baseRpcUrl();
  const account = privateKeyToAccount(pk);
  const client = createWalletClient({
    account,
    chain: cid === 8453 ? base : base,
    transport: http(rpc),
  });

  try {
    const hash = await client.sendTransaction({ to, value, data });
    await recordGasSpend(dbUrl, agentId, estGasEth);
    await insertAgentActionLog(dbUrl, {
      agentId,
      action: "wallet.sign_and_send",
      params: { walletTier, to, value: value.toString(), spendDate: utcSpendDate() },
      dryRun: false,
      status: "ok",
      txHash: hash,
      errorMsg: null,
    });
    return { ok: true, txHash: hash, dryRun: false, gasEth: estGasEth };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await insertAgentActionLog(dbUrl, {
      agentId,
      action: "wallet.sign_and_send",
      params: { walletTier, to, value: value.toString() },
      dryRun: false,
      status: "error",
      errorMsg: msg,
      txHash: null,
    });
    return { ok: false, dryRun: false, error: msg };
  }
}
