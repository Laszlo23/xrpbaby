import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({
  handle: z.string().min(3),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  message: z.string().min(1),
  signature: z.string().min(1),
  referralCode: z.string().min(4).optional(),
});

export const Route = createFileRoute("/api/credentials/identity/sync")({
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

        const { syncCultureIdentityFromHandle } =
          await import("@/server/credentials/identity-sync");
        const result = await syncCultureIdentityFromHandle({
          handle: parsed.data.handle,
          evmAddress: auth.address,
          referralCode: parsed.data.referralCode,
        });

        if (!result.ok) {
          const status =
            result.error === "culture_name_not_claimed" || result.error === "not_culture_id_owner"
              ? 403
              : 400;
          return Response.json(result, { status });
        }

        return Response.json(result);
      },
    },
  },
  component: () => null,
});
