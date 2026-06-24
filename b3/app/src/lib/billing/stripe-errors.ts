/** Human-readable Stripe checkout error messages. */

const MESSAGES: Record<string, string> = {
  stripe_not_configured:
    "Card checkout is not available right now. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET on the server.",
  unknown_sku: "That API product is not available for card checkout.",
  invalid_body: "Please check your request and try again.",
  no_database: "Billing is temporarily offline.",
  no_checkout_url: "Could not start Stripe checkout. Try again.",
  purchase_not_found: "Payment session not found.",
  purchase_not_paid: "Payment not completed yet. Finish checkout on Stripe first.",
  purchase_already_consumed: "This payment was already used for an API call.",
  purchase_expired: "This payment session expired. Buy again to continue.",
  sku_mismatch: "This payment is for a different API product.",
  wallet_mismatch: "Connect the same wallet you used at checkout.",
  monthly_price_not_found: "Culture Monthly price is not set up in Stripe for this product.",
  invalid_price_interval: "Configured Stripe price is not a monthly recurring price.",
  rate_limited: "Too many attempts. Wait a minute and try again.",
};

export function stripeErrorMessage(code: string | undefined): string {
  if (!code) return "Something went wrong. Try again.";
  return MESSAGES[code] ?? code.replace(/_/g, " ");
}
