import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getPackBySlug } from "@/lib/packs";
import {
  getStripeClient,
  isStripeConfigured,
  platformOrigin,
} from "@/server/billing/stripe-config";
import { checkRateLimit, readJsonBody } from "@/server/platform/rate-limit";
import {
  verifyPrivyAccessToken,
  isPrivyConfigured,
  requirePrivyWalletMatch,
} from "@/server/wallet/privy-auth";

const bodySchema = z.object({
  packSlug: z.string().min(1),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  network: z.enum(["base", "bsc"]).optional(),
});

export const Route = createFileRoute("/api/wallet/packs/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const limited = checkRateLimit(request, "pack-checkout", 15);
        if (!limited.ok) {
          return json({ ok: false, error: "rate_limited" }, 429);
        }

        if (!isStripeConfigured()) {
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

        let privyUserId: string | undefined;
        if (isPrivyConfigured()) {
          const auth = await requirePrivyWalletMatch(
            request.headers.get("authorization"),
            parsed.data.walletAddress,
          );
          if ("error" in auth) {
            return json({ ok: false, error: auth.error }, auth.status);
          }
          privyUserId = auth.userId;
        } else {
          const auth = await verifyPrivyAccessToken(request.headers.get("authorization"));
          privyUserId = "userId" in auth ? auth.userId : undefined;
        }

        const { ensureWalletAndMember } = await import("@/server/platform/member");
        const { member, wallet } = await ensureWalletAndMember(prisma, parsed.data.walletAddress, {
          privyUserId,
        });

        const origin = platformOrigin();
        const stripe = getStripeClient();

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
            preferredNetwork: parsed.data.network ?? "base",
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
