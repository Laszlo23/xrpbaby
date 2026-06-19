import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { readJsonBody, checkRateLimit } from "@/server/platform/rate-limit";

const bodySchema = z.object({
  claimCode: z.string().min(8),
  walletAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .optional(),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  message: z.string().min(10),
  signature: z.string().min(10),
});

export const Route = createFileRoute("/api/merch/claim")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const limited = checkRateLimit(request, "merch-claim", 10);
        if (!limited.ok) {
          return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
        }

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

        const { claimMerchByCode } = await import("@/server/marketplace/merch-claim");
        const result = await claimMerchByCode({
          claimCode: parsed.data.claimCode,
          walletAddress: auth.address,
        });

        if (!result.ok) {
          const status =
            result.error === "wallet_mismatch" ||
            result.error === "payment_pending" ||
            result.error === "culture_identity_required"
              ? 403
              : 404;
          return Response.json(result, { status });
        }

        return Response.json(result);
      },
    },
  },
  component: () => null,
});
