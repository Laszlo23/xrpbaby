import type { PrismaClient } from "@prisma/client";

import { requireSiweAuth, type SiweAuthInput } from "@/server/platform/siwe";
import { ensureWalletAndMember } from "@/server/platform/member";
import { requireTelegramAuth } from "@/server/tg/auth-request";
import { ensureTelegramMember } from "@/server/tg/member";

export type FeedbackAuthResult =
  | {
      ok: true;
      memberId: string;
      walletId: string;
      source: "web" | "telegram";
    }
  | { ok: false; error: string; status: number };

export async function resolveFeedbackAuth(
  prisma: PrismaClient,
  request: Request,
  siweBody?: SiweAuthInput,
): Promise<FeedbackAuthResult> {
  const authHeader = request.headers.get("authorization") ?? "";
  if (authHeader.toLowerCase().startsWith("tma ")) {
    const tg = requireTelegramAuth(request);
    if (!tg.ok) return { ok: false, error: tg.error, status: tg.status };
    const member = await ensureTelegramMember(prisma, tg.initData.user, {
      allowSyntheticWallet: tg.initData.hash === "dev",
    });
    if (!member.walletId) return { ok: false, error: "no_wallet", status: 503 };
    return {
      ok: true,
      memberId: member.id,
      walletId: member.walletId,
      source: "telegram",
    };
  }

  if (!siweBody) return { ok: false, error: "auth_required", status: 401 };
  const auth = await requireSiweAuth(siweBody);
  if ("error" in auth) return { ok: false, error: auth.error, status: auth.status };
  const { wallet, member } = await ensureWalletAndMember(prisma, auth.address);
  return {
    ok: true,
    memberId: member.id,
    walletId: wallet.id,
    source: "web",
  };
}

export async function resolveFeedbackAuthByAddress(
  prisma: PrismaClient,
  request: Request,
  address?: string,
): Promise<FeedbackAuthResult> {
  const tgHeader = request.headers.get("authorization") ?? "";
  if (tgHeader.toLowerCase().startsWith("tma ")) {
    return resolveFeedbackAuth(prisma, request);
  }
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return { ok: false, error: "address_required", status: 400 };
  }
  const { wallet, member } = await ensureWalletAndMember(prisma, address);
  return {
    ok: true,
    memberId: member.id,
    walletId: wallet.id,
    source: "web",
  };
}

export function requireFeedbackAdmin(request: Request): boolean {
  const secret = process.env.FEEDBACK_ADMIN_SECRET?.trim();
  if (!secret) return false;
  const header = request.headers.get("x-feedback-admin-secret")?.trim();
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  return header === secret || bearer === secret;
}
