import { createFileRoute } from "@tanstack/react-router";
import { syncIdentityMintLadder } from "@/server/identity/mint-ladder-sync";

export const Route = createFileRoute("/api/ops/identity-ladder-sync")({
  server: {
    handlers: {
      GET: async () => {
        const result = await syncIdentityMintLadder({ dryRun: true });
        return Response.json(result);
      },
    },
  },
  component: () => null,
});
