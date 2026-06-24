import { CULTURE_PACKS } from "@/lib/packs";
import { cultureMonthlyProductId } from "@/server/billing/stripe-subscription-config";
import { isStripeConfigured, STRIPE_WEBHOOK_PATH } from "@/server/billing/stripe-config";

export function buildStripeHealthPayload() {
  return {
    ok: true,
    configured: isStripeConfigured(),
    webhookPath: STRIPE_WEBHOOK_PATH,
    packsEnabled: isStripeConfigured(),
    merchEnabled: isStripeConfigured(),
    apiBillingEnabled: isStripeConfigured(),
    subscriptionEnabled: isStripeConfigured(),
    cultureMonthlyProductId: cultureMonthlyProductId(),
    subscribePath: "/api/billing/stripe/subscribe",
    packCount: CULTURE_PACKS.length,
    generatedAt: new Date().toISOString(),
  };
}
