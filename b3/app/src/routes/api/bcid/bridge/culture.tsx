import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({
  cultureHandle: z.string().min(3),
  cultureTokenId: z.string().min(1),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  message: z.string().min(1),
  signature: z.string().min(1),
});

export const Route = createFileRoute("/api/bcid/bridge/culture")({
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

        const { resolveCultureName } = await import("@/server/identity/resolve");
        const resolved = await resolveCultureName(parsed.data.cultureHandle);
        if (resolved.status !== "claimed" || !resolved.owner) {
          return Response.json({ ok: false, error: "culture_name_not_claimed" }, { status: 403 });
        }
        if (resolved.owner.toLowerCase() !== auth.address.toLowerCase()) {
          return Response.json({ ok: false, error: "not_culture_owner" }, { status: 403 });
        }

        const { bridgeCultureToBcid } = await import("@/server/bcid/identity");
        const result = await bridgeCultureToBcid({
          ownerAddress: auth.address,
          cultureHandle: parsed.data.cultureHandle,
          cultureTokenId: parsed.data.cultureTokenId,
        });

        if (!result.ok) {
          const status = result.error === "already_bridged" ? 409 : 400;
          return Response.json(result, { status });
        }

        return Response.json(result);
      },
    },
  },
  component: () => null,
});
