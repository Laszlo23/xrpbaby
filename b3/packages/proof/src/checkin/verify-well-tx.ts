import { createPublicClient, decodeEventLog, http } from "viem";
import { base } from "viem/chains";
import type { Address, Hex } from "viem";
import { cultureSpinningWellAbi, resolveCultureSpinningWellAddress, type EnvLike } from "@bc/contracts-sdk";

export async function verifyWellSpinTx(params: {
  txHash: Hex;
  expectedWallet: Address;
  chainId: number;
  getEnv?: () => EnvLike;
}): Promise<{ ok: true; dayIndex: bigint; value: number } | { ok: false; code: string }> {
  const env =
    params.getEnv?.() ??
    (typeof process !== "undefined" && process.env
      ? (process.env as unknown as EnvLike)
      : ({} as EnvLike));

  const contractAddress = resolveCultureSpinningWellAddress(params.chainId, env);
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
        abi: cultureSpinningWellAbi,
        data: log.data,
        topics: log.topics,
      });
      if (decoded.eventName !== "WellSpun") continue;
      const args = decoded.args as { user: Address; dayIndex: bigint; value: number };
      if (args.user.toLowerCase() !== params.expectedWallet.toLowerCase()) {
        return { ok: false, code: "wrong_user_event" };
      }
      return { ok: true, dayIndex: args.dayIndex, value: Number(args.value) };
    } catch {
      continue;
    }
  }

  return { ok: false, code: "no_well_event" };
}
