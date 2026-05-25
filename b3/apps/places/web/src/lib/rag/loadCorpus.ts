import type { RagChunk } from "./retrieve";

import localCorpus from "./corpus.json";

type CorpusFile = { chunks: RagChunk[]; version?: number };

let remoteMerged: RagChunk[] | null = null;
let remoteFetchedAt = 0;
const REMOTE_TTL_MS = 5 * 60 * 1000;

export function getLocalCorpusChunks(): RagChunk[] {
  const f = localCorpus as CorpusFile;
  return f.chunks ?? [];
}

/** Optional: merge chunks from RAG_CORPUS_URL (JSON { chunks: [...] }). Cached ~5m. */
export async function getCorpusChunks(): Promise<RagChunk[]> {
  const local = getLocalCorpusChunks();
  const url = process.env.RAG_CORPUS_URL;
  if (!url) return local;

  const now = Date.now();
  if (remoteMerged && now - remoteFetchedAt < REMOTE_TTL_MS) {
    return remoteMerged;
  }

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return local;
    const data = (await res.json()) as CorpusFile;
    const extra = data.chunks ?? [];
    const seen = new Set(local.map((c) => c.id));
    const merged = [...local];
    for (const c of extra) {
      if (!seen.has(c.id)) {
        seen.add(c.id);
        merged.push(c);
      }
    }
    remoteMerged = merged;
    remoteFetchedAt = now;
    return merged;
  } catch {
    return local;
  }
}
