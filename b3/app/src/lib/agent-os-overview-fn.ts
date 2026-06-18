import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const emptyInput = z.object({});

/** Server-only: Agent OS public overview (catalog + BCC + sanitized activity). */
export const getAgentOsOverviewFn = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => emptyInput.parse(raw ?? {}))
  .handler(async () => {
    try {
      const { getAgentOsOverview } = await import("@/server/agents/overview");
      return await getAgentOsOverview();
    } catch (e) {
      console.warn("getAgentOsOverviewFn:", e);
      return null;
    }
  });
