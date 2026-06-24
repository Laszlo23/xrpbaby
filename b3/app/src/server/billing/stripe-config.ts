import Stripe from "stripe";

let stripeSingleton: Stripe | null = null;

export function stripeSecretKey(): string | undefined {
  return process.env.STRIPE_SECRET_KEY?.trim() || undefined;
}

export function stripeWebhookSecret(): string | undefined {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || undefined;
}

export function isStripeConfigured(): boolean {
  return Boolean(stripeSecretKey() && stripeWebhookSecret());
}

export function getStripeClient(): Stripe {
  const key = stripeSecretKey();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(key);
  }
  return stripeSingleton;
}

export function platformOrigin(): string {
  return (
    process.env.VITE_PLATFORM_ORIGIN?.trim() ||
    process.env.PLATFORM_ORIGIN?.trim() ||
    process.env.PUBLIC_APP_ORIGIN?.trim() ||
    "http://localhost:5173"
  ).replace(/\/$/, "");
}

export const STRIPE_WEBHOOK_PATH = "/api/webhooks/stripe";
