import { createHash } from "node:crypto";
import type { Prisma, PrismaClient } from "@prisma/client";

/** Telegram mini-app synthetic wallet — not redeemable for on-chain BCC. */
export function syntheticWalletAddressForTelegram(userId: number): string {
  const digest = createHash("sha256").update(`tg:${userId}`).digest("hex").slice(0, 40);
  return `0x${digest}`;
}

/** True when this wallet row is a Telegram-only synthetic placeholder. */
export async function isSyntheticTelegramWallet(
  prisma: PrismaClient | Prisma.TransactionClient,
  walletId: string,
  address: string,
): Promise<boolean> {
  const normalized = address.toLowerCase();
  const member = await prisma.member.findFirst({
    where: { walletId },
    include: { socialAccounts: { where: { platform: "telegram" } } },
  });
  if (!member?.socialAccounts.length) return false;
  for (const sa of member.socialAccounts) {
    const tgId = Number(sa.externalId);
    if (Number.isFinite(tgId) && syntheticWalletAddressForTelegram(tgId) === normalized) {
      return true;
    }
  }
  return false;
}
