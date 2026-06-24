import { getStripeClient } from "@/server/billing/stripe-config";

/** Stripe Product for Culture monthly membership (€7/mo). */
export const STRIPE_CULTURE_MONTHLY_PRODUCT_ID_DEFAULT = "prod_UkgYq7gPcfRC7q";

export function cultureMonthlyProductId(): string {
  return (
    process.env.STRIPE_CULTURE_MONTHLY_PRODUCT_ID?.trim() ||
    STRIPE_CULTURE_MONTHLY_PRODUCT_ID_DEFAULT
  );
}

export function cultureMonthlyPriceIdOverride(): string | undefined {
  return process.env.STRIPE_CULTURE_MONTHLY_PRICE_ID?.trim() || undefined;
}

export type CultureMonthlyOffer = {
  productId: string;
  priceId: string;
  label: string;
  amountCents: number;
  currency: string;
  interval: "month";
};

let cachedPrice: CultureMonthlyOffer | null = null;

export async function resolveCultureMonthlyOffer(): Promise<
  { ok: true; offer: CultureMonthlyOffer } | { ok: false; error: string }
> {
  const override = cultureMonthlyPriceIdOverride();
  if (override) {
    const stripe = getStripeClient();
    const price = await stripe.prices.retrieve(override);
    if (!price.recurring || price.recurring.interval !== "month") {
      return { ok: false, error: "invalid_price_interval" };
    }
    const productId =
      typeof price.product === "string"
        ? price.product
        : (price.product?.id ?? cultureMonthlyProductId());
    return {
      ok: true,
      offer: {
        productId,
        priceId: price.id,
        label: "Culture Monthly",
        amountCents: price.unit_amount ?? 700,
        currency: price.currency,
        interval: "month",
      },
    };
  }

  if (cachedPrice) {
    return { ok: true, offer: cachedPrice };
  }

  const productId = cultureMonthlyProductId();
  const stripe = getStripeClient();
  const prices = await stripe.prices.list({
    product: productId,
    active: true,
    type: "recurring",
    limit: 10,
  });

  const monthly = prices.data.find((p) => p.recurring?.interval === "month");
  if (!monthly) {
    return { ok: false, error: "monthly_price_not_found" };
  }

  const offer: CultureMonthlyOffer = {
    productId,
    priceId: monthly.id,
    label: "Culture Monthly",
    amountCents: monthly.unit_amount ?? 700,
    currency: monthly.currency,
    interval: "month",
  };
  cachedPrice = offer;
  return { ok: true, offer };
}

export function formatOfferPrice(offer: CultureMonthlyOffer): string {
  const major = offer.amountCents / 100;
  const symbol = offer.currency.toUpperCase() === "EUR" ? "€" : "$";
  return `${symbol}${major.toFixed(major % 1 === 0 ? 0 : 2)}`;
}
