import { z } from "zod";

export const waitlistBodySchema = z.object({
  email: z.string().email().max(320),
  name: z.string().max(200).optional(),
  role: z.string().max(128).optional(),
  source: z.string().max(128).optional(),
});

export const onboardingCompleteBodySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  intent: z.enum(["explore", "build", "gather"]).optional(),
  email: z.string().email().optional(),
  message: z.string().min(10),
  signature: z.string().min(10),
});
