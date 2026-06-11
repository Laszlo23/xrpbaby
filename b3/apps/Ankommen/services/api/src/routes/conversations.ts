import type { FastifyPluginAsync } from "fastify";
import { prisma, AgentType } from "@ankommen/database";
import { runAgent } from "@ankommen/ai";
import { checkAIQuota } from "../lib/entitlements.js";
import { z } from "zod";

export const conversationRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", app.authenticate);

  app.get("/", async (request) => {
    return prisma.conversation.findMany({
      where: { userId: request.user.sub },
      orderBy: { updatedAt: "desc" },
      take: 20,
    });
  });

  app.post("/", async (request) => {
    const body = z
      .object({
        title: z.string().optional(),
        agentType: z.nativeEnum(AgentType).optional(),
        language: z.string().optional(),
      })
      .parse(request.body ?? {});

    return prisma.conversation.create({
      data: {
        userId: request.user.sub,
        title: body.title,
        agentType: body.agentType ?? "AUSTRIA_GUIDE",
        language: body.language ?? "en",
      },
    });
  });

  app.get("/:id/messages", async (request, reply) => {
    const { id } = request.params as { id: string };
    const conversation = await prisma.conversation.findFirst({
      where: { id, userId: request.user.sub },
    });
    if (!conversation) return reply.notFound();
    return prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
    });
  });

  app.post("/:id/messages", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = z.object({ content: z.string().min(1) }).parse(request.body);

    const conversation = await prisma.conversation.findFirst({
      where: { id, userId: request.user.sub },
      include: { messages: { orderBy: { createdAt: "asc" }, take: 10 } },
    });
    if (!conversation) return reply.notFound();

    await checkAIQuota(request.user.sub);

    const profile = await prisma.profile.findUnique({ where: { userId: request.user.sub } });

    await prisma.message.create({
      data: { conversationId: id, role: "user", content: body.content },
    });

    const accept = request.headers.accept ?? "";
    const wantsStream = accept.includes("text/event-stream");

    const agentResponse = await runAgent({
      message: body.content,
      agentType: conversation.agentType,
      language: conversation.language,
      profileContext: profile
        ? `City: ${profile.city}, Nationality: ${profile.nationality}, Status: ${profile.residenceStatus}, Goal: ${profile.mainGoal}`
        : undefined,
      history: conversation.messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const assistantMessage = await prisma.message.create({
      data: {
        conversationId: id,
        role: "assistant",
        content: agentResponse.answer,
        agentType: conversation.agentType,
        citations: agentResponse.citations,
        tokenUsage: agentResponse.tokenUsage,
        confidence: agentResponse.confidence,
      },
    });

    await prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } });

    if (wantsStream) {
      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      const chunks = agentResponse.answer.match(/.{1,80}/g) ?? [agentResponse.answer];
      for (const chunk of chunks) {
        reply.raw.write(`data: ${JSON.stringify({ type: "chunk", content: chunk })}\n\n`);
      }
      reply.raw.write(`data: ${JSON.stringify({ type: "done", message: assistantMessage, nextSteps: agentResponse.nextSteps, citations: agentResponse.citations })}\n\n`);
      reply.raw.end();
      return reply;
    }

    return {
      message: assistantMessage,
      nextSteps: agentResponse.nextSteps,
      citations: agentResponse.citations,
      disclaimer: agentResponse.disclaimer,
    };
  });
};
