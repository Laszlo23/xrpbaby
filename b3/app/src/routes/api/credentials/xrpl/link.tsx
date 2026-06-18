import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({
  handle: z.string().min(3),
  xrplAddress: z.string().min(25),
  nonce: z.string().min(8),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  message: z.string().min(1),
  signature: z.string().min(1),
  xrplSignature: z.string().optional(),
  publicKey: z.string().optional(),
  txBlob: z.string().optional(),
});

export const Route = createFileRoute("/api/credentials/xrpl/link")({
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
          return Response.json({ ok: false, error: "missing_fields" }, { status: 400 });
        }

        const { verifyAndLinkXrplWallet } = await import("@/server/wallet/xrpl-link");
        const result = await verifyAndLinkXrplWallet({
          handle: parsed.data.handle,
          xrplAddress: parsed.data.xrplAddress,
          nonce: parsed.data.nonce,
          siwe: {
            address: parsed.data.address,
            message: parsed.data.message,
            signature: parsed.data.signature,
          },
          signature: parsed.data.xrplSignature,
          publicKey: parsed.data.publicKey,
          txBlob: parsed.data.txBlob,
        });

        if (!result.ok) {
          return Response.json(result, { status: result.status ?? 400 });
        }
        return Response.json(result);
      },
    },
  },
  component: () => null,
});
