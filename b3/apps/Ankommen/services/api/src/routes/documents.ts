import type { FastifyPluginAsync } from "fastify";
import { prisma } from "@ankommen/database";
import { analyzeDocument } from "@ankommen/ai";
import { uploadFile } from "../lib/storage.js";
import { getEntitlements } from "../lib/entitlements.js";
import { nanoid } from "nanoid";

export const documentRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("onRequest", app.authenticate);

  app.get("/", async (request) => {
    return prisma.uploadedDocument.findMany({
      where: { userId: request.user.sub },
      include: { analysis: true },
      orderBy: { createdAt: "desc" },
    });
  });

  app.post("/upload", async (request, reply) => {
    const entitlements = await getEntitlements(request.user.sub);
    if (!entitlements.canUploadDocument) {
      return reply.paymentRequired("Document upload limit reached");
    }

    const data = await request.file();
    if (!data) return reply.badRequest("No file uploaded");

    const buffer = await data.toBuffer();
    const fileName = data.filename ?? "document";
    const mimeType = data.mimetype ?? "application/octet-stream";
    const s3Key = `documents/${request.user.sub}/${nanoid()}-${fileName}`;

    await uploadFile(s3Key, buffer, mimeType);

    const doc = await prisma.uploadedDocument.create({
      data: {
        userId: request.user.sub,
        fileName,
        mimeType,
        fileSize: buffer.length,
        s3Key,
        status: "PROCESSING",
      },
    });

    let ocrText = "";
    if (mimeType.startsWith("text/")) {
      ocrText = buffer.toString("utf-8");
    } else if (mimeType.startsWith("image/") || mimeType === "application/pdf") {
      ocrText = `[Document uploaded: ${fileName}. OCR processing requires OPENAI_API_KEY for vision analysis.]`;
    }

    let analysis = null;
    if (entitlements.canAnalyzeDocument && ocrText.length > 10) {
      const result = await analyzeDocument(ocrText);
      analysis = await prisma.documentAnalysis.create({
        data: {
          documentId: doc.id,
          summary: result.answer,
          deadlines: [],
          requiredAction: result.nextSteps[0] ?? null,
          riskLevel: "medium",
          nextSteps: result.nextSteps,
          disclaimer: result.disclaimer,
        },
      });
    }

    const updated = await prisma.uploadedDocument.update({
      where: { id: doc.id },
      data: { status: "READY", ocrText: ocrText || null },
      include: { analysis: true },
    });

    return { document: updated, analysis };
  });

  app.get("/:id/analysis", async (request, reply) => {
    const { id } = request.params as { id: string };
    const doc = await prisma.uploadedDocument.findFirst({
      where: { id, userId: request.user.sub },
      include: { analysis: true },
    });
    if (!doc) return reply.notFound();
    return doc;
  });

  app.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const doc = await prisma.uploadedDocument.findFirst({
      where: { id, userId: request.user.sub },
    });
    if (!doc) return reply.notFound();
    await prisma.uploadedDocument.delete({ where: { id } });
    return { deleted: true };
  });
};
