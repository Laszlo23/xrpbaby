import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const siweSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  message: z.string().min(1),
  signature: z.string().min(1),
});

const getQuerySchema = z.object({
  handle: z.string().min(3),
  xrplAddress: z.string().optional(),
});

const postBodySchema = siweSchema.extend({
  handle: z.string().min(3),
  xrplAddress: z.string().optional(),
});

export const Route = createFileRoute("/api/credentials/xrpl/challenge")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const parsed = getQuerySchema.safeParse({
          handle: url.searchParams.get("handle")?.trim(),
          xrplAddress: url.searchParams.get("xrplAddress")?.trim(),
        });
        if (!parsed.success) {
          return Response.json({ ok: false, error: "handle_required" }, { status: 400 });
        }
        return Response.json(
          {
            ok: false,
            error: "use_post_with_siwe",
            hint: "POST with { handle, address, message, signature, xrplAddress? }",
          },
          { status: 405 },
        );
      },
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
        }

        const parsed = postBodySchema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ ok: false, error: "invalid_body" }, { status: 400 });
        }

        const { createXrplLinkChallenge } = await import("@/server/wallet/xrpl-link");
        const result = await createXrplLinkChallenge({
          handle: parsed.data.handle,
          siwe: {
            address: parsed.data.address,
            message: parsed.data.message,
            signature: parsed.data.signature,
          },
          xrplAddress: parsed.data.xrplAddress,
        });

        if ("error" in result) {
          return Response.json({ ok: false, error: result.error }, { status: result.status });
        }

        return Response.json({ ok: true, ...result });
      },
    },
  },
  component: () => null,
});
