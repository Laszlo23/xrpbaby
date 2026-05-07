import { BC_CORPUS_CHUNKS } from "@/server/elias/corpus/bc-corpus";

function normalize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

export type RetrievedChunk = { id: string; title: string; excerpt: string; score: number };

/** Lexical overlap MVP — swaps for embeddings when infra ready */
export function retrieveBcCorpus(query: string, opts?: { topK?: number; maxChars?: number }): {
  chunks: RetrievedChunk[];
  contextBlock: string;
} {
  const topK = opts?.topK ?? 5;
  const maxChars = opts?.maxChars ?? 3200;
  const qt = normalize(query);
  const scored = BC_CORPUS_CHUNKS.map((c) => {
    const bag = new Set([...normalize(c.title), ...normalize(c.body), ...c.tags.map((t) => t.toLowerCase())]);
    let score = 0;
    for (const w of qt) {
      if (bag.has(w)) score += 1;
    }
    return { chunk: c, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  const chunks: RetrievedChunk[] = scored.map(({ chunk: c, score }) => ({
    id: c.id,
    title: c.title,
    excerpt: c.body.slice(0, 700) + (c.body.length > 700 ? "…" : ""),
    score,
  }));

  let ctx = chunks.map((x) => `### ${x.title} [${x.id}]\n${x.excerpt}`).join("\n\n");
  if (ctx.length > maxChars) ctx = ctx.slice(0, maxChars) + "\n…";

  const contextBlock = ctx.trim()
    ? `--- Retrieved corpus (cite titles; do not invent facts beyond this) ---\n${ctx}\n---`
    : "";

  return { chunks, contextBlock };
}
