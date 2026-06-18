import type { MemberPlan } from "@/generated/prisma/client";

import { getPrisma } from "@/lib/db.server";
import { PLAN_PRICES_CENTS } from "@/lib/tracks-data";

import { getAppOrigin, getStripe } from "./config.server";

type CreateCheckoutInput = {
  email: string;
  name: string;
  trackSlug: string;
  plan: MemberPlan;
  referralCode?: string;
};

export async function createStripeCheckoutSession(input: CreateCheckoutInput) {
  const prisma = getPrisma();
  const stripe = getStripe();
  const origin = getAppOrigin();

  const existing = await prisma.member.findUnique({
    where: { email: input.email.toLowerCase() },
  });
  if (existing) throw new Error("Email already registered. Use login instead.");

  const metadata = {
    email: input.email.toLowerCase(),
    name: input.name,
    trackSlug: input.trackSlug,
    plan: input.plan,
    referralCode: input.referralCode?.toUpperCase() ?? "",
  };

  const common = {
    customer_email: input.email.toLowerCase(),
    success_url: `${origin}/join/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/join?canceled=1`,
    metadata,
  };

  const session =
    input.plan === "MONTHLY"
      ? await stripe.checkout.sessions.create({
          mode: "subscription",
          ...common,
          line_items: [
            {
              price_data: {
                currency: "usd",
                unit_amount: PLAN_PRICES_CENTS.MONTHLY,
                recurring: { interval: "month" },
                product_data: { name: "RESET Monthly Membership" },
              },
              quantity: 1,
            },
          ],
        })
      : await stripe.checkout.sessions.create({
          mode: "payment",
          ...common,
          line_items: [
            {
              price_data: {
                currency: "usd",
                unit_amount: PLAN_PRICES_CENTS.LIFETIME,
                product_data: { name: "RESET Lifetime Membership" },
              },
              quantity: 1,
            },
          ],
        });

  if (!session.url) throw new Error("Stripe did not return a checkout URL");

  await prisma.stripeCheckout.create({
    data: {
      stripeSessionId: session.id,
      email: input.email.toLowerCase(),
      name: input.name,
      trackSlug: input.trackSlug,
      plan: input.plan,
      referralCode: input.referralCode?.toUpperCase() ?? null,
    },
  });

  return { url: session.url, sessionId: session.id };
}
