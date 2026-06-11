import type { FastifyPluginAsync } from "fastify";
import Stripe from "stripe";
import {
  activateSubscriptionFromCheckout,
  handleInvoiceFailed,
  recordInvoicePayment,
  syncStripeSubscription,
} from "../lib/stripe-billing.js";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export const billingWebhookRoutes: FastifyPluginAsync = async (app) => {
  app.addContentTypeParser("application/json", { parseAs: "buffer" }, (_req, body, done) => {
    done(null, body);
  });

  app.post("/webhook/stripe", async (request, reply) => {
    if (!stripe) return reply.serviceUnavailable("Stripe not configured");

    const sig = request.headers["stripe-signature"] as string | undefined;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!sig || !webhookSecret) return reply.badRequest("Webhook secret not configured");

    const rawBody = request.body as Buffer;
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch {
      return reply.badRequest("Invalid signature");
    }

    switch (event.type) {
      case "checkout.session.completed":
        await activateSubscriptionFromCheckout(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncStripeSubscription(event.data.object as Stripe.Subscription);
        break;
      case "invoice.paid":
        await recordInvoicePayment(event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_failed":
        await handleInvoiceFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        break;
    }

    return { received: true };
  });
};
