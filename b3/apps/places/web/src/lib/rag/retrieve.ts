export type RagChunk = { id: string; source: string; text: string };

const STOP = new Set([
  "the",
  "and",
  "for",
  "are",
  "but",
  "not",
  "you",
  "all",
  "can",
  "her",
  "was",
  "one",
  "our",
  "out",
  "has",
  "have",
  "been",
  "from",
  "with",
  "they",
  "this",
  "that",
  "will",
  "your",
  "what",
  "when",
  "which",
  "their",
  "about",
  "into",
  "than",
  "then",
  "them",
  "these",
  "some",
  "such",
  "only",
  "other",
  "more",
]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

/** Cheap lexical retrieval — no embedding API required. */
export function retrieveTopK(query: string, chunks: RagChunk[], k: number): RagChunk[] {
  const qTokens = new Set(tokenize(query));
  if (qTokens.size === 0) return chunks.slice(0, k);

  const scored = chunks.map((c) => {
    const ct = tokenize(c.text);
    let score = 0;
    const seen = new Set<string>();
    for (const t of ct) {
      if (qTokens.has(t) && !seen.has(t)) {
        seen.add(t);
        score += 1;
      }
    }
    // Boost title-like lines
    if (/^#\s/.test(c.text) || c.text.includes("Primary vs secondary")) score += 2;
    return { c, score };
  });

  scored.sort((a, b) => b.score - a.score);
  if (scored[0]?.score === 0) return chunks.slice(0, k);
  return scored.slice(0, k).map((s) => s.c);
}

export function formatRagBlock(chunks: RagChunk[]): string {
  if (!chunks.length) return "";
  return chunks
    .map((ch, i) => `---\n[${i + 1}] source:${ch.source} id:${ch.id}\n${ch.text}\n`)
    .join("\n");
}
