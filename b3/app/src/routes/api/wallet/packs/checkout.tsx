import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import Stripe from "stripe";
import { getPackBySlug } from "@/lib/packs";
import { checkRateLimit, readJsonBody } from "@/server/platform/rate-limit";
import { verifyPrivyAccessToken } from "@/server/wallet/privy-auth";

const bodySchema = z.object({
  packSlug: z.string().min(1),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

function platformOrigin(): string {
  return (
    process.env.VITE_PLATFORM_ORIGIN?.trim() ||
    process.env.PLATFORM_ORIGIN?.trim() ||
    "http://localhost:5173"
  ).replace(/\/$/, "");
}

export const Route = createFileRoute("/api/wallet/packs/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const limited = checkRateLimit(request, "pack-checkout", 15);
        if (!limited.ok) {
          return json({ ok: false, error: "rate_limited" }, 429);
        }

        const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
        if (!stripeKey) {
          return json({ ok: false, error: "stripe_not_configured" }, 503);
        }

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) {
          return json({ ok: false, error: "no_database" }, 503);
        }

        const raw = await readJsonBody(request);
        if (!raw.ok) {
          return json({ ok: false, error: raw.error }, raw.status);
        }
        const parsed = bodySchema.safeParse(raw.body);
        if (!parsed.success) {
          return json({ ok: false, error: "invalid_body" }, 400);
        }

        const pack = getPackBySlug(parsed.data.packSlug);
        if (!pack) {
          return json({ ok: false, error: "unknown_pack" }, 400);
        }

        const auth = await verifyPrivyAccessToken(request.headers.get("authorization"));
        const privyUserId = "userId" in auth ? auth.userId : undefined;

        const { ensureWalletAndMember } = await import("@/server/platform/member");
        const { member, wallet } = await ensureWalletAndMember(
          prisma,
          parsed.data.walletAddress,
          { privyUserId },
        );

        const origin = platformOrigin();
        const stripe = new Stripe(stripeKey);

        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          client_reference_id: member.id,
          customer_email: member.email ?? undefined,
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency: "usd",
                unit_amount: pack.usdCents,
                product_data: {
                  name: `${pack.label} Culture Pack`,
                  description: `${pack.culturePoints.toLocaleString("en-US")} Culture Points`,
                },
              },
            },
          ],
          metadata: {
            packSlug: pack.slug,
            wallet: wallet.address,
            memberId: member.id,
            points: String(pack.culturePoints),
          },
          success_url: `${origin}/wallet/packs?checkout=success&pack=${pack.slug}`,
          cancel_url: `${origin}/wallet/packs?checkout=cancel`,
        });

        if (!session.url) {
          return json({ ok: false, error: "no_checkout_url" }, 500);
        }

        return json({
          ok: true,
          url: session.url,
          sessionId: session.id,
        });
      },
    },
  },
  component: () => null,
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
