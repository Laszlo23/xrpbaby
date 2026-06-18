import type { MemberPlan } from "@/generated/prisma/client";
import type Stripe from "stripe";

import { allocateCommunityStake } from "@/lib/community-stake.server";
import { getPrisma } from "@/lib/db.server";
import { createMemberFromSignup, createMemberSession } from "@/lib/member-onboard.server";
import { getTrack } from "@/lib/tracks-data";

import { getStripe } from "./config.server";

function planFromMetadata(plan: string | undefined): MemberPlan {
  if (plan === "MONTHLY" || plan === "LIFETIME") return plan;
  throw new Error("Invalid plan in checkout metadata");
}

function isSessionPaid(session: Stripe.Checkout.Session): boolean {
  if (session.payment_status === "paid") return true;
  if (session.status === "complete" && session.mode === "subscription") return true;
  return false;
}

export async function fulfillStripeCheckout(stripeSessionId: string) {
  const prisma = getPrisma();
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.retrieve(stripeSessionId, {
    expand: ["subscription"],
  });

  if (!isSessionPaid(session)) {
    throw new Error("Payment not completed");
  }

  const existingCheckout = await prisma.stripeCheckout.findUnique({
    where: { stripeSessionId },
    include: { member: true },
  });

  if (existingCheckout?.fulfilledAt && existingCheckout.member) {
    await createMemberSession(existingCheckout.member.id);
    const track = getTrack(existingCheckout.member.trackSlug);
    return {
      id: existingCheckout.member.id,
      name: existingCheckout.member.name,
      referralCode: existingCheckout.member.referralCode,
      trackTitle: track?.title ?? existingCheckout.member.trackSlug,
      plan: existingCheckout.member.plan,
      alreadyFulfilled: true,
    };
  }

  const email = (session.customer_details?.email ?? session.metadata?.email ?? "").toLowerCase();
  const name = session.metadata?.name ?? "";
  const trackSlug = session.metadata?.trackSlug ?? "";
  const plan = planFromMetadata(session.metadata?.plan);
  const referralCode = session.metadata?.referralCode || undefined;

  if (!email || !name || !trackSlug) {
    throw new Error("Checkout session missing signup metadata");
  }

  const stripeCustomerId =
    typeof session.customer === "string" ? session.customer : (session.customer?.id ?? undefined);
  const stripeSubscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : (session.subscription?.id ?? undefined);

  let member = await prisma.member.findUnique({ where: { email } });

  if (!member) {
    const created = await createMemberFromSignup({
      email,
      name,
      trackSlug,
      plan,
      referralCode: referralCode || undefined,
      stripeCustomerId,
      stripeSubscriptionId,
    });
    member = created.member;
  } else if (stripeCustomerId || stripeSubscriptionId) {
    const upgradedPlan = member.plan === "TRIAL" ? plan : member.plan;
    member = await prisma.member.update({
      where: { id: member.id },
      data: {
        stripeCustomerId: stripeCustomerId ?? member.stripeCustomerId,
        stripeSubscriptionId: stripeSubscriptionId ?? member.stripeSubscriptionId,
        plan: upgradedPlan,
      },
    });
    if (upgradedPlan === "MONTHLY" || upgradedPlan === "LIFETIME") {
      await allocateCommunityStake(member.id, upgradedPlan);
    }
  }

  await prisma.stripeCheckout.upsert({
    where: { stripeSessionId },
    create: {
      stripeSessionId,
      email,
      name,
      trackSlug,
      plan,
      referralCode: referralCode || null,
      memberId: member.id,
      fulfilledAt: new Date(),
    },
    update: {
      memberId: member.id,
      fulfilledAt: new Date(),
    },
  });

  await createMemberSession(member.id);
  const track = getTrack(member.trackSlug);

  return {
    id: member.id,
    name: member.name,
    referralCode: member.referralCode,
    trackTitle: track?.title ?? member.trackSlug,
    plan: member.plan,
    alreadyFulfilled: false,
  };
}
