import { BC_CORPUS_CHUNKS } from "@/server/elias/corpus/bc-corpus";
import type { BcCorpusChunk } from "@/server/elias/corpus/bc-corpus";
import { getEliasSupabaseAdmin } from "@/server/elias/supabase";

function normalize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

export type RetrievedChunk = { id: string; title: string; excerpt: string; score: number };

/** Lexical overlap MVP — swaps for embeddings when infra ready */
type CorpusCache = { chunks: BcCorpusChunk[]; fetchedAtMs: number };

let corpusCache: CorpusCache | null = null;
const CORPUS_CACHE_TTL_MS = 60_000;

async function loadCorpusChunks(): Promise<BcCorpusChunk[]> {
  const sb = getEliasSupabaseAdmin();
  if (!sb) return BC_CORPUS_CHUNKS;

  const now = Date.now();
  if (corpusCache && now - corpusCache.fetchedAtMs < CORPUS_CACHE_TTL_MS) {
    return corpusCache.chunks;
  }

  const { data, error } = await sb
    .from("elias_corpus_chunks")
    .select("id, title, tags, body")
    .order("id", { ascending: true })
    .limit(250);

  if (error || !data || data.length === 0) return BC_CORPUS_CHUNKS;

  const chunks = data.map((r) => ({
    id: String((r as { id: unknown }).id),
    title: String((r as { title: unknown }).title),
    tags: Array.isArray((r as { tags?: unknown }).tags)
      ? ((r as { tags: unknown[] }).tags.map((t) => String(t)) as string[])
      : [],
    body: String((r as { body: unknown }).body),
  }));

  corpusCache = { chunks, fetchedAtMs: now };
  return chunks;
}

export async function retrieveBcCorpus(
  query: string,
  opts?: { topK?: number; maxChars?: number },
): Promise<{
  chunks: RetrievedChunk[];
  contextBlock: string;
}> {
  const topK = opts?.topK ?? 5;
  const maxChars = opts?.maxChars ?? 3200;
  const qt = normalize(query);
  const sourceChunks = await loadCorpusChunks();
  const scored = sourceChunks
    .map((c) => {
      const bag = new Set([
        ...normalize(c.title),
        ...normalize(c.body),
        ...c.tags.map((t) => t.toLowerCase()),
      ]);
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
