import { createHash } from "node:crypto";

import type { Member } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/db.server";
import {
  getProgramDay,
  getProgramStartDate,
  parseIdentityJson,
} from "@/lib/member-progress.server";
import {
  PROOF_REFLECTION_MIN_CHARS,
  PROOF_SCORE_THRESHOLD,
  PROOF_SCORE_WEIGHTS,
  type ProofSignals,
  type ProofSnapshotStatus,
} from "@/lib/proof-data";

export type ProofPeriod = {
  periodKey: string;
  periodStart: Date;
  periodEnd: Date;
  startDay: number;
  endDay: number;
};

export function getProofPeriod(member: Member, weekIndex?: number): ProofPeriod {
  const start = getProgramStartDate(member);
  const programDay = getProgramDay(member);
  const currentWeek = Math.floor(programDay / 7);
  const week = weekIndex ?? currentWeek;
  const startDay = week * 7;
  const endDay = startDay + 6;

  const periodStart = new Date(start);
  periodStart.setDate(periodStart.getDate() + startDay);
  periodStart.setHours(0, 0, 0, 0);

  const periodEnd = new Date(periodStart);
  periodEnd.setDate(periodEnd.getDate() + 6);
  periodEnd.setHours(23, 59, 59, 999);

  return {
    periodKey: `week-${week + 1}`,
    periodStart,
    periodEnd,
    startDay,
    endDay,
  };
}

function computeSignals(
  moodDays: number[],
  journalCount: number,
  completedSlugs: string[],
  streak: number,
  identitySigned: boolean,
): ProofSignals {
  const moodScore = Math.min(
    moodDays.length * PROOF_SCORE_WEIGHTS.moodDay,
    PROOF_SCORE_WEIGHTS.moodDayCap,
  );
  const journalScore = Math.min(
    journalCount * PROOF_SCORE_WEIGHTS.journalEntry,
    PROOF_SCORE_WEIGHTS.journalEntryCap,
  );
  const deliverableScore = completedSlugs.length * PROOF_SCORE_WEIGHTS.deliverable;
  const streakScore =
    Math.min(streak, PROOF_SCORE_WEIGHTS.streakCap) * PROOF_SCORE_WEIGHTS.streakDay;
  const identityScore = identitySigned ? PROOF_SCORE_WEIGHTS.identity : 0;

  return {
    moodDays: moodDays.length,
    moodScore,
    journalCount,
    journalScore,
    deliverableCount: completedSlugs.length,
    deliverableScore,
    streakScore,
    identityScore,
    completedSlugs,
    moodProgramDays: moodDays,
  };
}

function totalScore(signals: ProofSignals): number {
  const raw =
    signals.moodScore +
    signals.journalScore +
    signals.deliverableScore +
    signals.streakScore +
    signals.identityScore;
  return Math.min(100, raw);
}

function buildContentHash(
  memberId: string,
  periodKey: string,
  proofScore: number,
  signals: ProofSignals,
): string {
  const canonical = JSON.stringify({
    memberId,
    periodKey,
    proofScore,
    signals: {
      moodDays: signals.moodDays,
      journalCount: signals.journalCount,
      deliverableCount: signals.deliverableCount,
      completedSlugs: [...signals.completedSlugs].sort(),
      moodProgramDays: [...signals.moodProgramDays].sort((a, b) => a - b),
    },
  });
  return createHash("sha256").update(canonical).digest("hex");
}

function resolveStatus(
  proofScore: number,
  existingStatus: ProofSnapshotStatus | null,
  hasAnchor: boolean,
): ProofSnapshotStatus {
  if (hasAnchor || existingStatus === "anchored") return "anchored";
  if (proofScore >= PROOF_SCORE_THRESHOLD) return "eligible";
  return "draft";
}

