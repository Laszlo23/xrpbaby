import { resolveCultureName } from "@/server/identity/resolve";
import { upsertCultureIdentityFromResolved } from "@/server/credentials/identity";

export type SyncCultureIdentityResult =
  | { ok: true; handle: string; identityId: string }
  | { ok: false; error: string };

export async function syncCultureIdentityFromHandle(input: {
  handle: string;
  evmAddress: string;
}): Promise<SyncCultureIdentityResult> {
  const handle = input.handle.trim().toLowerCase();
  if (!handle) return { ok: false, error: "handle_required" };

  const resolved = await resolveCultureName(handle);
  if (resolved.status !== "claimed" || !resolved.owner) {
    return { ok: false, error: "culture_name_not_claimed" };
  }

  if (resolved.owner.toLowerCase() !== input.evmAddress.toLowerCase()) {
    return { ok: false, error: "not_culture_id_owner" };
  }

  const identityId = await upsertCultureIdentityFromResolved(resolved, null);
  if (!identityId) return { ok: false, error: "identity_sync_failed" };

  return { ok: true, handle: resolved.fullName.toLowerCase(), identityId };
}
