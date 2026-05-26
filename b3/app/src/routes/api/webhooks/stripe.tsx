import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";
import { getPackBySlug } from "@/lib/packs";
import { grantPackPurchase } from "@/server/wallet/grant-pack-purchase";

export const Route = createFileRoute("/api/webhooks/stripe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
        if (!stripeKey || !webhookSecret) {
          return new Response("not configured", { status: 503 });
        }

        const signature = request.headers.get("stripe-signature");
        if (!signature) {
          return new Response("missing signature", { status: 400 });
        }

        const rawBody = await request.text();
        const stripe = new Stripe(stripeKey);
        let event: Stripe.Event;
        try {
          event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
        } catch {
          return new Response("invalid signature", { status: 400 });
        }

        if (event.type !== "checkout.session.completed") {
          return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status !== "paid") {
          return new Response(JSON.stringify({ received: true, skipped: "unpaid" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        const packSlug = session.metadata?.packSlug;
        const wallet = session.metadata?.wallet;
        const memberId = session.metadata?.memberId ?? session.client_reference_id;
        if (!packSlug || !wallet || !memberId || !session.id) {
          return new Response("missing metadata", { status: 400 });
        }

        const pack = getPackBySlug(packSlug);
        if (!pack) {
          return new Response("unknown pack", { status: 400 });
        }

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) {
          return new Response("no database", { status: 503 });
        }

        const { ensureWalletAndMember } = await import("@/server/platform/member");
        const { wallet: walletRow, member } = await ensureWalletAndMember(prisma, wallet);
        if (member.id !== memberId) {
          return new Response("member mismatch", { status: 400 });
        }

        const result = await grantPackPurchase(prisma, {
          memberId: member.id,
          walletId: walletRow.id,
          pack,
          stripeSessionId: session.id,
        });

        return new Response(
          JSON.stringify({
            received: true,
            alreadyGranted: result.alreadyGranted,
            pointsGranted: result.pointsGranted,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
  component: () => null,
});
