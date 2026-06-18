import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const emailSchema = z.string().email();
const planSchema = z.enum(["MONTHLY", "LIFETIME"]);

const signupInputSchema = z.object({
  email: emailSchema,
  name: z.string().min(2).max(80),
  trackSlug: z.string().min(1),
  plan: planSchema.default("MONTHLY"),
  referralCode: z.string().optional(),
});

export const getCheckoutMode = createServerFn({ method: "GET" }).handler(async () => {
  const { handleGetCheckoutMode } = await import("./checkout.handlers.server");
  return handleGetCheckoutMode();
});

export const startCheckout = createServerFn({ method: "POST" })
  .inputValidator(signupInputSchema)
  .handler(async ({ data }) => {
    const { handleStartCheckout } = await import("./checkout.handlers.server");
    return handleStartCheckout(data);
  });

export const fulfillCheckout = createServerFn({ method: "POST" })
  .inputValidator(z.object({ sessionId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { handleFulfillCheckout } = await import("./checkout.handlers.server");
    return handleFulfillCheckout(data.sessionId);
  });
