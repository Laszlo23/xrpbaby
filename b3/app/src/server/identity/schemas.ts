import { z } from "zod";

const cultureNameSchema = z
  .string()
  .min(3)
  .max(64)
  .regex(/^[a-z0-9]+(\.[a-z]+)?$/i, "Expected handle.tld");

export const verifyCultureNameBodySchema = z.object({
  cultureName: cultureNameSchema,
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  message: z.string().min(10),
  signature: z.string().min(10),
});
