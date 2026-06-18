import { CREDENTIAL_CATALOG } from "@/lib/credentials/credential-catalog";
import { getPrisma } from "@/server/db/prisma";

export type CredentialCatalogItem = {
  slug: string;
  name: string;
  description: string;
  category: string;
  purpose: string;
  unlocks: string[];
  earnSummary: string;
  icon: string;
  accent: string;
  tier: number;
};

export async function getCredentialCatalog(): Promise<CredentialCatalogItem[]> {
  const prisma = getPrisma();
  if (prisma) {
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
  }

  return CREDENTIAL_CATALOG.map((c) => ({
    slug: c.slug,
    name: c.name,
    description: c.description,
    category: c.category,
    purpose: c.purpose,
    unlocks: c.unlocks,
    earnSummary: c.earnSummary,
    icon: c.icon,
    accent: c.accent,
    tier: 1,
  }));
}
