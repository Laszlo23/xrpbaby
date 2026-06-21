/**
 * Create a single-use identity referral code for a wallet.
 *
 * Usage:
 *   DATABASE_URL=... tsx scripts/create-identity-referral-code.ts \
 *     --wallet 0x502ce9FB1814cb03843967EC5E0D8F6AA3A3C2e1 \
 *     --code TEAM50277
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function parseArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1]?.trim();
}

async function main() {
  const wallet = parseArg("--wallet")?.toLowerCase();
  const code = parseArg("--code")?.toUpperCase();

  if (!wallet || !/^0x[a-f0-9]{40}$/.test(wallet)) {
    throw new Error("Pass --wallet 0x + 40 hex");
  }
  if (!code || code.length < 4 || code.length > 12) {
    throw new Error("Pass --code (4–12 chars, e.g. TEAM50277)");
  }

  const existing = await prisma.identityReferralRedemption.findUnique({ where: { wallet } });
  if (existing) {
    console.log(
      JSON.stringify({
        ok: false,
        error: "wallet_already_redeemed",
        wallet,
        priorCode: existing.code,
        mintHandle: existing.mintHandle,
      }),
    );
    return;
  }

  const row = await prisma.identityReferralCode.upsert({
    where: { code },
    create: {
      id: `manual_${code.toLowerCase()}`,
      code,
      ownerWallet: wallet,
      batchIndex: 0,
      status: "active",
    },
    update: {
      ownerWallet: wallet,
      status: "active",
      consumedBy: null,
      consumedAt: null,
      mintHandle: null,
    },
  });

  console.log(
    JSON.stringify({
      ok: true,
      code: row.code,
      ownerWallet: row.ownerWallet,
      status: row.status,
      passUrl: `https://app.buildingcultureid.space/pass?ref=${row.code}`,
    }),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
