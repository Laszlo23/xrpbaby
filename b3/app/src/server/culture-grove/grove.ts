import type { Member, PrismaClient } from "@prisma/client";
import { keccak256, toBytes, type Address } from "viem";

import { groveOriginStory } from "@/lib/culture-grove/story";
import { dnaHueFromAddress } from "@/lib/culture-grove/dna";
import type {
  GroveTreeNode,
  GroveTreePayload,
  TwinBloomNftStatus,
} from "@/lib/culture-grove/types";
import { logActivity } from "@/server/platform/member";

const TWIN_BLOOM_TARGET = 2;
const GROVE_TREE_MAX_DEPTH = 3;
const GROVE_ELDER_THRESHOLD = 8;
const GROVE_SEED_POINTS = 25;
const TWIN_BLOOM_POINTS = 100;

type MemberSlice = Pick<
  Member,
  "id" | "displayName" | "farcasterUsername" | "walletAddress" | "forestStage"
>;

function redactLabel(m: MemberSlice): string {
  if (m.farcasterUsername) return `@${m.farcasterUsername}`;
  if (m.displayName?.trim()) return m.displayName.trim().slice(0, 16);
  const w = m.walletAddress;
  if (w) return `${w.slice(0, 6)}…${w.slice(-4)}`;
  return `Seed · ${m.forestStage}`;
}

function memberHue(m: MemberSlice): number {
  if (m.walletAddress) return dnaHueFromAddress(m.walletAddress);
  return dnaHueFromAddress(m.id);
}

function groveTwinBloomClaimDigest(inviterMemberId: string): `0x${string}` {
  return keccak256(toBytes(`grove-twin-bloom:${inviterMemberId}`));
}

export async function resolveMemberIdFromAgentRef(
  prisma: PrismaClient,
  agentRef: string,
): Promise<string | null> {
  const ref = agentRef.trim().toLowerCase();
  if (!ref || !/^[a-f0-9]+$/.test(ref)) return null;

  const wallet = await prisma.wallet.findFirst({
    where: { address: { startsWith: `0x${ref}` } },
    include: { member: true },
  });
  if (wallet?.member) return wallet.member.id;

  const member = await prisma.member.findFirst({
    where: { walletAddress: { startsWith: `0x${ref}` } },
  });
  return member?.id ?? null;
}

async function grantGrovePoints(
  prisma: PrismaClient,
  walletId: string,
  memberId: string,
  reason: string,
  taskSlug: string,
  delta: number,
): Promise<boolean> {
  const existing = await prisma.pointLedger.findFirst({
    where: { walletId, reason },
  });
  if (existing) return false;

  await prisma.pointLedger.create({
    data: { walletId, delta, reason, taskSlug },
  });
  await logActivity(prisma, {
    memberId,
    type: `task_completion:${taskSlug}`,
    sourceModule: "culture-grove",
    payload: { taskSlug, points: delta },
  });
  return true;
}

async function mintTwinBloomNftIfEligible(
  prisma: PrismaClient,
  inviterMemberId: string,
  inviterWalletId: string,
  inviterWalletAddress: string,
  directCount: number,
): Promise<void> {
  if (directCount < TWIN_BLOOM_TARGET) return;

  const existing = await prisma.groveTwinBloomNftClaim.findUnique({
    where: { memberId: inviterMemberId },
  });
  if (existing?.status === "minted") return;

  const claimDigest = groveTwinBloomClaimDigest(inviterMemberId);
  const claimDigestHex = claimDigest.slice(2);

  const claimRow =
    existing ??
    (await prisma.groveTwinBloomNftClaim.create({
      data: {
        memberId: inviterMemberId,
        walletId: inviterWalletId,
        claimDigest: claimDigestHex,
        status: "pending",
      },
    }));

  if (claimRow.status === "minted") return;

  const { tryMintGroveTwinBloomNft } = await import("@/server/wallet/grove-twin-bloom-mint");
  const mint = await tryMintGroveTwinBloomNft({
    to: inviterWalletAddress as Address,
    claimDigest,
  });

  if (mint.ok) {
    await prisma.groveTwinBloomNftClaim.update({
      where: { id: claimRow.id },
      data: {
        status: "minted",
        chainId: mint.chainId,
        contractAddress: mint.contractAddress,
        txHash: mint.txHash,
        tokenId: mint.tokenId,
        mintedAt: new Date(),
      },
    });
    await logActivity(prisma, {
      memberId: inviterMemberId,
      type: "grove:twin_bloom_nft_minted",
      sourceModule: "culture-grove",
      payload: {
        txHash: mint.txHash,
        tokenId: mint.tokenId,
        contractAddress: mint.contractAddress,
      },
    });
    return;
  }

  if (mint.mode === "disabled" || mint.mode === "not_configured") {
    return;
  }

  await prisma.groveTwinBloomNftClaim.update({
    where: { id: claimRow.id },
    data: { status: "failed" },
  });
}

