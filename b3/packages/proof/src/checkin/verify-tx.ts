import { createPublicClient, decodeEventLog, http } from "viem";
import { base } from "viem/chains";
import type { Address, Hex } from "viem";
import { dailyCheckInAbi, resolveDailyCheckInAddress, type EnvLike } from "@bc/contracts-sdk";

export async function verifyDailyCheckInTx(params: {
  txHash: Hex;
  expectedWallet: Address;
  chainId: number;
  /** Defaults to `process.env` in Node and `{}` in unknown runtimes — pass `import.meta.env` in Vite SSR. */
  getEnv?: () => EnvLike;
}): Promise<{ ok: true; dayIndex: bigint } | { ok: false; code: string }> {
  const env =
    params.getEnv?.() ??
    (typeof process !== "undefined" && process.env
      ? (process.env as unknown as EnvLike)
      : ({} as EnvLike));

  const contractAddress = resolveDailyCheckInAddress(params.chainId, env);
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
        abi: dailyCheckInAbi,
        data: log.data,
        topics: log.topics,
      });
      if (decoded.eventName !== "CheckedIn") continue;
      const args = decoded.args as { user: Address; dayIndex: bigint };
      if (args.user.toLowerCase() !== params.expectedWallet.toLowerCase()) {
        return { ok: false, code: "wrong_user_event" };
      }
      return { ok: true, dayIndex: args.dayIndex };
    } catch {
      continue;
    }
  }

  return { ok: false, code: "no_checkin_event" };
}
