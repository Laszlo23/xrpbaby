import { findCultureIdentityByHandle } from "@/server/credentials/identity";
import { requireSiweAuth, type SiweAuthInput } from "@/server/platform/siwe";

export type CultureOwnerAuth =
  | { ok: true; address: string; identityId: string; handle: string }
  | { ok: false; error: string; status: number };

export async function requireCultureIdentityOwner(
  handle: string,
  siwe: SiweAuthInput,
): Promise<CultureOwnerAuth> {
  const auth = await requireSiweAuth(siwe);
  if ("error" in auth) {
    return { ok: false, error: auth.error, status: auth.status };
  }

  const normalizedHandle = handle.trim().toLowerCase();
  const identity = await findCultureIdentityByHandle(normalizedHandle);
  if (!identity) {
    return { ok: false, error: "identity_not_found", status: 404 };
  }

  const evm = auth.address.toLowerCase();
  const owner = identity.ownerAddress.toLowerCase();
  const primaryEvm = identity.linkedWallets.find((w) => w.chain === "evm" && w.isPrimary)?.address
    ?.toLowerCase();

  const allowed = evm === owner || (primaryEvm != null && evm === primaryEvm);
  if (!allowed) {
    return { ok: false, error: "not_culture_id_owner", status: 403 };
  }

  return {
    ok: true,
    address: auth.address,
    identityId: identity.id,
    handle: identity.handle,
  };
}
