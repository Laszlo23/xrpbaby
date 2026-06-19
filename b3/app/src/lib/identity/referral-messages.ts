export function referralErrorMessage(error: string): string {
  switch (error) {
    case "already_redeemed":
      return "This wallet already redeemed a referral code for one mint.";
    case "code_invalid":
      return "Referral code is invalid or already used.";
    case "handle_too_short":
      return "Promo mint requires at least 4 characters in your handle.";
    case "reserved_team":
      return "1–3 letter names are reserved for team / DAO. Choose 4+ characters.";
    case "referral_required":
      return "Enter a valid referral code to mint.";
    default:
      return "Referral validation failed.";
  }
}
