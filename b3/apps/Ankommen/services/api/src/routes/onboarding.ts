import type { FastifyPluginAsync } from "fastify";
import { prisma } from "@ankommen/database";
import { z } from "zod";

const onboardingSchema = z.object({
  preferredLang: z.string(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  nationality: z.string().optional(),
  residenceStatus: z.string().optional(),
  familyStatus: z.string().optional(),
  hasChildren: z.boolean().optional(),
  childrenCount: z.number().optional(),
  workStatus: z.string().optional(),
  housingStatus: z.string().optional(),
  mainGoal: z.string().optional(),
});

function buildChecklist(data: z.infer<typeof onboardingSchema>) {
  const items = [
    { id: "meldezettel", title: "Register your address (Meldezettel)", done: false, priority: "high" },
    { id: "health-insurance", title: "Get health insurance (e-card)", done: false, priority: "high" },
    { id: "bank-account", title: "Open a bank account", done: false, priority: "medium" },
    { id: "sim-card", title: "Get an Austrian SIM card", done: false, priority: "medium" },
  ];

  if (data.workStatus === "looking" || data.workStatus === "unemployed") {
    items.push({ id: "ams-register", title: "Register with AMS", done: false, priority: "high" });
  }
  if (data.hasChildren) {
    items.push({ id: "kindergarten", title: "Find kindergarten or school", done: false, priority: "high" });
    items.push({ id: "familienbeihilfe", title: "Check Familienbeihilfe eligibility", done: false, priority: "medium" });
  }
  if (data.housingStatus === "looking") {
    items.unshift({ id: "housing-search", title: "Start housing search", done: false, priority: "high" });
  }
  if (data.residenceStatus === "temporary" || data.residenceStatus === "tourist") {
    items.push({ id: "visa-check", title: "Review visa/residence permit rules", done: false, priority: "high" });
  }

  return items;
}

export const onboardingRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", app.authenticate);

  app.post("/", async (request) => {
    const data = onboardingSchema.parse(request.body);
    const checklist = buildChecklist(data);

    const profile = await prisma.profile.upsert({
      where: { userId: request.user.sub },
      update: {
        ...data,
        onboardingDone: true,
        checklist,
      },
      create: {
        userId: request.user.sub,
        ...data,
        onboardingDone: true,
        checklist,
      },
    });

    await prisma.languagePreference.upsert({
      where: { userId: request.user.sub },
      update: { interfaceLang: data.preferredLang, chatLang: data.preferredLang },
      create: {
        userId: request.user.sub,
        interfaceLang: data.preferredLang,
        chatLang: data.preferredLang,
      },
    });

    return { profile, checklist };
  });
};
