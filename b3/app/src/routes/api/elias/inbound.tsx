import { createFileRoute } from "@tanstack/react-router";

import { logEliasAgentAction } from "@/server/elias/audit";
import { parseInboundPartnerPayload } from "@/server/elias/inbound-email";
import { insertPartnerOfferFromInbound } from "@/server/elias/elias-store";
import { requireEliasInboundSecret } from "@/server/platform/admin-secret";

export const Route = createFileRoute("/api/elias/inbound")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const gate = requireEliasInboundSecret(request);
        if (!gate.ok) {
          return new Response(JSON.stringify({ ok: false, error: gate.error }), {
            status: gate.status,
            headers: { "Content-Type": "application/json" },
          });
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ ok: false, error: "invalid_json" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const parsed = parseInboundPartnerPayload(body);
        if (!parsed) {
          return new Response(JSON.stringify({ ok: false, error: "unrecognized_payload" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const id = await insertPartnerOfferFromInbound({
          category: "inbound_email",
          title: parsed.subject.slice(0, 200),
          body: parsed.text.slice(0, 12000),
          partner_email: parsed.fromEmail,
          metadata: { source: "api_elias_inbound" },
        });

        await logEliasAgentAction({
          action: "elias.inbound_partner_package",
          params: { offerId: id ?? null },
          status: id ? "ok" : "partial",
          errorMsg: id ? undefined : "supabase_insert_failed",
        });

        return new Response(JSON.stringify({ ok: true, offerId: id ?? null }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
  component: InboundNote,
});

function InboundNote() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 font-mono text-sm text-muted-foreground">
      <p className="mb-2 font-semibold text-foreground">POST /api/elias/inbound</p>
      <p>
        Resend (or other) inbound webhook — set{" "}
        <span className="text-zinc-300">ELIAS_INBOUND_SECRET</span> and send the same value in
        header <span className="text-zinc-300">x-elias-inbound-secret</span>.
      </p>
    </div>
  );
}
