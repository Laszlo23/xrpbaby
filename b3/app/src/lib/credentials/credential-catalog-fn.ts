import { createServerFn } from "@tanstack/react-start";

import type { CredentialCatalogEntry } from "@/lib/credentials/credential-catalog";

export type CredentialCatalogItem = CredentialCatalogEntry & { tier: number };

/** Server-only: Credential Center catalog (DB-backed with static fallback). */
export const fetchCredentialCatalogFn = createServerFn({ method: "POST" }).handler(
  async (): Promise<CredentialCatalogItem[]> => {
    const { getCredentialCatalog } = await import("@/server/credentials/catalog");
    return getCredentialCatalog();
  },
);
