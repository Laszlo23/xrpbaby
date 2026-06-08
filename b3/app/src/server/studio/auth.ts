import type { Member, PrismaClient } from "@prisma/client";

import { verifyPrivyAccessToken } from "@/server/wallet/privy-auth";
import { ensureWalletAndMember } from "@/server/platform/member";

export type StudioAuthContext = {
  member: Member;
  walletId: string;
  privyUserId?: string;
};

export async function resolveStudioAuth(
  prisma: PrismaClient,
  authorizationHeader: string | null,
  walletAddress: string,
): Promise<StudioAuthContext | { error: string; status: number }> {
  const addr = walletAddress.trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
    return { error: "invalid_wallet", status: 400 };
  }

  const privyConfigured =
    Boolean(process.env.PRIVY_APP_ID?.trim() || process.env.VITE_PRIVY_APP_ID?.trim()) &&
    Boolean(process.env.PRIVY_APP_SECRET?.trim());

  let privyUserId: string | undefined;
  if (authorizationHeader?.startsWith("Bearer ")) {
    const auth = await verifyPrivyAccessToken(authorizationHeader);
    if (privyConfigured && !("userId" in auth)) {
      return { error: auth.error, status: auth.status };
    }
    privyUserId = "userId" in auth ? auth.userId : undefined;
  } else if (privyConfigured) {
    return { error: "missing_token", status: 401 };
  }

  const { wallet, member } = await ensureWalletAndMember(prisma, addr, { privyUserId });

  return { member, walletId: wallet.id, privyUserId };
}
