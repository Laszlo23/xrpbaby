import { z } from "zod";

const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/);

export const serviceDealKpiSchema = z.object({
  metric: z.string().min(1),
  target: z.number().nonnegative(),
  source: z.string().min(1),
});

export const serviceDealDeliverableSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  weightBps: z.number().int().min(0).max(10_000),
  kpis: z.array(serviceDealKpiSchema).min(1),
});

export const serviceDealMetadataSchema = z.object({
  version: z.literal(1),
  title: z.string().min(1),
  provider: addressSchema,
  payer: addressSchema,
  payment: z.object({
    token: z.literal("USDC"),
    chainId: z.number().int().positive(),
    amount: z.string().regex(/^\d+$/),
  }),
  deliverBy: z.string().datetime(),
  deliverables: z.array(serviceDealDeliverableSchema).min(1),
  evidenceRequirements: z.array(z.string().min(1)).min(1),
});

export const serviceDealEvidenceSchema = z.object({
  version: z.literal(1),
  dealId: z.number().int().positive(),
  dealMetadataHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  submittedAt: z.string().datetime(),
  submittedBy: addressSchema,
  artifacts: z.array(
    z.object({
      type: z.string().min(1),
      uri: z.string().min(1),
      note: z.string().optional(),
    }),
  ),
  metrics: z.record(z.union([z.number(), z.string(), z.boolean()])),
});

export const serviceDealKpiResultSchema = z.object({
  deliverableId: z.string().min(1),
  metric: z.string().min(1),
  target: z.number(),
  actual: z.number(),
  scoreBps: z.number().int().min(0).max(10_000),
  met: z.boolean(),
});

export const serviceDealRulingSchema = z.object({
  version: z.literal(1),
  dealId: z.number().int().positive(),
  dealMetadataHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  payoutBps: z.number().int().min(0).max(10_000),
  evaluatedAt: z.string().datetime(),
  evaluator: z.enum(["ai_oracle", "council_override"]),
  confidence: z.number().min(0).max(1).optional(),
  kpiResults: z.array(serviceDealKpiResultSchema),
  reasoning: z.string().min(1),
});

export type ServiceDealMetadata = z.infer<typeof serviceDealMetadataSchema>;
export type ServiceDealEvidence = z.infer<typeof serviceDealEvidenceSchema>;
export type ServiceDealRuling = z.infer<typeof serviceDealRulingSchema>;

export function validateDeliverableWeights(metadata: ServiceDealMetadata): boolean {
  const sum = metadata.deliverables.reduce((acc, d) => acc + d.weightBps, 0);
  return sum === 10_000;
}
