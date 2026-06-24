import { randomBytes } from "node:crypto";

import type { PrismaClient } from "@prisma/client";

import {
  isIdentityTeamWallet,
  PROMO_MIN_LEN,
  validateHandleForPromoMintWallet,
} from "@/lib/identity/handle-policy";
import { IDENTITY_LAUNCH_REFERRAL_CODE } from "@/lib/identity/referral-constants";
import { ensureWalletAndMember } from "@/server/platform/member";
import { recordCultureMemoryEvent } from "@/server/memory/timeline";
import { ensureDefaultTasks } from "@/server/points/tasks";

export const IDENTITY_REFERRAL_CODES_PER_BATCH = 7;
export { IDENTITY_LAUNCH_REFERRAL_CODE };
export const IDENTITY_REFERRAL_BCC_LOCKED_KIND = "identity_referral_bcc_locked";

/** Server-only team code — never expose in client bundles; override via env in production. */
const DEFAULT_TEAM_REFERRAL_CODE = "CULT4K7XM9";

export type ReferralValidateResult =
  | {
      ok: true;
      code: string;
      codeId: string;
      ownerWallet: string;
      isLaunchCode: boolean;
    }
  | { ok: false; error: string };

export type ReferralConsumeResult =
  | {
      ok: true;
      referrerWallet: string;
      codesIssued: number;
      batchComplete: boolean;
      lockedBccWei: string;
      referralMintPoints?: number;
    }
  | { ok: false; error: string };

function normalizeWallet(w: string): string {
  return w.trim().toLowerCase();
}

function normalizeCode(c: string): string {
  return c.trim().toUpperCase();
}

export function launchReferralCode(): string {
  return (
    process.env.IDENTITY_LAUNCH_REFERRAL_CODE?.trim().toUpperCase() || IDENTITY_LAUNCH_REFERRAL_CODE
  );
}

export function teamReferralCode(): string {
  return (
    process.env.IDENTITY_TEAM_REFERRAL_CODE?.trim().toUpperCase() || DEFAULT_TEAM_REFERRAL_CODE
  );
}

export function isTeamReferralCode(code: string): boolean {
  return normalizeCode(code) === teamReferralCode();
}

export function referralBccWeiPerSuccess(): bigint {
  const raw = process.env.IDENTITY_REFERRAL_BCC_WEI?.trim() || "770000000000000000";
  try {
    return BigInt(raw);
  } catch {
    return 770000000000000000n;
  }
}

