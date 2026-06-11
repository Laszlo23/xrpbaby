import type { FastifyPluginAsync } from "fastify";
import { prisma, Prisma } from "@ankommen/database";
import { runBenefitCheck } from "@ankommen/ai";
import { checkAIQuota } from "../lib/entitlements.js";
import { z } from "zod";

export const benefitRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", app.authenticate);

  app.post("/", async (request) => {
    await checkAIQuota(request.user.sub);
    const answers = z.record(z.unknown()).parse(request.body);
    const profile = await prisma.profile.findUnique({ where: { userId: request.user.sub } });
    const result = await runBenefitCheck(answers, profile?.preferredLang ?? "en");

    return prisma.benefitCheck.create({
      data: {
        userId: request.user.sub,
        answers: answers as Prisma.InputJsonValue,
        results: {
          answer: result.answer,
          nextSteps: result.nextSteps,
          citations: result.citations,
          confidence: result.confidence,
        },
        disclaimer: result.disclaimer,
      },
    });
  });

  app.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const check = await prisma.benefitCheck.findFirst({
      where: { id, userId: request.user.sub },
    });
    if (!check) return reply.notFound();
    return check;
  });

  app.get("/", async (request) => {
    return prisma.benefitCheck.findMany({
      where: { userId: request.user.sub },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  });
};
