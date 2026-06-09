#!/usr/bin/env node
/**
 * Process pending BccSettlement rows — treasury BCC transfer.
 * Dry-run: BCC_SETTLEMENT_KEEPER_DRY_RUN=1 (default)
 * Live:    BCC_SETTLEMENT_KEEPER_DRY_RUN=0 BCC_TREASURY_ONCHAIN=1
 */
import { PrismaClient } from "@prisma/client";
import { createPublicClient, createWalletClient, erc20Abi, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

const BCC_ADDRESS = "0xb890a5289f789f1346032ccc1847939e855fab07";
const dryRun = process.env.BCC_SETTLEMENT_KEEPER_DRY_RUN !== "0";

const prisma = new PrismaClient();

function resolvePrivateKey() {
  const key =
    process.env.BCC_TREASURY_PRIVATE_KEY?.trim() ||
    process.env.PANIC_SWITCH_BCC_REWARD_PRIVATE_KEY?.trim();
  if (!key || !/^0x[a-fA-F0-9]{64}$/.test(key)) return null;
  return key;
}

async function sendBcc(to, amountWei) {
  if (dryRun) {
    console.log(`[dry-run] would send ${amountWei} wei BCC → ${to}`);
    return { ok: true, txHash: "0x" + "0".repeat(64) };
  }
  if (process.env.BCC_TREASURY_ONCHAIN !== "1" && process.env.PANIC_SWITCH_BCC_REWARD_ONCHAIN !== "1") {
    return { ok: false, error: "treasury_onchain_disabled" };
  }
  const privateKey = resolvePrivateKey();
  if (!privateKey) return { ok: false, error: "treasury_key_missing" };
  const rpc =
    process.env.BCC_TREASURY_RPC_URL?.trim() ||
    process.env.BASE_RPC_URL?.trim() ||
    "https://mainnet.base.org";
  const account = privateKeyToAccount(privateKey);
  const transport = http(rpc);
  const walletClient = createWalletClient({ account, chain: base, transport });
  const publicClient = createPublicClient({ chain: base, transport });
  const txHash = await walletClient.writeContract({
    address: BCC_ADDRESS,
    abi: erc20Abi,
    functionName: "transfer",
    args: [to, amountWei],
    account,
    chain: base,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  if (receipt.status !== "success") return { ok: false, error: "tx_failed" };
  return { ok: true, txHash };
}

async function main() {
  const pending = await prisma.bccSettlement.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    take: 50,
    include: { member: true },
  });
  console.log(`Found ${pending.length} pending settlement(s) (dryRun=${dryRun})`);
  for (const row of pending) {
    const wallet = await prisma.wallet.findUnique({ where: { id: row.walletId } });
    if (!wallet?.address) {
      console.warn(`Skip ${row.id}: no wallet address`);
      continue;
    }
    const totalWei = BigInt(row.bccOwedWei) + BigInt(row.bonusBccWei ?? "0");
    const payout = await sendBcc(wallet.address, totalWei);
    if (!payout.ok) {
      console.error(`Failed ${row.id}:`, payout.error);
      await prisma.bccSettlement.update({
        where: { id: row.id },
        data: { note: `keeper_failed: ${payout.error}` },
      });
      continue;
    }
    if (!dryRun) {
      await prisma.bccSettlement.update({
        where: { id: row.id },
        data: {
          status: "credited",
          creditedAt: new Date(),
          note: `keeper_tx:${payout.txHash}`,
        },
      });
    }
    console.log(`Credited ${row.id} → ${wallet.address} (${totalWei} wei)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
