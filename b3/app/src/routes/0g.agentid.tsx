import { createFileRoute } from "@tanstack/react-router";
import { buildOgAgentIdProofHtml } from "@/lib/og-agentid-html";
import { OG_PRODUCTION_PROOF_URL } from "@/lib/og-hackathon";

export const Route = createFileRoute("/0g/agentid")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const proto =
          request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
          url.protocol.replace(":", "");
        const proofUrl = `${proto}://${url.host}/0g/agentid`;
        const html = buildOgAgentIdProofHtml(proofUrl || OG_PRODUCTION_PROOF_URL);
        return new Response(html, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "public, max-age=60",
          },
        });
      },
    },
  },
  component: () => null,
});
