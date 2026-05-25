import type { APIRequestContext } from "@playwright/test";

export async function postWaitlist(
  request: APIRequestContext,
  body: { email: string; name?: string; source?: string },
) {
  return request.post("/api/platform/waitlist", { data: body });
}

export async function fetchSiweNonce(request: APIRequestContext) {
  return request.get("/api/platform/siwe-nonce");
}

export async function fetchFarcasterManifest(request: APIRequestContext) {
  return request.get("/.well-known/farcaster.json");
}
