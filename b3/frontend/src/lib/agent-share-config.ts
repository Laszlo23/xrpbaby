/** Catalog ids must match on-chain `uint8 agentTypeId` in `AgentShareCampaign`. */
import { AGENT_FLEET } from "@/lib/bcd-agent-fleet";

export type AgentCatalogEntry = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
};

/** Eleven agents — aligned with `AGENT_FLEET` (Building Culture agent lineup). */
export const AGENT_SHARE_CATALOG: AgentCatalogEntry[] = AGENT_FLEET.map((a) => ({
  id: a.id,
  slug: a.slug,
  name: a.name,
  tagline: a.tagline,
}));
