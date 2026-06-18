import { createPublicClient, erc20Abi, http, parseAbiItem, type Address, type Hash } from "viem";
import { base } from "viem/chains";

import { GRANT_AGENT_BCC_PRICE_WEI } from "@/lib/grant-agent-config";
import { TREASURY_SAFE_ADDRESS } from "@/lib/treasury-revenue-rules";
import {
  resolveBccTokenAddress,
  resolveBccTreasuryRpcUrl,
} from "@/server/wallet/bcc-treasury-transfer";

const transferEvent = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)",
);

export type BccPaymentVerification =
  | { ok: true; from: Address; to: Address; amountWei: bigint; txHash: Hash }
  | { ok: false; error: string };

/** Verify user sent BCC to treasury in a recent transaction. */
export async function verifyBccPaymentToTreasury(input: {
  txHash: Hash;
  expectedFrom: Address;
  minAmountWei?: bigint;
}): Promise<BccPaymentVerification> {
  const rpcUrl = resolveBccTreasuryRpcUrl(base.id);
  if (!rpcUrl) {
    return { ok: false, error: "rpc_unavailable" };
  }

  const client = createPublicClient({ chain: base, transport: http(rpcUrl) });
  const receipt = await client.getTransactionReceipt({ hash: input.txHash });
  if (receipt.status !== "success") {
    return { ok: false, error: "tx_failed" };
  }

  const token = resolveBccTokenAddress();
  const treasury = TREASURY_SAFE_ADDRESS.toLowerCase() as Address;
  const minAmount = input.minAmountWei ?? GRANT_AGENT_BCC_PRICE_WEI;

  const logs = await client.getLogs({
    address: token,
    event: transferEvent,
    fromBlock: receipt.blockNumber,
    toBlock: receipt.blockNumber,
  });

  for (const log of logs) {
    const from = log.args.from?.toLowerCase() as Address | undefined;
    const to = log.args.to?.toLowerCase() as Address | undefined;
    const value = log.args.value ?? 0n;
    if (from === input.expectedFrom.toLowerCase() && to === treasury && value >= minAmount) {
      return {
        ok: true,
        from: from as Address,
        to: treasury,
        amountWei: value,
        txHash: input.txHash,
      };
    }
  }

  return { ok: false, error: "bcc_transfer_not_found" };
}

/** Check wallet BCC balance for agent access tier. */
export async function readWalletBccBalanceWei(address: Address): Promise<bigint> {
  const rpcUrl = resolveBccTreasuryRpcUrl(base.id);
  if (!rpcUrl) return 0n;
  const client = createPublicClient({ chain: base, transport: http(rpcUrl) });
  const token = resolveBccTokenAddress();
  try {
    return await client.readContract({
      address: token,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
    });
  } catch {
    return 0n;
  }
}
