import { prisma } from "@ankommen/database";
import { createEmbedding, getEmbeddingModel, isLlmConfigured } from "../llm-client.js";

export interface RagResult {
  id: string;
  title: string;
  url: string | null;
  content: string;
  score: number;
}

async function keywordFallback(query: string, limit: number): Promise<RagResult[]> {
  const sources = await prisma.knowledgeSource.findMany({
    where: {
      OR: [
        { content: { contains: query.split(" ")[0], mode: "insensitive" } },
        { title: { contains: query.split(" ")[0], mode: "insensitive" } },
      ],
    },
    take: limit,
  });
  return sources.map((s) => ({
    id: s.id,
    title: s.title,
    url: s.url,
    content: s.content.slice(0, 1500),
    score: s.confidenceScore,
  }));
}

async function recentVerifiedFallback(limit: number): Promise<RagResult[]> {
  const sources = await prisma.knowledgeSource.findMany({
    where: { parentId: null, isVerified: true },
    take: limit,
    orderBy: { updatedAt: "desc" },
  });
  return sources.map((s) => ({
    id: s.id,
    title: s.title,
    url: s.url,
    content: s.content.slice(0, 1500),
    score: s.confidenceScore,
  }));
}

export async function searchKnowledge(query: string, limit = 5): Promise<RagResult[]> {
  if (!isLlmConfigured() || !getEmbeddingModel()) {
    return recentVerifiedFallback(limit);
  }

  const embedding = await createEmbedding(query);
  if (!embedding) {
    return keywordFallback(query, limit);
  }

  const vectorStr = `[${embedding.join(",")}]`;

  try {
    const results = await prisma.$queryRaw<
      Array<{ id: string; title: string; url: string | null; content: string; score: number }>
    >`
      SELECT ks.id, ks.title, ks.url, ks.content,
             1 - (ke.embedding <=> ${vectorStr}::vector) AS score
      FROM knowledge_embeddings ke
      JOIN "KnowledgeSource" ks ON ks.id = ke."sourceId"
      ORDER BY ke.embedding <=> ${vectorStr}::vector
      LIMIT ${limit}
    `;
    return results;
  } catch {
    return keywordFallback(query, limit);
  }
}

export function formatCitations(results: RagResult[]) {
  return results.map((r) => ({
    sourceId: r.id,
    title: r.title,
    url: r.url,
    excerpt: r.content.slice(0, 200),
    confidence: r.score,
  }));
}

export function formatContext(results: RagResult[]): string {
  if (results.length === 0) return "No specific knowledge base matches found. Use general guidance and recommend official sources.";
  return results
    .map((r, i) => `[Source ${i + 1}: ${r.title}${r.url ? ` (${r.url})` : ""}]\n${r.content.slice(0, 800)}`)
    .join("\n\n");
}
