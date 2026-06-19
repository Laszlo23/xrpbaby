import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";
import { getPackBySlug } from "@/lib/packs";
import { grantPackPurchase } from "@/server/wallet/grant-pack-purchase";
import { enqueueBccSettlement } from "@/server/wallet/enqueue-bcc-settlement";

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

        if (event.type === "checkout.session.expired") {
          const session = event.data.object as Stripe.Checkout.Session;
          if (session.metadata?.type === "merch" && session.id) {
            const { cancelMerchOrderByStripeSession } =
              await import("@/server/marketplace/merch-orders");
            await cancelMerchOrderByStripeSession(session.id);
          }
          return new Response(JSON.stringify({ received: true, expired: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
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

        if (session.metadata?.type === "merch") {
          const orderId = session.metadata.orderId;
          if (!orderId || !session.id) {
            return new Response("missing merch metadata", { status: 400 });
          }

          const { verifyMerchStripeSession, markMerchOrderPaid } =
            await import("@/server/marketplace/merch-orders");

          const verified = await verifyMerchStripeSession({
            orderId,
            stripeSessionId: session.id,
            amountTotalCents: session.amount_total,
            metadataWallet: session.metadata.wallet,
          });

          if (!verified.ok) {
            return new Response(`merch verification failed: ${verified.error}`, { status: 400 });
          }

          const paid = await markMerchOrderPaid({
            orderId,
            paymentRail: "stripe",
            stripeSessionId: session.id,
          });

          return new Response(
            JSON.stringify({
              received: true,
              type: "merch",
              alreadyPaid: paid.ok ? false : paid.error === "already_paid",
              orderId,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
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

        const bccQueue = await enqueueBccSettlement(prisma, {
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
            bccSettlementQueued: !bccQueue.alreadyQueued,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
  component: () => null,
});
