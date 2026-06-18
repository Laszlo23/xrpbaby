import { createFileRoute } from "@tanstack/react-router";

import { getAddressOverview } from "@/server/explorer/address";
import { isEvmAddress } from "@/server/explorer/tx";

export const Route = createFileRoute("/api/explorer/address/$address")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const address = params?.address?.trim().toLowerCase() ?? "";
        if (!isEvmAddress(address)) return json({ ok: false, error: "invalid_address" }, 400);

        const overview = await getAddressOverview(address);
        if (!overview.ok) return json({ ok: false, error: "unavailable" }, 502);
        return json(overview, 200, { "Cache-Control": "public, max-age=30" });
      },
    },
  },
  component: () => null,
});

function json(data: unknown, status = 200, extraHeaders?: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}
