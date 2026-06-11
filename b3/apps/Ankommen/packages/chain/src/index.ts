import { prisma } from "@ankommen/database";
import { createPublicClient, createWalletClient, http, parseEventLogs, type Hash } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {
  AUSTRIA_CHAIN_ID,
  bccAbi,
  bccToWei,
  getBccContractAddress,
  getChainConfig,
  getTreasuryAddress,
  weiToBcc,
} from "./config.js";

function getPublicClient() {
  return createPublicClient({
    chain: getChainConfig(),
    transport: http(getChainConfig().rpcUrls.default.http[0]),
  });
}

function getTreasuryWallet() {
  const key = process.env.BCC_TREASURY_PRIVATE_KEY;
  if (!key) return null;
  const account = privateKeyToAccount(key.startsWith("0x") ? (key as `0x${string}`) : (`0x${key}` as `0x${string}`));
  return createWalletClient({
    account,
    chain: getChainConfig(),
    transport: http(getChainConfig().rpcUrls.default.http[0]),
  });
}

export async function getBccBalance(address: `0x${string}`): Promise<bigint> {
  const contract = getBccContractAddress();
  if (!contract) return 0n;
  try {
    const client = getPublicClient();
    return await client.readContract({
      address: contract,
      abi: bccAbi,
      functionName: "balanceOf",
      args: [address],
    });
  } catch {
    return 0n;
  }
}

export async function getBccBalanceHuman(address: `0x${string}`): Promise<number> {
  return weiToBcc(await getBccBalance(address));
}

export async function mintBccTo(to: `0x${string}`, amountWhole: number): Promise<Hash | null> {
  const contract = getBccContractAddress();
  const wallet = getTreasuryWallet();
  if (!contract || !wallet) return null;

  const hash = await wallet.writeContract({
    chain: getChainConfig(),
    address: contract,
    abi: bccAbi,
    functionName: "mint",
    args: [to, bccToWei(amountWhole)],
  });

  const client = getPublicClient();
  await client.waitForTransactionReceipt({ hash });
  return hash;
}

export interface SettlePaymentInput {
  userId: string;
  paymentId: string;
  bccAmount: number;
  exchangeRate: string;
}

export async function settleBccForPayment(input: SettlePaymentInput): Promise<void> {
  const wallet = await prisma.walletAccount.findFirst({
    where: { userId: input.userId, isPrimary: true, chain: "austria" },
  });

  if (wallet && getBccContractAddress()) {
    try {
      const txHash = await mintBccTo(wallet.address as `0x${string}`, input.bccAmount);
      if (txHash) {
        await prisma.payment.update({
          where: { id: input.paymentId },
          data: {
            bccAmount: input.bccAmount,
            bccTxHash: txHash,
            settlementStatus: "CONFIRMED",
            exchangeRate: input.exchangeRate,
          },
        });
        return;
      }
    } catch {
      // fall through to escrow
    }
  }

  await prisma.bccEscrow.upsert({
    where: { userId: input.userId },
    create: { userId: input.userId, amount: input.bccAmount },
    update: { amount: { increment: input.bccAmount } },
  });

  await prisma.payment.update({
    where: { id: input.paymentId },
    data: {
      bccAmount: input.bccAmount,
      settlementStatus: "ESCROWED",
      exchangeRate: input.exchangeRate,
    },
  });
}

export async function claimEscrowToWallet(userId: string, walletAddress: `0x${string}`): Promise<Hash | null> {
  const escrow = await prisma.bccEscrow.findUnique({ where: { userId } });
  if (!escrow || escrow.amount <= 0) return null;

  const txHash = await mintBccTo(walletAddress, escrow.amount);
  if (!txHash) return null;

  await prisma.bccEscrow.update({
    where: { userId },
    data: { amount: 0 },
  });

  return txHash;
}

export async function verifyBccPaymentTx(
  txHash: Hash,
  fromAddress: `0x${string}`,
  minAmountWhole: number,
): Promise<boolean> {
  const contract = getBccContractAddress();
  const treasury = getTreasuryAddress();
  if (!contract || !treasury) return false;

  const client = getPublicClient();
  const receipt = await client.getTransactionReceipt({ hash: txHash });
  if (receipt.status !== "success") return false;

  const logs = parseEventLogs({
    abi: bccAbi,
    logs: receipt.logs,
    eventName: "Transfer",
  });

  const minWei = bccToWei(minAmountWhole);
  return logs.some(
    (log) =>
      log.args.from?.toLowerCase() === fromAddress.toLowerCase() &&
      log.args.to?.toLowerCase() === treasury.toLowerCase() &&
      (log.args.value ?? 0n) >= minWei,
  );
}

export async function isChainAvailable(): Promise<boolean> {
  try {
    const client = getPublicClient();
    const id = await client.getChainId();
    return id === AUSTRIA_CHAIN_ID;
  } catch {
    return false;
  }
}

export { AUSTRIA_CHAIN_ID, getBccContractAddress, getChainConfig, getTreasuryAddress, bccToWei, weiToBcc };
