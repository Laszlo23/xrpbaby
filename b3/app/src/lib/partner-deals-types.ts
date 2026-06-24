export type ServiceDealMetadata = {
  version: 1;
  title: string;
  provider: string;
  payer: string;
  payment: { token: "USDC"; chainId: number; amount: string };
  deliverBy: string;
  deliverables: {
    id: string;
    description: string;
    weightBps: number;
    kpis: { metric: string; target: number; source: string }[];
  }[];
  evidenceRequirements: string[];
};
