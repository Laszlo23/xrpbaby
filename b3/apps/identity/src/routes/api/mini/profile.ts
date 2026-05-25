import { createFileRoute } from "@tanstack/react-router";
import type { Address } from "viem";
import {
  verifyQuickAuthRequest,
  unauthorizedResponse,
} from "@/lib/mini/auth";
import { fetchUserByFid } from "@/lib/social/neynar";
import { fetchWalletIdentities } from "@/lib/chain/walletIdentities";

export const Route = createFileRoute("/api/mini/profile")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await verifyQuickAuthRequest(request);
        if (!auth) return unauthorizedResponse();

        const profile = await fetchUserByFid(auth.fid);
        if (!profile) {
          return Response.json({ profile: null, identities: [] });
        }

        const identities: Array<{ fullName: string; tokenId: string }> = [];
        for (const addr of profile.verifiedAddresses) {
          const { identities: ids } = await fetchWalletIdentities(
            addr as Address,
          );
          for (const id of ids) {
            identities.push({
              fullName: id.fullName,
              tokenId: id.tokenId.toString(),
            });
          }
        }

        return Response.json({
          profile: {
            fid: profile.fid,
            username: profile.username,
            displayName: profile.displayName,
            pfpUrl: profile.pfpUrl,
          },
          identities,
        });
      },
    },
  },
});
