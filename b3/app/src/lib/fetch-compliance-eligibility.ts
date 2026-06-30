export type ComplianceEligibilityResponse = {
  ok?: boolean;
  configured?: boolean;
  status?: string;
  canHoldRestrictedShares?: boolean;
  placesUrl?: string;
  error?: string;
};

/** Fetch wallet compliance from the main app API (same-origin or cross-origin with CORS). */
export async function fetchComplianceEligibility(
  wallet: string,
  baseUrl = "",
): Promise<ComplianceEligibilityResponse | null> {
  try {
    const url = `${baseUrl.replace(/\/$/, "")}/api/compliance/eligibility?wallet=${encodeURIComponent(wallet)}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = (await response.json()) as ComplianceEligibilityResponse;
    if (data.ok === false) return null;
    return data;
  } catch {
    return null;
  }
}
