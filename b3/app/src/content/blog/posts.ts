/**
 * Static blog posts (trusted HTML — edit here or migrate to Strapi later).
 */
export type BlogPost = {
  slug: string;
  title: string;
  /** ISO 8601 date */
  publishedAt: string;
  excerpt: string;
  author: string;
  /** Trusted HTML body */
  html: string;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "welcome-to-buildchain",
    title: "Welcome to BUILDCHAIN",
    publishedAt: "2026-05-01",
    excerpt:
      "Fair drops, real venues, and verifiable play — why we built BUILDCHAIN on Base and how to get started.",
    author: "BUILDCHAIN",
    html: `
<p>RWA drops should feel like culture, not a rug-pull simulator. BUILDCHAIN is where travel, art, and moments meet on-chain fairness: transparent odds, NFT tickets you can verify, and payouts that respect the community.</p>
<h2>What you can do today</h2>
<ul>
<li>Browse <strong>drops</strong> for stays and experiences.</li>
<li>Collect and trade on the <strong>marketplace</strong>.</li>
<li>Earn points on <strong>mission</strong> and show up on the <strong>leaderboard</strong>.</li>
</ul>
<p>Connect your wallet, pick a network we support, and play above board — the ledger remembers who showed up.</p>
`,
  },
  {
    slug: "fair-drops-verifiable-odds",
    title: "Fair drops & verifiable odds",
    publishedAt: "2026-05-02",
    excerpt:
      "How BUILDCHAIN keeps raffle and campaign mechanics transparent — from on-chain draws to clear eligibility.",
    author: "BUILDCHAIN",
    html: `
<p>Trust isn’t a slogan; it’s something users can audit. We bias toward open contracts, readable rules in-product, and flows that don’t hide fees or eligibility behind vague copy.</p>
<h2>What “fair” means here</h2>
<p>Campaign parameters live close to the contracts that enforce them. When we publish odds or caps, the goal is for builders and players to point at the same source of truth.</p>
<h2>Base-first</h2>
<p>BUILDCHAIN runs where liquidity and tooling already serve creators — <strong>Base</strong> is our primary home for new drops and integrations. Always confirm network in your wallet before minting or settling.</p>
`,
  },
  {
    slug: "bcd-mission-and-builder-loop",
    title: "BCD, mission, and the builder loop",
    publishedAt: "2026-05-02",
    excerpt:
      "Building Culture Dollar (BCD), XP, missions — how the loop ties drops to long-term participation.",
    author: "BUILDCHAIN",
    html: `
<p>Short-term hype burns out; loops keep communities alive. BUILDCHAIN ties drops to <strong>missions</strong>, <strong>XP</strong>, and longer arcs like genesis claims — so showing up week after week still matters.</p>
<h2>Mission beats grind</h2>
<p>Tasks should be achievable and meaningful: social proof where it’s relevant, on-chain check-ins where we can verify participation without nonsense quizzes.</p>
<h2>Profiles & builders</h2>
<p>Community profiles highlight who builds in public. Pair that with the leaderboard and you get signal — not just wallet size.</p>
`,
  },
];

export function listPostsSorted(): BlogPost[] {
  return [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export const BLOG_SLUGS: string[] = BLOG_POSTS.map((p) => p.slug);
