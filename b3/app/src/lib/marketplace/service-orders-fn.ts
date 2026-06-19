import { createServerFn } from "@tanstack/react-start";

export type ServiceOrderMilestone = {
  id: string;
  index: number;
  title: string;
  status: string;
};

export type ServiceOrderRow = {
  id: string;
  slug: string;
  wallet: string;
  status: string;
  amountUsdc: string;
  x402TxHash: string | null;
  createdAt: string;
  milestones: ServiceOrderMilestone[];
};

export type ServiceOrdersDashboard = {
  ok: boolean;
  orders: ServiceOrderRow[];
  totals: {
    count: number;
    usdcCollected: number;
    inFlight: number;
    estMarginUsd: number;
    reinvestPoolUsd: number;
  };
};

/** Server-only: internal service orders dashboard for agent fleet. */
export const fetchServiceOrdersDashboardFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<ServiceOrdersDashboard> => {
    const { serviceOrdersDashboard } = await import("@/server/marketplace/service-orders");
    return serviceOrdersDashboard() as Promise<ServiceOrdersDashboard>;
  },
);
