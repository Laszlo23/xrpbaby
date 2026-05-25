import type { OnchainIdentity } from "@/lib/chain/identityContract";

export type NftVisualInput = {
  handle: string;
  tld: string;
  fullName: string;
  tokenId: bigint;
  isFounding: boolean;
};

export function toNftVisualInput(identity: OnchainIdentity): NftVisualInput {
  return {
    handle: identity.handle,
    tld: identity.tld,
    fullName: identity.fullName,
    tokenId: identity.tokenId,
    isFounding: identity.isFounding,
  };
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Wallet / marketplace NFT artwork — name is the hero. */
export function buildIdentityNftSvg(input: NftVisualInput): string {
  const handle = escapeXml(input.handle);
  const tld = escapeXml(input.tld);
  const fullName = escapeXml(input.fullName);
  const tokenId = input.tokenId.toString();
  const accent = input.isFounding ? "#d4a853" : "#5b8def";
  const accentSoft = input.isFounding ? "rgba(212,168,83,0.35)" : "rgba(91,141,239,0.35)";
  const badge = input.isFounding ? "FOUNDING MEMBER" : "CULTURE LAYER";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="600" y2="800" gradientUnits="userSpaceOnUse">
      <stop stop-color="#12151c"/>
      <stop offset="0.45" stop-color="#181d28"/>
      <stop offset="1" stop-color="#0c0e14"/>
    </linearGradient>
    <linearGradient id="glow" x1="300" y1="120" x2="300" y2="520" gradientUnits="userSpaceOnUse">
      <stop stop-color="${accent}" stop-opacity="0.45"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </linearGradient>
    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M24 0H0V24" stroke="white" stroke-opacity="0.04"/>
    </pattern>
  </defs>
  <rect width="600" height="800" rx="32" fill="url(#bg)"/>
  <rect width="600" height="800" rx="32" fill="url(#grid)"/>
  <ellipse cx="300" cy="280" rx="220" ry="160" fill="url(#glow)"/>
  <rect x="28" y="28" width="544" height="744" rx="24" stroke="white" stroke-opacity="0.1"/>
  <rect x="28" y="28" width="544" height="744" rx="24" stroke="${accent}" stroke-opacity="0.25"/>
  <text x="52" y="72" fill="white" fill-opacity="0.45" font-family="ui-monospace, monospace" font-size="13" letter-spacing="0.28em">CULTURE LAYER · ERC-721</text>
  <text x="52" y="108" fill="${accent}" font-family="ui-monospace, monospace" font-size="12" letter-spacing="0.2em">${badge}</text>
  <text x="52" y="340" fill="#f4f5f7" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="600">${handle}</text>
  <text x="52" y="418" fill="${accent}" font-family="ui-serif, Georgia, serif" font-size="64" font-style="italic">.${tld}</text>
  <text x="52" y="468" fill="white" fill-opacity="0.35" font-family="ui-monospace, monospace" font-size="16">${fullName}</text>
  <rect x="52" y="500" width="200" height="36" rx="18" fill="${accentSoft}" stroke="${accent}" stroke-opacity="0.5"/>
  <text x="72" y="524" fill="${accent}" font-family="ui-monospace, monospace" font-size="13" letter-spacing="0.12em">TOKEN #${tokenId}</text>
  <text x="52" y="720" fill="white" fill-opacity="0.3" font-family="ui-monospace, monospace" font-size="12">Transferable identity · Base</text>
  <circle cx="548" cy="72" r="6" fill="${accent}"/>
</svg>`;
}

export function buildNftImageDataUrl(input: NftVisualInput): string {
  const svg = buildIdentityNftSvg(input);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function buildNftMetadata(
  input: NftVisualInput,
  origin: string,
): {
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: Array<{ trait_type: string; value: string }>;
} {
  const tokenId = input.tokenId.toString();
  const imageUrl = `${origin}/api/nft/${tokenId}/image`;
  return {
    name: `${input.fullName} · Culture Layer`,
    description: `Culture Layer identity ${input.fullName} on Base. Trade this name on secondary markets.`,
    image: imageUrl,
    external_url: `${origin}/id/${input.fullName}`,
    attributes: [
      { trait_type: "Name", value: input.fullName },
      { trait_type: "Handle", value: input.handle },
      { trait_type: "TLD", value: `.${input.tld}` },
      { trait_type: "Token ID", value: tokenId },
      { trait_type: "Founding Member", value: input.isFounding ? "Yes" : "No" },
    ],
  };
}
