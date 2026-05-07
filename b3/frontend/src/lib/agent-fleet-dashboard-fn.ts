import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const emptyInput = z.object({});

/** Server-only: loads agent fleet ledger + kill-switch flags from Postgres (keep server imports out of route modules). */
export const postAgentFleetDashboard = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => emptyInput.parse(raw ?? {}))
  .handler(async () => {
    const { getAgentFleetDashboard } = await import("@/server/agents/dashboard");
    return getAgentFleetDashboard();
  });
