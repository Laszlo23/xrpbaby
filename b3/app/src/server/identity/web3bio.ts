import type {
  CultureIdentityGraph,
  IdentityGraphLink,
  IdentityGraphNode,
  Web3BioCredential,
  Web3BioCredentials,
  Web3BioWalletBundle,
} from "@/lib/identity/identity-graph-types";

export { DEFAULT_LANDING_GRAPH_IDENTITY } from "@/lib/identity/landing-graph";

const WEB3BIO_BASE = "https://api.web3.bio";
const FETCH_TIMEOUT_MS = 12_000;

export type Web3BioRawProfile = {
  address?: string | null;
  identity?: string;
  platform?: string;
  displayName?: string | null;
  avatar?: string | null;
  description?: string | null;
  links?: Record<string, { link?: string; handle?: string; sources?: string[] }>;
  social?: { uid?: number | null; follower?: number; following?: number };
};

function web3bioApiKey(): string | null {
  return process.env.WEB3BIO_API_KEY?.trim() || null;
}

function web3bioHeaders(): HeadersInit {
  const key = web3bioApiKey();
  if (!key) return {};
  return { "X-API-KEY": `Bearer ${key}` };
}

export function ethereumProfileQuery(address: string): string {
  return `ethereum,${address.toLowerCase()}`;
}

