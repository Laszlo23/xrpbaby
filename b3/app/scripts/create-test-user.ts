/**
 * Internal QA helper: seed or reset a test member so the team can verify the
 * login / "choose your path" flow and the social-task buttons without needing
 * a real social account.
 *
 * Usage (run from app/):
 *   tsx scripts/create-test-user.ts                       # seed default onboarded test user
 *   tsx scripts/create-test-user.ts --address=0xABC...    # custom wallet
 *   tsx scripts/create-test-user.ts --intent=explorer     # intent: builder | explorer | gatherer
 *   tsx scripts/create-test-user.ts --tasks=follow-farcaster,x-reply-official
 *   tsx scripts/create-test-user.ts --reset               # clear intent + task ledger (re-test onboarding)
 *
 * To actually log in as this wallet locally, point a dev wallet at the address,
 * or run the app with VITE_WALLET_LEGACY_INJECTED=1 and connect an injected
 * wallet on that address.
 */
import { PrismaClient } from "@prisma/client";
import { loadAppEnv } from "./load-env.js";
import { ensureWalletAndMember } from "../src/server/platform/member.js";
import { creditPointsIdempotent } from "../src/server/points/credit-idempotent.js";

loadAppEnv();

const DEFAULT_ADDRESS = "0x000000000000000000000000000000000000c0de";

const TASK_POINTS: Record<string, number> = {
  "connect-wallet": 25,
  "visit-marketplace": 15,
  "follow-farcaster": 35,
  "like-cast-farcaster": 25,
  "share-app-farcaster": 40,
  "x-reply-official": 30,
  "x-retweet-official": 35,
  "x-quote-official": 40,
  "telegram-join-buildingculture": 45,
};

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : undefined;
}

function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

const prisma = new PrismaClient();

async function reset(address: string) {
  const wallet = await prisma.wallet.findUnique({ where: { address } });
  if (!wallet) {
    console.log(`No wallet row for ${address} — nothing to reset.`);
    return;
  }
  const ledgers = await prisma.pointLedger.findMany({
    where: { walletId: wallet.id, reason: { in: ["task_completion", "welcome_forest"] } },
    select: { id: true },
  });
  const ledgerIds = ledgers.map((l) => l.id);
  if (ledgerIds.length > 0) {
    await prisma.pointLedgerIdempotency.deleteMany({ where: { ledgerId: { in: ledgerIds } } });
    await prisma.pointLedger.deleteMany({ where: { id: { in: ledgerIds } } });
  }
  await prisma.member.updateMany({ where: { walletId: wallet.id }, data: { intent: null } });
  console.log(
    `Reset ${address}: cleared intent + removed ${ledgerIds.length} task/welcome ledger rows.`,
  );
  console.log("Visiting /join with this wallet should now show 'choose your path' again.");
}

async function seed(address: string) {
  const intent = arg("intent") ?? "builder";
  const tasks = (arg("tasks") ?? "connect-wallet,follow-farcaster")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const { wallet, member } = await ensureWalletAndMember(prisma, address, { intent });
  console.log(`Member ${member.id} ready (intent=${intent}, wallet=${address}).`);

  for (const slug of tasks) {
    const points = TASK_POINTS[slug] ?? 10;
    const res = await creditPointsIdempotent(prisma, {
      walletId: wallet.id,
      delta: points,
      reason: "task_completion",
      taskSlug: slug,
      idempotencyKey: `test-user:${wallet.id}:${slug}`,
    });
    console.log(
      `  task ${slug}: ${res.alreadyCredited ? "already credited" : `+${points}`} (${points} pts)`,
    );
  }

  const balance = await prisma.pointLedger.aggregate({
    where: { walletId: wallet.id },
    _sum: { delta: true },
  });
  console.log(`Balance: ${balance._sum.delta ?? 0} Culture Points.`);
  console.log("This wallet is onboarded — /join should redirect to /forest.");
}

async function main() {
  const address = (arg("address") ?? DEFAULT_ADDRESS).toLowerCase();
  if (!/^0x[a-f0-9]{40}$/.test(address)) {
    throw new Error(`Invalid address: ${address}`);
  }
  if (flag("reset")) {
    await reset(address);
  } else {
    await seed(address);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
