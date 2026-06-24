import { CULTURE_PACKS, formatPackUsd } from "@/lib/packs";
import { listStripeApiSkus } from "@/lib/billing/stripe-api-catalog";
import { buildCultureSubscriptionManifestEntry } from "@/server/billing/stripe-subscriptions";
import { isStripeConfigured, STRIPE_WEBHOOK_PATH } from "@/server/billing/stripe-config";

export async function buildStripeManifestPayload() {
  const subscription = await buildCultureSubscriptionManifestEntry();
  return {
    ok: true,
    configured: isStripeConfigured(),
    checkoutPath: "/api/billing/stripe/checkout",
    subscribePath: "/api/billing/stripe/subscribe",
    webhookPath: STRIPE_WEBHOOK_PATH,
    subscription,
    skus: listStripeApiSkus().map((s) => ({
      sku: s.sku,
      label: s.label,
      priceUsd: `$${(s.usdCents / 100).toFixed(2)}`,
      usdCents: s.usdCents,
      apiPath: s.apiPath,
      method: s.method,
      priceEnv: s.priceEnv,
    })),
    packs: CULTURE_PACKS.map((p) => ({
      slug: p.slug,
      label: p.label,
      priceUsd: formatPackUsd(p.usd),
      usdCents: p.usdCents,
      checkoutPath: "/api/wallet/packs/checkout",
    })),
    generatedAt: new Date().toISOString(),
  };
}
