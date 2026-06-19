/** Human-readable merch API error messages. */

const MESSAGES: Record<string, string> = {
  sold_out: "This edition is sold out or in production.",
  stripe_not_configured: "Card checkout is not available right now.",
  x402_not_configured: "USDC checkout is not configured.",
  invalid_body: "Please check your shipping details and try again.",
  unknown_drop: "That design is not available.",
  invalid_size: "Please pick a valid size.",
  reserve_failed: "Could not reserve your unit. Try again.",
  database_unavailable: "Store is temporarily offline.",
  order_not_found: "Order not found.",
  wallet_mismatch: "Connect the same wallet you used at checkout.",
  payment_pending: "Payment is still processing.",
  culture_identity_required: "Mint your Culture ID at /pass before claiming your credential.",
  claim_failed: "Claim failed. Try again or contact support.",
  unauthorized: "Not authorized.",
  rate_limited: "Too many attempts. Wait a minute and try again.",
};

export function merchErrorMessage(code: string | undefined): string {
  if (!code) return "Something went wrong. Try again.";
  return MESSAGES[code] ?? code.replace(/_/g, " ");
}
