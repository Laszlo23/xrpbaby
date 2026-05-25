import { createFileRoute } from "@tanstack/react-router";

import { checkRateLimit, readJsonBody } from "@/server/platform/rate-limit";
import { requireSiweAuth } from "@/server/platform/siwe";
import { resolveCultureName } from "@/server/identity/resolve";
import { verifyCultureNameBodySchema } from "@/server/identity/schemas";

export const Route = createFileRoute("/api/identity/verify-name")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const limited = checkRateLimit(request, "identity-verify-name", 30);
        if (!limited.ok) {
          return json({ ok: false, error: "rate_limited" }, 429);
        }

        const raw = await readJsonBody(request);
        if (!raw.ok) {
          return json({ ok: false, error: raw.error }, raw.status);
        }
        const parsed = verifyCultureNameBodySchema.safeParse(raw.body);
        if (!parsed.success) {
          return json({ ok: false, error: "invalid_body" }, 400);
        }

        const resolved = await resolveCultureName(parsed.data.cultureName);
        if (resolved.status !== "claimed" || !resolved.owner) {
          return json({ ok: false, error: "name_not_claimed" }, 404);
        }

        const auth = await requireSiweAuth(parsed.data);
        if ("error" in auth) {
          return json({ ok: false, error: auth.error }, auth.status);
        }

        if (auth.address.toLowerCase() !== resolved.owner.toLowerCase()) {
          return json({ ok: false, error: "not_name_owner" }, 403);
        }

        return json({
          ok: true,
          verified: true,
          fullName: resolved.fullName,
          owner: resolved.owner,
          tokenId: resolved.tokenId,
        });
      },
    },
  },
  component: () => null,
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
