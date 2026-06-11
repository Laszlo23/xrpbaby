import type { FastifyPluginAsync } from "fastify";
import { prisma, IdentityTier } from "@ankommen/database";
import { claimEscrowToWallet, getBccBalanceHuman, getTreasuryAddress } from "@ankommen/chain";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { verifyMessage } from "viem";

const challenges = new Map<string, { userId: string; message: string; expiresAt: number }>();

function buildSiweMessage(params: {
  address: string;
  chainId: number;
  nonce: string;
  uri: string;
}) {
  return `${params.uri} wants you to link your wallet to AustriaID 2.0:

Address: ${params.address}
Chain ID: ${params.chainId}
Nonce: ${params.nonce}

This request will not trigger a blockchain transaction or cost gas fees.`;
}

export const identityRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", app.authenticate);

  app.get("/status", async (request) => {
    const [profile, wallet, escrow] = await Promise.all([
      prisma.profile.findUnique({ where: { userId: request.user.sub } }),
      prisma.walletAccount.findFirst({
        where: { userId: request.user.sub, isPrimary: true },
      }),
      prisma.bccEscrow.findUnique({ where: { userId: request.user.sub } }),
    ]);

    let bccBalance: number | null = null;
    if (wallet) {
      bccBalance = await getBccBalanceHuman(wallet.address as `0x${string}`);
    }

    return {
      identityTier: profile?.identityTier ?? IdentityTier.GUEST,
      eidVerified: profile?.identityTier === IdentityTier.EID_VERIFIED,
      wallet: wallet
        ? {
            address: wallet.address,
            chain: wallet.chain,
            chainId: wallet.chainId,
            linkedAt: wallet.linkedAt,
          }
        : null,
      escrowedBcc: escrow?.amount ?? 0,
      bccBalance,
      treasuryAddress: getTreasuryAddress(),
    };
  });

  app.post("/wallet/challenge", async (request) => {
    const { address, chainId } = z
      .object({
        address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
        chainId: z.number().int().optional(),
      })
      .parse(request.body);

    const nonce = randomBytes(16).toString("hex");
    const uri = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const message = buildSiweMessage({
      address,
      chainId: chainId ?? Number(process.env.AUSTRIA_CHAIN_ID ?? 7777777),
      nonce,
      uri,
    });

    challenges.set(nonce, {
      userId: request.user.sub,
      message,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    return { message, nonce };
  });

  app.post("/wallet/verify", async (request, reply) => {
    const { address, signature, nonce } = z
      .object({
        address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
        signature: z.string().regex(/^0x[a-fA-F0-9]+$/),
        nonce: z.string(),
      })
      .parse(request.body);

    const challenge = challenges.get(nonce);
    if (!challenge || challenge.userId !== request.user.sub || challenge.expiresAt < Date.now()) {
      return reply.badRequest("Challenge expired or invalid");
    }

    const valid = await verifyMessage({
      address: address as `0x${string}`,
      message: challenge.message,
      signature: signature as `0x${string}`,
    });

    if (!valid) return reply.badRequest("Invalid signature");

    challenges.delete(nonce);

    await prisma.walletAccount.deleteMany({ where: { userId: request.user.sub } });
    await prisma.walletAccount.create({
      data: {
        userId: request.user.sub,
        address: address.toLowerCase(),
        chain: "austria",
        chainId: Number(process.env.AUSTRIA_CHAIN_ID ?? 7777777),
        isPrimary: true,
      },
    });

    await prisma.profile.upsert({
      where: { userId: request.user.sub },
      create: { userId: request.user.sub, identityTier: IdentityTier.WALLET },
      update: { identityTier: IdentityTier.WALLET },
    });

    const claimTx = await claimEscrowToWallet(request.user.sub, address as `0x${string}`);

    return { linked: true, address, claimTxHash: claimTx };
  });

  app.post("/eid/attest", async (request, reply) => {
    const { subjectHash } = z.object({ subjectHash: z.string().min(16).max(128) }).parse(request.body);

    const wallet = await prisma.walletAccount.findFirst({ where: { userId: request.user.sub } });
    if (!wallet) {
      return reply.badRequest("Link a wallet before eID attestation");
    }

    await prisma.profile.upsert({
      where: { userId: request.user.sub },
      create: {
        userId: request.user.sub,
        identityTier: IdentityTier.EID_VERIFIED,
        eidSubjectHash: subjectHash,
      },
      update: {
        identityTier: IdentityTier.EID_VERIFIED,
        eidSubjectHash: subjectHash,
      },
    });

    return { identityTier: IdentityTier.EID_VERIFIED };
  });
};