function generateReferralCode(prefix: string): string {
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}${suffix}`.slice(0, 12);
}

export async function ensureLaunchReferralCode(prisma: PrismaClient): Promise<void> {
  const code = launchReferralCode();
  const owner =
    process.env.IDENTITY_REFERRAL_LAUNCH_OWNER?.trim().toLowerCase() ||
    "0x0000000000000000000000000000000000000000";

  await prisma.identityReferralCode.upsert({
    where: { code },
    create: {
      id: `launch_${code.toLowerCase()}`,
      code,
      ownerWallet: owner,
      batchIndex: -1,
      status: "active",
    },
    update: {},
  });
}

export async function ensureTeamReferralCode(prisma: PrismaClient): Promise<void> {
  const code = teamReferralCode();
  const owner =
    process.env.IDENTITY_REFERRAL_TEAM_OWNER?.trim().toLowerCase() ||
    "0x0000000000000000000000000000000000000000";

  await prisma.identityReferralCode.upsert({
    where: { code },
    create: {
      id: `team_${code.toLowerCase()}`,
      code,
      ownerWallet: owner,
      batchIndex: -2,
      status: "active",
    },
    update: { status: "active" },
  });
}

export async function validateReferralForMint(
  prisma: PrismaClient,
  input: { wallet: string; code: string; handle: string },
): Promise<ReferralValidateResult> {
  const policy = validateHandleForPromoMintWallet(
    input.handle.split(".")[0] ?? input.handle,
    input.wallet,
  );
  if (!policy.ok) {
    return { ok: false, error: policy.error };
  }

  const wallet = normalizeWallet(input.wallet);
  const code = normalizeCode(input.code);

  if (isTeamReferralCode(code)) {
    return { ok: false, error: "code_invalid" };
  }

  await ensureLaunchReferralCode(prisma);

  const existingRedemption = await prisma.identityReferralRedemption.findUnique({
    where: { wallet },
  });
  if (existingRedemption) {
    return { ok: false, error: "already_redeemed" };
  }

  const row = await prisma.identityReferralCode.findUnique({ where: { code } });
  if (!row || row.status !== "active") {
    return { ok: false, error: "code_invalid" };
  }

  return {
    ok: true,
    code: row.code,
    codeId: row.id,
    ownerWallet: row.ownerWallet,
    isLaunchCode: row.batchIndex < 0,
  };
}

async function creditTaskOnce(
  prisma: PrismaClient,
  walletId: string,
  memberId: string | undefined,
  taskSlug: string,
  points: number,
): Promise<boolean> {
  const existing = await prisma.pointLedger.findFirst({
    where: { walletId, taskSlug, reason: "task_completion" },
  });
  if (existing) return false;
  if (points > 0) {
    await prisma.pointLedger.create({
      data: { walletId, delta: points, reason: "task_completion", taskSlug },
    });
  }
  const { logTaskCompletionActivity } = await import("@/server/points/task-completion-events");
  await logTaskCompletionActivity(prisma, { memberId, taskSlug });
  return true;
}

async function accrueLockedBccReferrer(
  prisma: PrismaClient,
  referrerWallet: string,
  amountWei: bigint,
  metadata: Record<string, unknown>,
): Promise<void> {
  if (referrerWallet === "0x0000000000000000000000000000000000000000") return;

  const { member } = await ensureWalletAndMember(prisma, referrerWallet);
  await prisma.rewardGrant.create({
    data: {
      memberId: member.id,
      kind: IDENTITY_REFERRAL_BCC_LOCKED_KIND,
      amount: 1,
      metadata: {
        amountWei: amountWei.toString(),
        status: "locked",
        ...metadata,
      },
    },
  });
}

export async function issueReferralBatch(
  prisma: PrismaClient,
  ownerWallet: string,
  batchIndex: number,
): Promise<string[]> {
  const owner = normalizeWallet(ownerWallet);
  const prefix = owner.slice(2, 6).toUpperCase();
  const codes: string[] = [];

  for (let i = 0; i < IDENTITY_REFERRAL_CODES_PER_BATCH; i++) {
    let code = generateReferralCode(prefix);
    let attempts = 0;
    while (attempts < 8) {
      const exists = await prisma.identityReferralCode.findUnique({ where: { code } });
      if (!exists) break;
      code = generateReferralCode(prefix);
      attempts++;
    }
    await prisma.identityReferralCode.create({
      data: {
        code,
        ownerWallet: owner,
        batchIndex,
        status: "active",
      },
    });
    codes.push(code);
  }

  return codes;
}

export async function listReferralCodesForWallet(
  prisma: PrismaClient,
  wallet: string,
): Promise<{
  codes: Array<{ code: string; status: string; batchIndex: number }>;
  lockedBccWei: string;
}> {
  const owner = normalizeWallet(wallet);
  const rows = await prisma.identityReferralCode.findMany({
    where: { ownerWallet: owner, batchIndex: { gte: 0 } },
    orderBy: [{ batchIndex: "asc" }, { createdAt: "asc" }],
  });

  const { member } = await ensureWalletAndMember(prisma, owner).catch(() => ({
    member: null as { id: string } | null,
  }));

  let lockedBccWei = 0n;
  if (member) {
    const grants = await prisma.rewardGrant.findMany({
      where: { memberId: member.id, kind: IDENTITY_REFERRAL_BCC_LOCKED_KIND },
    });
    for (const g of grants) {
      const meta = g.metadata as { amountWei?: string } | null;
      if (meta?.amountWei) {
        try {
          lockedBccWei += BigInt(meta.amountWei);
        } catch {
          /* skip */
        }
      }
    }
  }

  return {
    codes: rows.map((r) => ({
      code: r.code,
      status: r.status,
      batchIndex: r.batchIndex,
    })),
    lockedBccWei: lockedBccWei.toString(),
  };
}

export async function consumeReferralOnSync(
  prisma: PrismaClient,
  input: {
    wallet: string;
    code: string;
    mintHandle: string;
    tokenId?: number;
  },
): Promise<ReferralConsumeResult> {
  await ensureDefaultTasks(prisma);

  const wallet = normalizeWallet(input.wallet);
  const code = normalizeCode(input.code);
  const handlePart = input.mintHandle.split(".")[0] ?? input.mintHandle;
  if (handlePart.length < PROMO_MIN_LEN && !isIdentityTeamWallet(wallet)) {
    return { ok: false, error: "handle_too_short" };
  }

  if (isTeamReferralCode(code)) {
    return { ok: false, error: "code_invalid" };
  }

  if (isIdentityTeamWallet(wallet)) {
    return {
      ok: true,
      referrerWallet: "0x0000000000000000000000000000000000000000",
      codesIssued: 0,
      batchComplete: false,
      lockedBccWei: "0",
      referralMintPoints: 0,
    };
  }

  const existingRedemption = await prisma.identityReferralRedemption.findUnique({
    where: { wallet },
  });
  if (existingRedemption) {
    const codeRow = existingRedemption.codeId
      ? await prisma.identityReferralCode.findUnique({ where: { id: existingRedemption.codeId } })
      : await prisma.identityReferralCode.findUnique({ where: { code: existingRedemption.code } });
    return {
      ok: true,
      referrerWallet: codeRow?.ownerWallet ?? "0x0000000000000000000000000000000000000000",
      codesIssued: 0,
      batchComplete: false,
      lockedBccWei: "0",
      referralMintPoints: 0,
    };
  }

  const validation = await validateReferralForMint(prisma, {
    wallet: input.wallet,
    code: input.code,
    handle: handlePart,
  });
  if (!validation.ok) {
    return { ok: false, error: validation.error };
  }

  const bccWei = referralBccWeiPerSuccess();

  const result = await prisma.$transaction(async (tx) => {
    const row = await tx.identityReferralCode.findUnique({
      where: { code: validation.code },
    });
    if (!row || row.status !== "active") {
      return { ok: false as const, error: "code_invalid" };
    }

    await tx.identityReferralCode.update({
      where: { id: row.id },
      data: {
        status: "consumed",
        consumedBy: wallet,
        consumedAt: new Date(),
        mintHandle: input.mintHandle.toLowerCase(),
      },
    });

    await tx.identityReferralRedemption.create({
      data: {
        wallet,
        code: row.code,
        codeId: row.id,
        mintHandle: input.mintHandle.toLowerCase(),
        tokenId: input.tokenId ?? null,
      },
    });

    return { ok: true as const, row };
  });

  if (!result.ok) {
    return result;
  }

  const referrerWallet = result.row.ownerWallet;
  await accrueLockedBccReferrer(prisma, referrerWallet, bccWei, {
    code: result.row.code,
    mintHandle: input.mintHandle,
    referee: wallet,
  });

  const { wallet: refereeWallet, member } = await ensureWalletAndMember(prisma, wallet);
  await creditTaskOnce(prisma, refereeWallet.id, member?.id, "identity-referral-mint", 25);

  let codesIssued = 0;
  const existingBatch = await prisma.identityReferralCode.count({
    where: { ownerWallet: wallet, batchIndex: { gte: 0 } },
  });
  if (existingBatch === 0) {
    await issueReferralBatch(prisma, wallet, 0);
    codesIssued = IDENTITY_REFERRAL_CODES_PER_BATCH;
  }

  let batchComplete = false;
  if (
    referrerWallet !== "0x0000000000000000000000000000000000000000" &&
    result.row.batchIndex >= 0
  ) {
    const activeInBatch = await prisma.identityReferralCode.count({
      where: {
        ownerWallet: referrerWallet,
        batchIndex: result.row.batchIndex,
        status: "active",
      },
    });
    if (activeInBatch === 0) {
      batchComplete = true;
      const nextBatch = result.row.batchIndex + 1;
      await issueReferralBatch(prisma, referrerWallet, nextBatch);
      const { wallet: refWallet, member: refMember } = await ensureWalletAndMember(
        prisma,
        referrerWallet,
      );
      await creditTaskOnce(
        prisma,
        refWallet.id,
        refMember?.id,
        "identity-referral-batch-complete",
        77,
      );
    }
  }

  await recordCultureMemoryEvent({
    wallet,
    type: "identity_referral_redeemed",
    payload: {
      code: result.row.code,
      mintHandle: input.mintHandle,
      referrerWallet,
      lockedBccWei: bccWei.toString(),
    },
  });

  return {
    ok: true,
    referrerWallet,
    codesIssued,
    batchComplete,
    lockedBccWei: bccWei.toString(),
    referralMintPoints: 25,
  };
}

export async function recordReferralShare(
  prisma: PrismaClient,
  wallet: string,
): Promise<{ ok: boolean; pointsGranted: number }> {
  await ensureDefaultTasks(prisma);
  const { wallet: w, member } = await ensureWalletAndMember(prisma, wallet);
  const credited = await creditTaskOnce(prisma, w.id, member?.id, "identity-referral-share", 15);
  return { ok: true, pointsGranted: credited ? 15 : 0 };
}
