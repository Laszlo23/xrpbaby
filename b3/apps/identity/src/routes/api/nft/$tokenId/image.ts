import { createFileRoute } from "@tanstack/react-router";
import { fetchIdentityByTokenId } from "@/lib/chain/identityContract";
import { buildIdentityNftSvg, toNftVisualInput } from "@/lib/nft/identityNftVisual";

export const Route = createFileRoute("/api/nft/$tokenId/image")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        let tokenId: bigint;
        try {
          tokenId = BigInt(params.tokenId);
        } catch {
          return new Response("Invalid token id", { status: 400 });
        }

        const identity = await fetchIdentityByTokenId(tokenId);
        if (!identity) {
          return new Response("Not found", { status: 404 });
        }

        const svg = buildIdentityNftSvg(toNftVisualInput(identity));
        return new Response(svg, {
          headers: {
            "Content-Type": "image/svg+xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
