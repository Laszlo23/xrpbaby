#!/usr/bin/env node
/**
 * One-time import: landing + founding Mongo → Postgres (Prisma).
 *
 *   MONGO_LANDING_URL=mongodb://localhost:27017 \
 *   MONGO_LANDING_DB=buildingculture \
 *   MONGO_FOUNDING_URL=mongodb://localhost:27018 \
 *   MONGO_FOUNDING_DB=founding_builders \
 *   DATABASE_URL=postgresql://... \
 *   node scripts/migrate-mongo-to-postgres.mjs
 */
import { MongoClient } from "mongodb";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function importLanding(client) {
  const dbName = process.env.MONGO_LANDING_DB ?? "buildingculture";
  const db = client.db(dbName);
  const waitlist = db.collection("waitlist");
  const count = await waitlist.countDocuments();
  console.log(`landing waitlist: ${count} docs`);
  const cursor = waitlist.find({});
  for await (const doc of cursor) {
    const email = String(doc.email ?? "").toLowerCase();
    if (!email) continue;
    await prisma.waitlistEntry.upsert({
      where: { email },
      create: {
        email,
        name: doc.name ?? null,
        role: doc.role ?? null,
        source: doc.source ?? "landing_mongo",
      },
      update: {},
    });
  }
}

async function importFounding(client) {
  const dbName = process.env.MONGO_FOUNDING_DB ?? "founding_builders";
  const db = client.db(dbName);
  const users = db.collection("users");
  const count = await users.countDocuments();
  console.log(`founding users: ${count} docs`);
  const cursor = users.find({});
  for await (const doc of cursor) {
    const email = doc.email ? String(doc.email).toLowerCase() : null;
    const fid = doc.farcaster_fid ? Number(doc.farcaster_fid) : null;
    let walletId;
    let member = await prisma.member.findFirst({
      where: {
        OR: [
          email ? { email } : undefined,
          fid ? { farcasterFid: fid } : undefined,
        ].filter(Boolean),
      },
    });
    if (!member) {
      member = await prisma.member.create({
        data: {
          email,
          farcasterFid: fid,
          displayName: doc.username ?? null,
          supporterTier: (doc.founding_score ?? 0) > 100 ? "founding" : "community",
          forestStage: "sapling",
        },
      });
    }
    const xp = Number(doc.xp ?? 0);
    if (xp > 0 && email) {
      const w = await prisma.wallet.findFirst({ where: { address: email } });
      if (!w) {
        console.warn("skip xp (no wallet for email user)", email);
      }
    }
    if (doc.keys || doc.badges) {
      await prisma.rewardGrant.createMany({
        data: [
          ...(doc.keys ? [{ memberId: member.id, kind: "key", amount: Number(doc.keys) }] : []),
          ...(Array.isArray(doc.badges)
            ? doc.badges.map(() => ({ memberId: member.id, kind: "badge", amount: 1 }))
            : []),
        ],
        skipDuplicates: true,
      });
    }
    await prisma.activityEvent.create({
      data: {
        memberId: member.id,
        type: "mongo_import_founding_user",
        sourceModule: "founding",
        payload: { xp: doc.xp, founding_score: doc.founding_score },
      },
    });
  }
}

async function main() {
  const dryRun = process.env.DRY_RUN === "1";
  if (dryRun) console.log("DRY_RUN=1 — no writes");

  if (process.env.MONGO_LANDING_URL) {
    const c = new MongoClient(process.env.MONGO_LANDING_URL);
    await c.connect();
    if (!dryRun) await importLanding(c);
    await c.close();
  }

  if (process.env.MONGO_FOUNDING_URL) {
    const c = new MongoClient(process.env.MONGO_FOUNDING_URL);
    await c.connect();
    if (!dryRun) await importFounding(c);
    await c.close();
  }

  console.log("done");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
