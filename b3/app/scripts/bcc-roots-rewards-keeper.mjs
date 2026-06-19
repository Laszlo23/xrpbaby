#!/usr/bin/env node
/**
 * Fund Culture Roots staking pools — treasury notifyRewardAmount.
 * Dry-run: BCC_ROOTS_REWARDS_KEEPER_DRY_RUN=1 (default)
 * Live:    BCC_ROOTS_REWARDS_KEEPER_DRY_RUN=0 BCC_TREASURY_ONCHAIN=1
 */
import { createPublicClient, createWalletClient, erc20Abi, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

const BCC_ADDRESS = "0xb890a5289f789f1346032ccc1847939e855fab07";
const dryRun = process.env.BCC_ROOTS_REWARDS_KEEPER_DRY_RUN !== "0";

const rootsAbi = [
  {
    type: "function",
    name: "notifyRewardAmount",
    inputs: [
      { name: "poolId", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "duration", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
];

function resolvePrivateKey() {
  const key =
    process.env.BCC_TREASURY_PRIVATE_KEY?.trim() ||
    process.env.PANIC_SWITCH_BCC_REWARD_PRIVATE_KEY?.trim();
  if (!key || !/^0x[a-fA-F0-9]{64}$/.test(key)) return null;
  return key;
}

function parseBigIntEnv(name, fallback = 0n) {
  const raw = process.env[name]?.trim();
  if (!raw || !/^\d+$/.test(raw)) return fallback;
  return BigInt(raw);
}

async function main() {
  const staking =
    process.env.BCC_ROOTS_STAKING_ADDRESS?.trim() ||
    process.env.VITE_BCC_ROOTS_STAKING_ADDRESS?.trim();
  if (!staking || !/^0x[a-fA-F0-9]{40}$/.test(staking)) {
    console.error("Set BCC_ROOTS_STAKING_ADDRESS");
    process.exit(1);
  }

  const poolId = parseBigIntEnv("BCC_ROOTS_POOL_ID", 0n);
  const amount = parseBigIntEnv("BCC_ROOTS_REWARD_AMOUNT_WEI");
  const duration = parseBigIntEnv("BCC_ROOTS_REWARD_DURATION_SEC", 604800n);
  const weeklyCap = parseBigIntEnv("BCC_ROOTS_WEEKLY_CAP_WEI");

  if (amount === 0n) {
    console.error("Set BCC_ROOTS_REWARD_AMOUNT_WEI");
    process.exit(1);
  }
  if (weeklyCap > 0n && amount > weeklyCap) {
    console.error(`Amount ${amount} exceeds weekly cap ${weeklyCap}`);
    process.exit(1);
  }

  if (dryRun) {
    console.log(
      `[dry-run] notifyRewardAmount pool=${poolId} amount=${amount} duration=${duration}s → ${staking}`,
    );
    return;
  }

  if (
    process.env.BCC_TREASURY_ONCHAIN !== "1" &&
    process.env.PANIC_SWITCH_BCC_REWARD_ONCHAIN !== "1"
  ) {
    console.error("treasury_onchain_disabled");
    process.exit(1);
  }

  const privateKey = resolvePrivateKey();
  if (!privateKey) {
    console.error("treasury_key_missing");
    process.exit(1);
  }

  const rpc =
    process.env.BCC_TREASURY_RPC_URL?.trim() ||
    process.env.BASE_RPC_URL?.trim() ||
    "https://mainnet.base.org";

  const account = privateKeyToAccount(privateKey);
  const transport = http(rpc);
  const walletClient = createWalletClient({ account, chain: base, transport });
  const publicClient = createPublicClient({ chain: base, transport });

  const approveHash = await walletClient.writeContract({
    address: BCC_ADDRESS,
    abi: erc20Abi,
    functionName: "approve",
    args: [staking, amount],
    account,
    chain: base,
  });
  await publicClient.waitForTransactionReceipt({ hash: approveHash });

  const txHash = await walletClient.writeContract({
    address: staking,
    abi: rootsAbi,
    functionName: "notifyRewardAmount",
    args: [poolId, amount, duration],
    account,
    chain: base,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  if (receipt.status !== "success") {
    console.error("notify_failed");
    process.exit(1);
  }
  console.log(`Funded pool ${poolId}: ${txHash}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
