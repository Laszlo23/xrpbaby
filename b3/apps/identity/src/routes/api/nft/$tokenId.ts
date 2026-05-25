import { createFileRoute } from "@tanstack/react-router";
import { fetchIdentityByTokenId } from "@/lib/chain/identityContract";
import { buildNftMetadata, toNftVisualInput } from "@/lib/nft/identityNftVisual";

export const Route = createFileRoute("/api/nft/$tokenId")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
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

        const origin = new URL(request.url).origin;
        const metadata = buildNftMetadata(toNftVisualInput(identity), origin);
        return Response.json(metadata, {
          headers: {
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
