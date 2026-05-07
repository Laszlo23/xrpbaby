import { parseAbiItem, type Address, type Hex, type PublicClient } from "viem";

export type CheckedInLog = {
  txHash: Hex;
  dayIndex: bigint;
  blockNumber: bigint;
};

const checkedInEvent = parseAbiItem(
  "event CheckedIn(address indexed user, uint256 dayIndex)",
);

/** `CheckedIn` logs for `user` between `fromBlock` and `toBlock` (inclusive). */
export async function readCheckedInLogs(params: {
  client: PublicClient;
  contract: Address;
  user: Address;
  fromBlock: bigint;
  toBlock: bigint;
}): Promise<CheckedInLog[]> {
  const logs = await params.client.getLogs({
    address: params.contract,
    event: checkedInEvent,
    args: { user: params.user },
    fromBlock: params.fromBlock,
    toBlock: params.toBlock,
  });

  const out: CheckedInLog[] = [];
  for (const log of logs) {
    if (log.blockNumber === null || log.transactionHash === null) continue;
    const dayIndex = typeof log.args.dayIndex === "bigint" ? log.args.dayIndex : 0n;
    out.push({ txHash: log.transactionHash, dayIndex, blockNumber: log.blockNumber });
  }
  return out;
}
