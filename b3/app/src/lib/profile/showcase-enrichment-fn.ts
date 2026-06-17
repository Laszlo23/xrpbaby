import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  name: z.string().min(1).max(128),
});

/** Server-only: Web3.bio graph + optional Neynar/Alchemy enrichment for claimed Culture names. */
export const fetchShowcaseEnrichmentFn = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => inputSchema.parse(raw))
  .handler(async ({ data }) => {
    try {
      const { resolveCultureName } = await import("@/server/identity/resolve");
      const { getCultureIdentityEnrichment } = await import("@/server/identity/showcase-enrichment");

      const resolved = await resolveCultureName(data.name);
      if (resolved.status !== "claimed") return null;
      return await getCultureIdentityEnrichment(resolved);
    } catch (e) {
      console.warn("fetchShowcaseEnrichmentFn:", e);
      return null;
    }
  });
