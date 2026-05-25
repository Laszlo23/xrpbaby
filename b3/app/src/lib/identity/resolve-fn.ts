import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { ResolvedCultureName } from "@/lib/identity/resolve-types";

const nameSchema = z.object({
  name: z
    .string()
    .min(3)
    .max(64)
    .regex(/^[a-z0-9]+(\.[a-z]+)?$/i, "invalid_culture_name"),
});

export const fetchCultureNameResolution = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => nameSchema.parse(raw))
  .handler(async ({ data }): Promise<ResolvedCultureName> => {
    const { resolveCultureName } = await import("@/server/identity/resolve");
    return resolveCultureName(data.name);
  });
