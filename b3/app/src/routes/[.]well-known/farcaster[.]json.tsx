import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/.well-known/farcaster.json")({
  server: {
    handlers: {
      GET: async () => {
        const { buildFarcasterManifest } = await import("@/server/farcaster-manifest");
        const body = buildFarcasterManifest();
        return new Response(JSON.stringify(body), {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=300",
          },
        });
      },
    },
  },
  component: () => null,
});
