import {
  CREDENTIAL_CATALOG,
  getStaticCredentialCatalog,
  type CredentialCatalogItem,
} from "@/lib/credentials/credential-catalog";
import { getPrisma } from "@/server/db/prisma";

export type { CredentialCatalogItem };

export { getStaticCredentialCatalog };

export async function getCredentialCatalog(): Promise<CredentialCatalogItem[]> {
  const prisma = getPrisma();
  if (!prisma) return getStaticCredentialCatalog();

  try {
    const rows = await prisma.credential.findMany({
      where: { active: true },
      orderBy: { tier: "asc" },
    });
    if (rows.length > 0) {
      return rows.map((row) => {
        const staticEntry = CREDENTIAL_CATALOG.find((c) => c.slug === row.slug);
        const earnRules = row.earnRules as { summary?: string } | null;
        const unlocks = Array.isArray(row.unlocks) ? (row.unlocks as string[]) : [];
        return {
          slug: row.slug,
          name: row.name,
          description: row.description,
          category: row.category,
          purpose: staticEntry?.purpose ?? row.description,
          unlocks: unlocks.length > 0 ? unlocks : (staticEntry?.unlocks ?? []),
          earnSummary: earnRules?.summary ?? staticEntry?.earnSummary ?? "",
          icon: staticEntry?.icon ?? "shield",
          accent: staticEntry?.accent ?? "#C5FF41",
          tier: row.tier,
        };
      });
    }
  } catch (error) {
    console.warn("getCredentialCatalog: database query failed, using static catalog", error);
  }

  return getStaticCredentialCatalog();
}