export async function recordCultureGroveLink(
  prisma: PrismaClient,
  inviteeMemberId: string,
  inviteeWalletId: string,
  agentRef?: string,
): Promise<{ linked: boolean; inviterMemberId?: string }> {
  if (!agentRef?.trim()) return { linked: false };

  const inviterMemberId = await resolveMemberIdFromAgentRef(prisma, agentRef);
  if (!inviterMemberId || inviterMemberId === inviteeMemberId) {
    return { linked: false };
  }

  const existing = await prisma.cultureGroveLink.findUnique({
    where: { inviteeMemberId },
  });
  if (existing) return { linked: false, inviterMemberId: existing.inviterMemberId };

  const invitee = await prisma.member.findUnique({ where: { id: inviteeMemberId } });
  const hue = invitee?.walletAddress
    ? dnaHueFromAddress(invitee.walletAddress)
    : dnaHueFromAddress(inviteeMemberId);

  await prisma.cultureGroveLink.create({
    data: {
      inviterMemberId,
      inviteeMemberId,
      agentRef: agentRef.trim().toLowerCase(),
      dnaHue: hue,
    },
  });

  await logActivity(prisma, {
    memberId: inviteeMemberId,
    type: "culture_grove_link",
    sourceModule: "culture-grove",
    payload: { inviterMemberId, agentRef },
  });

  await grantGrovePoints(
    prisma,
    inviteeWalletId,
    inviteeMemberId,
    "grove_seed_welcome",
    "grove-seed-welcome",
    GROVE_SEED_POINTS,
  );

  const inviter = await prisma.member.findUnique({
    where: { id: inviterMemberId },
    include: { wallet: true },
  });
  if (inviter?.walletId && inviter.wallet) {
    const directCount = await prisma.cultureGroveLink.count({
      where: { inviterMemberId },
    });
    if (directCount >= TWIN_BLOOM_TARGET) {
      await grantGrovePoints(
        prisma,
        inviter.walletId,
        inviterMemberId,
        "grove_twin_bloom",
        "grove-twin-bloom",
        TWIN_BLOOM_POINTS,
      );
      if (directCount === TWIN_BLOOM_TARGET && inviter.forestStage === "seedling") {
        await prisma.member.update({
          where: { id: inviterMemberId },
          data: { forestStage: "sapling" },
        });
      }
      await mintTwinBloomNftIfEligible(
        prisma,
        inviterMemberId,
        inviter.walletId,
        inviter.wallet.address,
        directCount,
      );
    }
  }

  return { linked: true, inviterMemberId };
}

async function buildNode(
  prisma: PrismaClient,
  member: MemberSlice,
  depth: number,
  maxDepth: number,
): Promise<GroveTreeNode> {
  const children: GroveTreeNode[] = [];
  if (depth < maxDepth) {
    const links = await prisma.cultureGroveLink.findMany({
      where: { inviterMemberId: member.id },
      orderBy: { createdAt: "asc" },
      take: 8,
    });
    for (const link of links) {
      const child = await prisma.member.findUnique({ where: { id: link.inviteeMemberId } });
      if (!child) continue;
      children.push(await buildNode(prisma, child, depth + 1, maxDepth));
    }
  }

  return {
    id: member.id,
    label: redactLabel(member),
    hue: memberHue(member),
    forestStage: member.forestStage,
    children,
  };
}

function emptySlot(index: number): GroveTreeNode {
  return {
    id: `empty-${index}`,
    label: "Invite slot",
    hue: 160,
    forestStage: "seedling",
    isEmptySlot: true,
    children: [],
  };
}

function mapTwinBloomNftStatus(
  claim: { status: string; txHash: string | null; tokenId: string | null } | null,
): TwinBloomNftStatus {
  if (!claim) return { status: "none" };
  if (claim.status === "minted") {
    return {
      status: "minted",
      txHash: claim.txHash ?? undefined,
      tokenId: claim.tokenId ?? undefined,
    };
  }
  if (claim.status === "pending") return { status: "pending" };
  if (claim.status === "failed") return { status: "failed" };
  return { status: "none" };
}

export async function getCultureGroveTree(
  prisma: PrismaClient,
  memberId: string,
): Promise<GroveTreePayload | null> {
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) return null;

  const self = await buildNode(prisma, member, 0, GROVE_TREE_MAX_DEPTH);
  self.isYou = true;

  const directCount = await prisma.cultureGroveLink.count({
    where: { inviterMemberId: memberId },
  });

  while (self.children.length < TWIN_BLOOM_TARGET) {
    self.children.push(emptySlot(self.children.length));
  }

  const totalDescendants = await countDescendants(prisma, memberId, GROVE_TREE_MAX_DEPTH);
  const isGroveElder = totalDescendants >= GROVE_ELDER_THRESHOLD;

  const received = await prisma.cultureGroveLink.findUnique({
    where: { inviteeMemberId: memberId },
    include: { inviter: true },
  });

  const nftClaim = await prisma.groveTwinBloomNftClaim.findUnique({
    where: { memberId },
    select: { status: true, txHash: true, tokenId: true },
  });

  return {
    ok: true,
    self,
    directCount,
    totalDescendants,
    twinBloomUnlocked: directCount >= TWIN_BLOOM_TARGET,
    isGroveElder,
    twinBloomNft: mapTwinBloomNftStatus(nftClaim),
    inviterLabel: received?.inviter ? redactLabel(received.inviter) : null,
    story: groveOriginStory(directCount, totalDescendants, isGroveElder),
  };
}

async function countDescendants(
  prisma: PrismaClient,
  memberId: string,
  maxDepth: number,
): Promise<number> {
  if (maxDepth <= 0) return 0;
  const direct = await prisma.cultureGroveLink.findMany({
    where: { inviterMemberId: memberId },
    select: { inviteeMemberId: true },
  });
  let total = direct.length;
  for (const row of direct) {
    total += await countDescendants(prisma, row.inviteeMemberId, maxDepth - 1);
  }
  return total;
}

export async function getMemberIdByWallet(
  prisma: PrismaClient,
  address: string,
): Promise<string | null> {
  const normalized = address.toLowerCase();
  const wallet = await prisma.wallet.findUnique({
    where: { address: normalized },
    include: { member: true },
  });
  if (wallet?.member) return wallet.member.id;

  const member = await prisma.member.findFirst({
    where: { walletAddress: normalized },
  });
  return member?.id ?? null;
}
