import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({
  publicHandle: z.string().min(3).max(32),
  tokenId: z.string().min(1),
  chainId: z.number().int().optional(),
  displayName: z.string().optional(),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  message: z.string().min(1),
  signature: z.string().min(1),
});

export const Route = createFileRoute("/api/bcid/sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
        }

        const parsed = bodySchema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ ok: false, error: "invalid_body" }, { status: 400 });
        }

        const { requireSiweAuth } = await import("@/server/platform/siwe");
        const auth = await requireSiweAuth(parsed.data);
        if ("error" in auth) {
          return Response.json({ ok: false, error: auth.error }, { status: auth.status });
        }

        const { syncBcidIdentity } = await import("@/server/bcid/identity");
        const identity = await syncBcidIdentity({
          ownerAddress: auth.address,
          publicHandle: parsed.data.publicHandle,
          tokenId: parsed.data.tokenId,
          chainId: parsed.data.chainId,
          displayName: parsed.data.displayName,
        });

        if (!identity) {
          return Response.json({ ok: false, error: "sync_failed" }, { status: 503 });
        }

        return Response.json({
          ok: true,
          did: identity.did,
          publicHandle: identity.publicHandle,
          identityId: identity.id,
        });
      },
    },
  },
  component: () => null,
});