export async function fetchUniversalProfileRaw(identity: string): Promise<Web3BioRawProfile[]> {
  const encoded = encodeURIComponent(identity);
  try {
    const res = await fetch(`${WEB3BIO_BASE}/profile/${encoded}`, {
      headers: web3bioHeaders(),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as unknown;
    if (!Array.isArray(json)) return [];
    return json as Web3BioRawProfile[];
  } catch {
    return [];
  }
}

function mapLinks(
  raw?: Record<string, { link?: string; handle?: string }>,
): Record<string, IdentityGraphLink> {
  const out: Record<string, IdentityGraphLink> = {};
  if (!raw) return out;
  for (const [key, value] of Object.entries(raw)) {
    const link = value.link?.trim();
    const handle = value.handle?.trim();
    if (!link && !handle) continue;
    out[key] = {
      link: link ?? "",
      handle: handle ?? link ?? "",
    };
  }
  return out;
}

function nodeScore(node: IdentityGraphNode): number {
  let score = 0;
  if (node.avatar) score += 10;
  if (node.description) score += 5;
  if (node.followerCount != null) score += Math.min(node.followerCount / 100, 50);
  score += Object.keys(node.links).length * 2;
  return score;
}

export function normalizeWeb3BioProfiles(raw: Web3BioRawProfile[]): IdentityGraphNode[] {
  const byKey = new Map<string, IdentityGraphNode>();

  for (const row of raw) {
    const platform = (row.platform ?? "unknown").toLowerCase();
    const identity = (row.identity ?? "").trim();
    if (!identity) continue;

    const key = `${platform}:${identity.toLowerCase()}`;
    const followerCount =
      row.social?.follower != null && Number.isFinite(row.social.follower)
        ? row.social.follower
        : null;

    const candidate: IdentityGraphNode = {
      id: key,
      platform,
      identity,
      address: row.address?.trim().toLowerCase() ?? null,
      displayName: (row.displayName ?? identity).trim(),
      avatar: row.avatar?.trim() || null,
      description: row.description?.trim() || null,
      followerCount,
      links: mapLinks(row.links),
    };

    const existing = byKey.get(key);
    if (!existing || nodeScore(candidate) > nodeScore(existing)) {
      byKey.set(key, candidate);
    }
  }

  return [...byKey.values()].sort((a, b) => {
    const fa = a.followerCount ?? 0;
    const fb = b.followerCount ?? 0;
    if (fb !== fa) return fb - fa;
    return a.identity.localeCompare(b.identity);
  });
}

function pickPrimaryNode(graph: IdentityGraphNode[]): IdentityGraphNode | null {
  const socialPlatforms = new Set(["farcaster", "lens", "ens", "basenames", "linea"]);
  const social = graph.filter((n) => socialPlatforms.has(n.platform));
  const pool = social.length > 0 ? social : graph;
  if (pool.length === 0) return null;

  return pool.reduce((best, node) => {
    const bestScore = (best.followerCount ?? 0) + (best.avatar ? 1000 : 0);
    const nodeScoreVal = (node.followerCount ?? 0) + (node.avatar ? 1000 : 0);
    return nodeScoreVal > bestScore ? node : best;
  });
}

export function buildCultureIdentityGraph(
  raw: Web3BioRawProfile[],
  fetchedAt = new Date().toISOString(),
): CultureIdentityGraph {
  const graph = normalizeWeb3BioProfiles(raw);
  const wallets = [...new Set(graph.map((n) => n.address).filter((a): a is string => Boolean(a)))];
  const platformCounts: Record<string, number> = {};
  let totalFollowers = 0;
  let verifiedLinkCount = 0;

  for (const node of graph) {
    platformCounts[node.platform] = (platformCounts[node.platform] ?? 0) + 1;
    if (node.followerCount != null) {
      totalFollowers += node.followerCount;
    }
    verifiedLinkCount += Object.keys(node.links).length;
  }

  return {
    ok: true,
    source: "web3bio",
    primaryNode: pickPrimaryNode(graph),
    graph,
    wallets,
    platformCounts,
    totalFollowers,
    verifiedLinkCount,
    fetchedAt,
  };
}

export async function fetchCultureIdentityGraphFromAddress(
  address: string,
): Promise<CultureIdentityGraph | null> {
  const raw = await fetchUniversalProfileRaw(ethereumProfileQuery(address));
  if (raw.length === 0) return null;
  return buildCultureIdentityGraph(raw);
}

export async function fetchCultureIdentityGraphFromIdentity(
  identity: string,
): Promise<CultureIdentityGraph | null> {
  const raw = await fetchUniversalProfileRaw(identity);
  if (raw.length === 0) return null;
  return buildCultureIdentityGraph(raw);
}

type Web3BioWalletGraphNode = {
  identity?: string;
  address?: string | null;
  platform?: string;
  isPrimary?: boolean;
  displayName?: string | null;
  avatar?: string | null;
  description?: string | null;
  sources?: string[];
};

type Web3BioWalletCredentialRow = {
  platform?: string;
  category?: string;
  label?: string;
  description?: string | null;
  value?: string | null;
  link?: string | null;
};

type Web3BioWalletResponse = {
  displayName?: string | null;
  avatar?: string | null;
  description?: string | null;
  domains?: Web3BioWalletGraphNode[];
  credential?: {
    isHuman?: Web3BioWalletCredentialRow[];
    isRisky?: Web3BioWalletCredentialRow[];
    isSpam?: Web3BioWalletCredentialRow[];
  };
  identityGraph?: Web3BioWalletGraphNode[];
};

function mapWalletGraphNode(row: Web3BioWalletGraphNode): IdentityGraphNode | null {
  const platform = (row.platform ?? "unknown").toLowerCase();
  const identity = (row.identity ?? "").trim();
  if (!identity) return null;

  return {
    id: `${platform}:${identity.toLowerCase()}`,
    platform,
    identity,
    address: row.address?.trim().toLowerCase() ?? null,
    displayName: (row.displayName ?? identity).trim(),
    avatar: row.avatar?.trim() || null,
    description: row.description?.trim() || null,
    followerCount: null,
    links: {},
    isPrimary: row.isPrimary,
  };
}

function mapCredentials(rows: Web3BioWalletCredentialRow[] | undefined): Web3BioCredential[] {
  if (!rows?.length) return [];
  return rows
    .map((row) => ({
      platform: row.platform ?? "unknown",
      category: row.category ?? "unknown",
      label: row.label ?? "Credential",
      description: row.description?.trim() || null,
      value: row.value?.trim() || null,
      link: row.link?.trim() || null,
    }))
    .filter((row) => row.label.length > 0);
}

export async function fetchWeb3BioCredentials(
  identityQuery: string,
): Promise<Web3BioCredentials | null> {
  const encoded = encodeURIComponent(identityQuery);
  try {
    const res = await fetch(`${WEB3BIO_BASE}/credential/${encoded}`, {
      headers: web3bioHeaders(),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;

    const json = (await res.json()) as {
      isHuman?: Web3BioWalletCredentialRow[];
      isRisky?: Web3BioWalletCredentialRow[];
      isSpam?: Web3BioWalletCredentialRow[];
    };

    const credentials: Web3BioCredentials = {
      isHuman: mapCredentials(json.isHuman),
      isRisky: mapCredentials(json.isRisky),
      isSpam: mapCredentials(json.isSpam),
    };

    if (
      credentials.isHuman.length === 0 &&
      credentials.isRisky.length === 0 &&
      credentials.isSpam.length === 0
    ) {
      return null;
    }

    return credentials;
  } catch {
    return null;
  }
}

export async function fetchWeb3BioWalletBundle(
  address: string,
): Promise<Web3BioWalletBundle | null> {
  if (!web3bioApiKey()) return null;

  const encoded = encodeURIComponent(address.toLowerCase());
  try {
    const res = await fetch(`${WEB3BIO_BASE}/wallet/${encoded}`, {
      headers: web3bioHeaders(),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;

    const json = (await res.json()) as Web3BioWalletResponse;
    const graphNodes = [...(json.identityGraph ?? []), ...(json.domains ?? [])]
      .map(mapWalletGraphNode)
      .filter((node): node is IdentityGraphNode => node !== null);

    return {
      displayName: json.displayName?.trim() || null,
      avatar: json.avatar?.trim() || null,
      description: json.description?.trim() || null,
      domains: (json.domains ?? [])
        .map(mapWalletGraphNode)
        .filter((node): node is IdentityGraphNode => node !== null),
      credentials: {
        isHuman: mapCredentials(json.credential?.isHuman),
        isRisky: mapCredentials(json.credential?.isRisky),
        isSpam: mapCredentials(json.credential?.isSpam),
      },
      graph: graphNodes,
    };
  } catch {
    return null;
  }
}

export function mergeIdentityGraphs(
  primary: CultureIdentityGraph | null,
  walletGraph: IdentityGraphNode[],
): CultureIdentityGraph | null {
  if (!primary && walletGraph.length === 0) return null;

  const raw: Web3BioRawProfile[] = [
    ...(primary?.graph ?? []).map((node) => ({
      address: node.address,
      identity: node.identity,
      platform: node.platform,
      displayName: node.displayName,
      avatar: node.avatar,
      description: node.description,
      links: Object.fromEntries(
        Object.entries(node.links).map(([key, value]) => [
          key,
          { link: value.link, handle: value.handle },
        ]),
      ),
      social: node.followerCount != null ? { follower: node.followerCount } : undefined,
    })),
    ...walletGraph.map((node) => ({
      address: node.address,
      identity: node.identity,
      platform: node.platform,
      displayName: node.displayName,
      avatar: node.avatar,
      description: node.description,
    })),
  ];

  return buildCultureIdentityGraph(raw, primary?.fetchedAt ?? new Date().toISOString());
}
