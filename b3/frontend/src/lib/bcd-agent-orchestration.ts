/**
 * Server-safe stubs for CEO orchestration — extend with queues (Redis, Inngest, etc.) in production.
 */
import {
  AGENT_FLEET,
  CEO_AGENT_ID,
  TASK_ROUTE_HINTS,
  type FleetAgent,
} from "@/lib/bcd-agent-fleet";

export type OrchestrationDecision = {
  taskKey: string;
  ceoAgentId: typeof CEO_AGENT_ID;
  primary: FleetAgent;
  backups: FleetAgent[];
  notes: string;
};

export function planOrchestration(taskKey: string): OrchestrationDecision {
  const hint = TASK_ROUTE_HINTS[taskKey];
  const ceo = AGENT_FLEET.find((a) => a.id === CEO_AGENT_ID)!;
  if (!hint) {
    return {
      taskKey,
      ceoAgentId: CEO_AGENT_ID,
      primary: ceo,
      backups: [],
      notes: "Unmapped task — CEO holds until you add routing rules.",
    };
  }
  const primary = AGENT_FLEET.find((a) => a.id === hint.primary) ?? ceo;
  const backups = hint.backups
    .map((id) => AGENT_FLEET.find((a) => a.id === id))
    .filter(Boolean) as FleetAgent[];
  return {
    taskKey,
    ceoAgentId: CEO_AGENT_ID,
    primary,
    backups,
    notes: hint.notes,
  };
}
