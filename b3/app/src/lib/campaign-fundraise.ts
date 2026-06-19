import { HQ_FUNDRAISE_GOAL_USD, TRIPLE_333_TICKET_GOAL } from "@/lib/packs";

export function hqProgressPercent(raisedUsd: number): number {
  if (HQ_FUNDRAISE_GOAL_USD <= 0) return 0;
  return Math.min(100, Math.round((raisedUsd / HQ_FUNDRAISE_GOAL_USD) * 100));
}

export function triple333TicketsSold(count: number): number {
  return Math.min(TRIPLE_333_TICKET_GOAL, count);
}

export function triple333RoundPercent(ticketsSold: number): number {
  return Math.min(100, Math.round((ticketsSold / TRIPLE_333_TICKET_GOAL) * 100));
}
