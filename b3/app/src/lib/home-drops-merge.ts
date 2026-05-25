import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { homeDrops, type HomeDrop } from "@/content/home-drops";

async function loadMergedHomeDropsWithMeta(): Promise<{
  drops: HomeDrop[];
  source: "strapi" | "static";
}> {
  const { fetchVaultDropsFromStrapi } = await import("@/server/strapi/vault-drops");
  const remote = await fetchVaultDropsFromStrapi();
  if (remote && remote.length > 0) return { drops: remote, source: "strapi" };
  return { drops: homeDrops, source: "static" };
}

export async function loadMergedHomeDrops(): Promise<HomeDrop[]> {
  const { drops } = await loadMergedHomeDropsWithMeta();
  return drops;
}

export async function loadMergedDropBySlug(slug: string): Promise<HomeDrop | undefined> {
  return (await loadMergedHomeDrops()).find((d) => d.slug === slug);
}

const emptyInput = z.object({});

export const postMergedHomeDrops = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => emptyInput.parse(raw ?? {}))
  .handler(loadMergedHomeDropsWithMeta);

const slugSchema = z.object({ slug: z.string().min(1).max(200) });

export const postMergedDropBySlug = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => slugSchema.parse(raw ?? {}))
  .handler(async ({ data }): Promise<HomeDrop | null> => {
    const drop = await loadMergedDropBySlug(data.slug);
    return drop ?? null;
  });
