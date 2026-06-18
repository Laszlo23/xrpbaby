import { createMemberFromSignup, createMemberSession } from "@/lib/member-onboard.server";
import { createStripeCheckoutSession } from "@/lib/stripe/checkout.server";
import { isStripeConfigured } from "@/lib/stripe/config.server";
import { fulfillStripeCheckout } from "@/lib/stripe/fulfill.server";
import { getTrack } from "@/lib/tracks-data";

export type CheckoutSignupInput = {
  email: string;
  name: string;
  trackSlug: string;
  plan: "MONTHLY" | "LIFETIME";
  referralCode?: string;
};

export async function handleGetCheckoutMode() {
  return {
    mode: isStripeConfigured() ? ("stripe" as const) : ("free" as const),
  };
}

export async function handleStartCheckout(data: CheckoutSignupInput) {
  const track = getTrack(data.trackSlug);
  if (!track) throw new Error("Invalid track");

  if (!isStripeConfigured()) {
    const { member } = await createMemberFromSignup(data);
    await createMemberSession(member.id);
    return {
      mode: "instant" as const,
      member: {
        id: member.id,
        name: member.name,
        referralCode: member.referralCode,
        trackTitle: track.title,
        plan: member.plan,
      },
    };
  }

  const checkout = await createStripeCheckoutSession(data);
  return {
    mode: "redirect" as const,
    url: checkout.url,
    sessionId: checkout.sessionId,
  };
}

export async function handleFulfillCheckout(sessionId: string) {
  if (!isStripeConfigured()) {
    throw new Error("Stripe is not configured");
  }
  return fulfillStripeCheckout(sessionId);
}