export async function computeProofSnapshot(memberId: string, periodKey?: string) {
  const prisma = getPrisma();
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) throw new Error("Member not found");

  const programDay = getProgramDay(member);
  const weekIndex = periodKey
    ? Number.parseInt(periodKey.replace("week-", ""), 10) - 1
    : Math.floor(programDay / 7);
  const period = getProofPeriod(member, weekIndex);

  const existing = await prisma.proofSnapshot.findUnique({
    where: { memberId_periodKey: { memberId, periodKey: period.periodKey } },
    include: { anchor: true },
  });

  const moodRows = await prisma.moodCheckIn.findMany({
    where: {
      memberId,
      programDay: { gte: period.startDay, lte: period.endDay },
      morningAt: { not: null },
      eveningAt: { not: null },
    },
    orderBy: { programDay: "asc" },
  });
  const moodDays = moodRows.map((r) => r.programDay);

  const journals = await prisma.journalEntry.findMany({
    where: {
      memberId,
      dayNumber: { gte: period.startDay, lte: period.endDay },
    },
  });
  const journalCount = journals.filter(
    (j) => j.body.trim().length >= PROOF_SCORE_WEIGHTS.journalMinChars,
  ).length;

  const completedDeliverables = await prisma.memberDeliverable.findMany({
    where: {
      memberId,
      completedAt: { not: null },
      deliverable: { dayNumber: { gte: period.startDay, lte: period.endDay } },
    },
    include: { deliverable: true },
  });
  const completedSlugs = completedDeliverables.map((d) => d.deliverable.slug);

  const identity = parseIdentityJson(member.identityJson);
  const identitySigned = ["q1", "q2", "q3", "q4", "q5"].every((k) => identity[k]?.trim());

  const signals = computeSignals(
    moodDays,
    journalCount,
    completedSlugs,
    member.streak,
    identitySigned,
  );
  const proofScore = totalScore(signals);
  const contentHash = buildContentHash(memberId, period.periodKey, proofScore, signals);
  const status = resolveStatus(
    proofScore,
    (existing?.status as ProofSnapshotStatus) ?? null,
    existing?.anchor != null,
  );

  const snapshot = await prisma.proofSnapshot.upsert({
    where: { memberId_periodKey: { memberId, periodKey: period.periodKey } },
    create: {
      memberId,
      periodKey: period.periodKey,
      periodStart: period.periodStart,
      periodEnd: period.periodEnd,
      proofScore,
      signalsJson: JSON.stringify(signals),
      contentHash,
      status,
    },
    update: {
      periodStart: period.periodStart,
      periodEnd: period.periodEnd,
      proofScore,
      signalsJson: JSON.stringify(signals),
      contentHash,
      status,
    },
    include: { anchor: true },
  });

  return formatProofSnapshot(snapshot);
}

export function formatProofSnapshot(
  snapshot: {
    id: string;
    periodKey: string;
    periodStart: Date;
    periodEnd: Date;
    proofScore: number;
    signalsJson: string;
    contentHash: string;
    status: string;
    anchor?: { txSignature: string; walletAddress: string; anchoredAt: Date } | null;
  },
) {
  let signals: ProofSignals;
  try {
    signals = JSON.parse(snapshot.signalsJson) as ProofSignals;
  } catch {
    signals = {
      moodDays: 0,
      moodScore: 0,
      journalCount: 0,
      journalScore: 0,
      deliverableCount: 0,
      deliverableScore: 0,
      streakScore: 0,
      identityScore: 0,
      completedSlugs: [],
      moodProgramDays: [],
    };
  }

  return {
    id: snapshot.id,
    periodKey: snapshot.periodKey,
    periodStart: snapshot.periodStart.toISOString(),
    periodEnd: snapshot.periodEnd.toISOString(),
    proofScore: snapshot.proofScore,
    threshold: PROOF_SCORE_THRESHOLD,
    signals,
    contentHash: snapshot.contentHash,
    status: snapshot.status as ProofSnapshotStatus,
    txSignature: snapshot.anchor?.txSignature ?? null,
    walletAddress: snapshot.anchor?.walletAddress ?? null,
    anchoredAt: snapshot.anchor?.anchoredAt?.toISOString() ?? null,
  };
}

export async function getProofStatusForMember(memberId: string) {
  const prisma = getPrisma();
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) throw new Error("Member not found");

  const programDay = getProgramDay(member);
  const currentWeek = Math.floor(programDay / 7);

  await computeProofSnapshot(memberId);

  const snapshots = await prisma.proofSnapshot.findMany({
    where: {
      memberId,
      periodKey: {
        in: Array.from({ length: 5 }, (_, i) => `week-${currentWeek - i + 1}`).filter(
          (k) => Number.parseInt(k.replace("week-", ""), 10) >= 1,
        ),
      },
    },
    include: { anchor: true },
    orderBy: { periodKey: "desc" },
  });

  const current = snapshots.find((s) => s.periodKey === `week-${currentWeek + 1}`);

  return {
    walletAddress: member.walletAddress,
    current: current ? formatProofSnapshot(current) : null,
    history: snapshots.map(formatProofSnapshot),
  };
}

