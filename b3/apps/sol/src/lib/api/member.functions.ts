import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const emailSchema = z.string().email();
const planSchema = z.enum(["TRIAL", "MONTHLY", "LIFETIME"]);
const buildFocusSchema = z.enum(["life", "digital", "mind", "all"]);

export const signUp = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: emailSchema,
      name: z.string().min(2).max(80),
      trackSlug: z.string().min(1),
      plan: planSchema.default("MONTHLY"),
      referralCode: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { handleSignUp } = await import("./member.handlers.server");
    return handleSignUp(data);
  });

export const loginDemo = createServerFn({ method: "POST" }).handler(async () => {
  const { handleLoginDemo } = await import("./member.handlers.server");
  return handleLoginDemo();
});

export const login = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: emailSchema }))
  .handler(async ({ data }) => {
    const { handleLogin } = await import("./member.handlers.server");
    return handleLogin(data.email);
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const { handleLogout } = await import("./member.handlers.server");
  return handleLogout();
});

export const getMemberDashboard = createServerFn({ method: "GET" }).handler(async () => {
  const { handleGetMemberDashboard } = await import("./member.handlers.server");
  return handleGetMemberDashboard();
});

export const setBuildFocus = createServerFn({ method: "POST" })
  .inputValidator(z.object({ focus: buildFocusSchema }))
  .handler(async ({ data }) => {
    const { handleSetBuildFocus } = await import("./member.handlers.server");
    return handleSetBuildFocus(data.focus);
  });

export const saveIdentity = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      q1: z.string().max(500),
      q2: z.string().max(500),
      q3: z.string().max(500),
      q4: z.string().max(500),
      q5: z.string().max(500),
    }),
  )
  .handler(async ({ data }) => {
    const { handleSaveIdentity } = await import("./member.handlers.server");
    return handleSaveIdentity(data);
  });

export const saveChecklist = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      slug: z.string().min(1),
      checked: z.array(z.number()),
    }),
  )
  .handler(async ({ data }) => {
    const { handleSaveChecklist } = await import("./member.handlers.server");
    return handleSaveChecklist(data.slug, data.checked);
  });

export const completeDeliverable = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      slug: z.string().min(1),
      reflectionNote: z.string().max(2000).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { handleCompleteDeliverable } = await import("./member.handlers.server");
    return handleCompleteDeliverable(data.slug, data.reflectionNote);
  });

export const saveJournalEntry = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      body: z.string().min(1).max(5000),
      mood: z.number().min(1).max(10).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { handleSaveJournalEntry } = await import("./member.handlers.server");
    return handleSaveJournalEntry(data.body, data.mood);
  });

export const getJournalEntries = createServerFn({ method: "GET" }).handler(async () => {
  const { handleGetJournalEntries } = await import("./member.handlers.server");
  return handleGetJournalEntries();
});

export const getPartnerTree = createServerFn({ method: "GET" }).handler(async () => {
  const { handleGetPartnerTree } = await import("./member.handlers.server");
  return handleGetPartnerTree();
});

export const saveMorningMood = createServerFn({ method: "POST" })
  .inputValidator(z.object({ energySlug: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { handleSaveMorningMood } = await import("./member.handlers.server");
    return handleSaveMorningMood(data.energySlug);
  });

export const saveEveningMood = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      innerSlug: z.string().min(1),
      momentumSlug: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const { handleSaveEveningMood } = await import("./member.handlers.server");
    return handleSaveEveningMood(data.innerSlug, data.momentumSlug);
  });

export const getMoodTimeline = createServerFn({ method: "GET" }).handler(async () => {
  const { handleGetMoodTimeline } = await import("./member.handlers.server");
  return handleGetMoodTimeline();
});
