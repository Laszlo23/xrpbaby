import { createPublicClient, decodeEventLog, http } from "viem";
import { base } from "viem/chains";
import type { Address, Hex } from "viem";
import {
  panicSwitchAttestationAbi,
  resolvePanicSwitchAttestationAddress,
  type EnvLike,
} from "@bc/contracts-sdk";

export type PanicAttestProof = {
  dayIndex: bigint;
  precisionScore: number;
  holdSeconds: number;
  streakDays: number;
  totalRuns: number;
};

export async function verifyPanicSwitchAttestTx(params: {
  txHash: Hex;
  expectedWallet: Address;
  chainId: number;
  expectedPrecision?: number;
  expectedHoldSeconds?: number;
  getEnv?: () => EnvLike;
}): Promise<{ ok: true; proof: PanicAttestProof } | { ok: false; code: string }> {
  const env =
    params.getEnv?.() ??
    (typeof process !== "undefined" && process.env
      ? (process.env as unknown as EnvLike)
      : ({} as EnvLike));

  const contractAddress = resolvePanicSwitchAttestationAddress(params.chainId, env);
  if (!contractAddress) {
    return { ok: false, code: "contract_not_configured" };
  }

  if (params.chainId !== base.id) {
    return { ok: false, code: "wrong_chain" };
  }

  const rpcUrl =
    (typeof process !== "undefined" && process.env?.BASE_RPC_URL?.trim()) ||
    "https://mainnet.base.org";
  const client = createPublicClient({
    chain: base,
    transport: http(rpcUrl),
  });

  const receipt = await client.getTransactionReceipt({ hash: params.txHash });
  if (receipt.status !== "success") {
    return { ok: false, code: "tx_failed" };
  }

  const tx = await client.getTransaction({ hash: params.txHash });
  const from = tx.from?.toLowerCase();
  if (!from || from !== params.expectedWallet.toLowerCase()) {
    return { ok: false, code: "wrong_signer" };
  }

  const want = contractAddress.toLowerCase();

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== want) continue;
    try {
      const decoded = decodeEventLog({
        abi: panicSwitchAttestationAbi,
        data: log.data,
        topics: log.topics,
      });
      if (decoded.eventName !== "PanicAttested") continue;
      const args = decoded.args as {
        user: Address;
        dayIndex: bigint;
        precisionScore: bigint;
        holdSeconds: bigint;
        streakDays: bigint;
        totalRuns: bigint;
      };
      if (args.user.toLowerCase() !== params.expectedWallet.toLowerCase()) {
        return { ok: false, code: "wrong_user_event" };
      }

      const precisionScore = Number(args.precisionScore);
      const holdSeconds = Number(args.holdSeconds);

      if (params.expectedPrecision != null && precisionScore !== params.expectedPrecision) {
        return { ok: false, code: "precision_mismatch" };
      }
      if (params.expectedHoldSeconds != null && holdSeconds !== params.expectedHoldSeconds) {
        return { ok: false, code: "hold_mismatch" };
      }

      return {
        ok: true,
        proof: {
          dayIndex: args.dayIndex,
          precisionScore,
          holdSeconds,
          streakDays: Number(args.streakDays),
          totalRuns: Number(args.totalRuns),
        },
      };
    } catch {
      continue;
    }
  }

  return { ok: false, code: "no_attest_event" };
}
