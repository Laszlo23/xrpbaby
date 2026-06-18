import { randomBytes } from "node:crypto";

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().email(),
  referralCode: z.string().optional(),
});

function generateInviteCode(): string {
  return `BCID-${randomBytes(4).toString("hex").toUpperCase()}`;
}

export const Route = createFileRoute("/api/bcid/waitlist/convert")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { checkRateLimit, readJsonBody } = await import("@/server/platform/rate-limit");
        const limited = checkRateLimit(request, "bcid-waitlist-convert", 5);
        if (!limited.ok) {
          return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
        }

        const raw = await readJsonBody(request, 4096);
        if (!raw.ok) {
          return Response.json({ ok: false, error: raw.error }, { status: raw.status });
        }

        const parsed = bodySchema.safeParse(raw.body);
        if (!parsed.success) {
          return Response.json({ ok: false, error: "invalid_body" }, { status: 400 });
        }

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) {
          return Response.json({ ok: false, error: "database_unavailable" }, { status: 503 });
        }

        const email = parsed.data.email.toLowerCase();
        const waitlist = await prisma.waitlistEntry.findUnique({ where: { email } });
        if (!waitlist) {
          return Response.json({ ok: false, error: "not_on_waitlist" }, { status: 404 });
        }

        const existing = await prisma.bcidWaitlistInvite.findUnique({ where: { email } });
        if (existing?.convertedAt) {
          return Response.json({
            ok: true,
            inviteCode: existing.inviteCode,
            mintUrl: `/bcid/mint?invite=${existing.inviteCode}`,
            alreadyConverted: true,
          });
        }

        const inviteCode = existing?.inviteCode ?? generateInviteCode();
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        const invite = await prisma.bcidWaitlistInvite.upsert({
          where: { email },
          create: {
            email,
            inviteCode,
            referralCode: parsed.data.referralCode,
            expiresAt,
          },
          update: {
            referralCode: parsed.data.referralCode ?? undefined,
            expiresAt,
          },
        });

        const { getServerPublicOrigin } = await import("@/lib/app-origin");
        const origin = getServerPublicOrigin();

        return Response.json({
          ok: true,
          inviteCode: invite.inviteCode,
          mintUrl: `${origin}/bcid/mint?invite=${invite.inviteCode}`,
          expiresAt: invite.expiresAt.toISOString(),
        });
      },
    },
  },
  component: () => null,
});
