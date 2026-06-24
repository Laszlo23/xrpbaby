export function referralErrorMessage(error: string): string {
  switch (error) {
    case "already_redeemed":
      return "This wallet already redeemed a referral code for one mint.";
    case "code_invalid":
      return "Referral code not found or already used. Check spelling with whoever shared it.";
    case "team_code_restricted":
      return "This code is not available for public entry. Ask the team for a personal invite code.";
    case "handle_too_short":
      return "Promo mint requires at least 4 characters in your handle.";
    case "reserved_team":
      return "1–3 letter names are reserved. Contact the team for a personal invite.";
    case "referral_required":
      return "Enter a valid referral code to mint.";
    default:
      return "Referral validation failed.";
  }
}
