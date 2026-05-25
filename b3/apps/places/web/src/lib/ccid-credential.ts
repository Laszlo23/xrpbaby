/**
 * Cross-Chain Identity (CCID) credential hook for Chainlink ACE.
 * When ACE Platform is provisioned, sync KYC outcomes to CCID here.
 * Until then, logs intent and returns null (registry relay remains source of truth).
 */
export type CcidCredentialInput = {
  wallet: `0x${string}`;
  verificationId: string;
  status: "approved" | "declined" | "resubmission_requested";
  provider: "veriff";
};

export type CcidSyncResult = {
  synced: boolean;
  ccid?: string;
  reason?: string;
};

export async function syncCcidCredential(input: CcidCredentialInput): Promise<CcidSyncResult> {
  const aceEndpoint = process.env.CHAINLINK_ACE_CCID_ENDPOINT?.trim();
  const aceApiKey = process.env.CHAINLINK_ACE_API_KEY?.trim();

  if (!aceEndpoint || !aceApiKey) {
    console.info("[ccid] ACE not configured; wallet relay only", input.wallet);
    return { synced: false, reason: "ace_not_configured" };
  }

  try {
    const res = await fetch(aceEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aceApiKey}`,
      },
      body: JSON.stringify({
        wallet: input.wallet,
        credentialType: "kyc_verified",
        provider: input.provider,
        externalId: input.verificationId,
        status: input.status,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.warn("[ccid] ACE sync failed", res.status, text);
      return { synced: false, reason: `ace_http_${res.status}` };
    }
    const data = (await res.json()) as { ccid?: string };
    return { synced: true, ccid: data.ccid };
  } catch (err) {
    console.warn("[ccid] ACE sync error", err);
    return { synced: false, reason: "ace_network_error" };
  }
}
