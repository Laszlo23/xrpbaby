/**
 * Builds web/src/lib/rag/corpus.json from repo markdown (run from repo root: node web/scripts/build-rag-corpus.cjs).
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const outPath = path.join(__dirname, "..", "src", "lib", "rag", "corpus.json");

const sources = [
  { id: "readme", file: "README.md" },
  { id: "web-readme", file: "web/README.md" },
  { id: "deployments-readme", file: "deployments/README.md" },
  { id: "docs-compliance", file: "docs/compliance.md" },
  { id: "docs-domain", file: "docs/domain-model.md" },
  { id: "docs-grants", file: "docs/grants.md" },
  { id: "docs-mainnet", file: "docs/mainnet-readiness.md" },
  { id: "docs-primary-sale", file: "docs/primary-sale.md" },
  { id: "docs-token-standard", file: "docs/token-standard.md" },
];

function chunkText(text, sourceId, maxLen = 1400) {
  const stripped = text
    .replace(/\r\n/g, "\n")
    .replace(/```[\s\S]*?```/g, "\n")
    .trim();
  const parts = stripped.split(/\n(?=#{1,3}\s)/);
  const chunks = [];
  let i = 0;
  for (const part of parts) {
    const p = part.trim();
    if (!p) continue;
    if (p.length <= maxLen) {
      chunks.push({ id: `${sourceId}-${i++}`, source: sourceId, text: p });
      continue;
    }
    for (let o = 0; o < p.length; o += maxLen) {
      chunks.push({
        id: `${sourceId}-${i++}`,
        source: sourceId,
        text: p.slice(o, o + maxLen),
      });
    }
  }
  return chunks;
}

function main() {
  const all = [];
  for (const { id, file } of sources) {
    const fp = path.join(root, file);
    if (!fs.existsSync(fp)) {
      console.warn("skip missing:", fp);
      continue;
    }
    const raw = fs.readFileSync(fp, "utf8");
    all.push(...chunkText(raw, id));
  }

  // Static UX summary for how-it-works (TSX not parsed here)
  all.push({
    id: "how-it-works-static",
    source: "how-it-works",
    text: `How it works (Building Culture): Connect a wallet on Base mainnet (chain id 8453). KYC may be required for restricted tokens. Each property can have an ERC-20 share token for fractional economic interest—not automatic legal land title. Primary vs secondary: one whole share is about $1000 notional at seed; primary sales can require whole shares; the AMM on Trade allows fractional secondary trading. Liquidity: wrap ETH to WETH, add WETH+share on Pool or use bootstrap scripts. Risks: smart contract and liquidity risk; not investment advice. See /legal/risk.`,
  });

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({ chunks: all, version: 1 }, null, 0), "utf8");
  console.log("wrote", outPath, "chunks:", all.length);
}

main();
