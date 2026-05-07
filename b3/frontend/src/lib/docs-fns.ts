import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { DocsArticleSummary } from "@/server/strapi/docs-articles";

const emptyInput = z.object({});

const slugInput = z.object({
  slug: z.string().min(1).max(200),
});

export type DocsArticleView = {
  slug: string;
  title: string;
  description: string | null;
  blocksJson: string;
};

export const postDocsSummaries = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => emptyInput.parse(raw ?? {}))
  .handler(async (): Promise<DocsArticleSummary[] | null> => {
    const { fetchDocsSummaries } = await import("@/server/strapi/docs-articles");
    return fetchDocsSummaries();
  });

export const postDocsArticle = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => slugInput.parse(raw))
  .handler(async ({ data }): Promise<DocsArticleView | null> => {
    const { fetchDocsArticleBySlug } = await import("@/server/strapi/docs-articles");
    const row = await fetchDocsArticleBySlug(data.slug);
    if (!row) return null;
    const title = typeof row.title === "string" ? row.title : data.slug;
    const description = typeof row.description === "string" ? row.description : null;
    return {
      slug: data.slug,
      title,
      description,
      blocksJson: JSON.stringify(row.blocks ?? []),
    };
  });
