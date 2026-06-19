import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import type { CredentialSlug } from "@/lib/credentials/credential-catalog";
import { readJsonBody } from "@/server/platform/rate-limit";

const bodySchema = z.object({
  slug: z.string().min(1),
  handle: z.string().min(1).optional(),
  walletAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .optional(),
  memberId: z.string().min(1).optional(),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  message: z.string().min(10),
  signature: z.string().min(10),
});

export const Route = createFileRoute("/api/credentials/claim")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await readJsonBody(request);
        if (!raw.ok) {
          return Response.json({ ok: false, error: raw.error }, { status: raw.status });
        }

        const parsed = bodySchema.safeParse(raw.body);
        if (!parsed.success) {
          return Response.json({ ok: false, error: "invalid_body" }, { status: 400 });
        }

        const { requireSiweAuth } = await import("@/server/platform/siwe");
        const auth = await requireSiweAuth({
          address: parsed.data.address,
          message: parsed.data.message,
          signature: parsed.data.signature,
        });
        if ("error" in auth) {
          return Response.json({ ok: false, error: auth.error }, { status: auth.status });
        }

        if (
          parsed.data.walletAddress &&
          parsed.data.walletAddress.toLowerCase() !== auth.address.toLowerCase()
        ) {
          return Response.json({ ok: false, error: "wallet_mismatch" }, { status: 403 });
        }

        const slug = parsed.data.slug.trim() as CredentialSlug;

        const { claimCredential } = await import("@/server/credentials/claim");
        const { resolveCultureName } = await import("@/server/identity/resolve");

        let resolved = null;
        if (parsed.data.handle) {
          resolved = await resolveCultureName(parsed.data.handle);
          if (resolved.status === "claimed" && resolved.owner) {
            if (resolved.owner.toLowerCase() !== auth.address.toLowerCase()) {
              return Response.json({ ok: false, error: "not_culture_id_owner" }, { status: 403 });
            }
          }
        }

        const result = await claimCredential({
          slug,
          handle: parsed.data.handle,
          memberId: parsed.data.memberId,
          walletAddress: auth.address,
          resolved,
        });

        if (!result.ok) {
          return Response.json(result, { status: 400 });
        }
        return Response.json(result);
      },
    },
  },
  component: () => null,
});
