import { createFileRoute } from "@tanstack/react-router";

import type { CredentialSlug } from "@/lib/credentials/credential-catalog";

export const Route = createFileRoute("/api/credentials/claim")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: {
          slug?: string;
          handle?: string;
          walletAddress?: string;
          memberId?: string;
        };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
        }

        const slug = body.slug?.trim() as CredentialSlug | undefined;
        if (!slug) {
          return Response.json({ ok: false, error: "slug_required" }, { status: 400 });
        }

        const { claimCredential } = await import("@/server/credentials/claim");
        const { resolveCultureName } = await import("@/server/identity/resolve");

        let resolved = null;
        if (body.handle) {
          resolved = await resolveCultureName(body.handle);
        }

        const result = await claimCredential({
          slug,
          handle: body.handle,
          memberId: body.memberId,
          walletAddress: body.walletAddress,
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
