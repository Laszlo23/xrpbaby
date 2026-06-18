import {
  AGENT_OS_CATALOG,
  AGENT_OS_PROJECT,
  x402ResearchPrice,
} from "@/lib/agent-os-catalog";
import { x402LimxPrice } from "@/lib/limx-agent-config";
import { getAgentFleetDashboard } from "@/server/agents/dashboard";
import { fetchBccMetrics } from "@/server/bcc/metrics";

export type AgentOsOverview = {
  ok: true;
  project: typeof AGENT_OS_PROJECT;
  agents: typeof AGENT_OS_CATALOG;
  researchPrice: string;
  limxPrice: string;
  ecosystem: {
    bccUpdatedAt: string | null;
    bccCirculatingWei: string | null;
    bccChainId: number | null;
    activityLast24h: number | null;
  };
  generatedAt: string;
};

export async function getAgentOsOverview(): Promise<AgentOsOverview> {
  let bccUpdatedAt: string | null = null;
  let bccCirculatingWei: string | null = null;
  let bccChainId: number | null = null;

  try {
    const bcc = await fetchBccMetrics();
    if (bcc.ok) {
      bccUpdatedAt = bcc.updatedAt;
      bccCirculatingWei = bcc.canonical.circulatingEstimateWei;
      bccChainId = bcc.canonical.chainId;
    }
  } catch {
    /* optional on-chain reads */
  }

  let activityLast24h: number | null = null;
  try {
    const dash = await getAgentFleetDashboard();
    if (dash) activityLast24h = dash.ledgerRowsLast24h;
  } catch {
    /* db optional */
  }

  return {
    ok: true,
    project: AGENT_OS_PROJECT,
    agents: AGENT_OS_CATALOG,
    researchPrice: x402ResearchPrice(),
    limxPrice: x402LimxPrice(),
    ecosystem: {
      bccUpdatedAt,
      bccCirculatingWei,
      bccChainId,
      activityLast24h,
    },
    generatedAt: new Date().toISOString(),
  };
}
