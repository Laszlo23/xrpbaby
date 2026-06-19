const REFERRAL_STORAGE_KEY = "identity_referral_code";

export function persistReferralCodeFromUrl(ref: string | undefined) {
  if (!ref?.trim()) return;
  const code = ref.trim().toUpperCase();
  if (code.length < 4) return;
  try {
    sessionStorage.setItem(REFERRAL_STORAGE_KEY, code);
  } catch {
    /* ignore */
  }
}

export function getStoredReferralCode(): string | undefined {
  try {
    const v = sessionStorage.getItem(REFERRAL_STORAGE_KEY)?.trim();
    return v && v.length >= 4 ? v.toUpperCase() : undefined;
  } catch {
    return undefined;
  }
}

export function clearStoredReferralCode() {
  try {
    sessionStorage.removeItem(REFERRAL_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
