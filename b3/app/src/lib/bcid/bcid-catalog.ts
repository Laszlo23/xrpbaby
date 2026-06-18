/** BCID credential catalog — parallel to legacy credential-catalog.ts */

export const BCID_CREDENTIAL_SLUGS = [
  "bcid-builder",
  "bcid-contributor",
  "bcid-community-leader",
  "bcid-verified-human",
  "bcid-verified-project",
] as const;

export type BcidCredentialSlug = (typeof BCID_CREDENTIAL_SLUGS)[number];

export type BcidCredentialCatalogEntry = {
  slug: BcidCredentialSlug;
  name: string;
  description: string;
  category: "human" | "builder" | "community" | "project";
  earnSummary: string;
};

export const BCID_CREDENTIAL_CATALOG: BcidCredentialCatalogEntry[] = [
  {
    slug: "bcid-builder",
    name: "BCID Builder Credential",
    description: "Verifiable shipped work for BCID holders.",
    category: "builder",
    earnSummary: "Studio project, grant milestone, or build tasks.",
  },
  {
    slug: "bcid-contributor",
    name: "BCID Contributor Credential",
    description: "Sustained ecosystem participation.",
    category: "community",
    earnSummary: "500+ Culture Points or 10+ quests.",
  },
  {
    slug: "bcid-community-leader",
    name: "BCID Community Leader Credential",
    description: "Organizers and distribution partners.",
    category: "community",
    earnSummary: "5+ verified referrals or founding tier.",
  },
  {
    slug: "bcid-verified-human",
    name: "BCID Verified Human Credential",
    description: "Sybil-resistant human verification.",
    category: "human",
    earnSummary: "Web3.bio isHuman or World ID proof.",
  },
  {
    slug: "bcid-verified-project",
    name: "BCID Verified Project Credential",
    description: "Ecosystem projects with verifiable impact.",
    category: "project",
    earnSummary: "Grant Proof or BC team issuance.",
  },
];

export const BCID_ACCESS_RULES = [
  {
    slug: "bcid-grant-agent",
    resourceType: "agent",
    resourceId: "grant_agent",
    minBuilderScore: 0,
    requiredCredentialSlugs: ["bcid-contributor"],
    description: "Grant Agent requires BCID Contributor credential.",
  },
  {
    slug: "bcid-studio-priority",
    resourceType: "feature",
    resourceId: "studio_priority",
    minBuilderScore: 25,
    requiredCredentialSlugs: ["bcid-builder"],
    description: "BC Studio priority for BCID Builder credential holders.",
  },
] as const;
