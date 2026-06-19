import { createFileRoute } from "@tanstack/react-router";
import { BCID_EAS_SCHEMAS } from "@/lib/bcid/eas-schemas";

export const Route = createFileRoute("/api/bcid/eas-schemas")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(
          JSON.stringify({
            ok: true,
            chainId: 84532,
            schemas: BCID_EAS_SCHEMAS,
            docs: "https://app.buildingcultureid.space/docs/rfc",
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "public, max-age=300",
            },
          },
        );
      },
    },
  },
  component: () => null,
});
