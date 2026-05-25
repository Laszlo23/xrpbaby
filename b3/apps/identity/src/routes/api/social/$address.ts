import { createFileRoute } from "@tanstack/react-router";
import { isAddress } from "viem";
import { fetchSocialProfile } from "@/lib/social/aggregate";

export const Route = createFileRoute("/api/social/$address")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const address = params.address;
        if (!isAddress(address)) {
          return new Response("Invalid address", { status: 400 });
        }

        const profile = await fetchSocialProfile(address);
        return Response.json(profile, {
          headers: {
            "Cache-Control": "public, max-age=300",
          },
        });
      },
    },
  },
});
