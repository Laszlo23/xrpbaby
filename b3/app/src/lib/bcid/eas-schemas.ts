/** EAS schema definitions for BCID credentials on Base. */

export type BcidEasSchema = {
  slug: string;
  schemaString: string;
  revocable: boolean;
  /** Placeholder until deploy-bcid-eas-schemas.mjs runs on testnet. */
  schemaUidSepolia: string;
  schemaUidMainnet: string | null;
  description: string;
};

const BASE_SCHEMA = "bytes32 bcidDid,string credentialSlug,uint64 issuedAt,bytes32 evidenceHash";

export const BCID_EAS_SCHEMAS: BcidEasSchema[] = [
  {
    slug: "bcid-builder-v1",
    schemaString: BASE_SCHEMA,
    revocable: true,
    schemaUidSepolia: "0x0000000000000000000000000000000000000000000000000000000000bcid01",
    schemaUidMainnet: null,
    description: "Issued to builders who shipped verifiable work.",
  },
  {
    slug: "bcid-contributor-v1",
    schemaString: BASE_SCHEMA,
    revocable: true,
    schemaUidSepolia: "0x0000000000000000000000000000000000000000000000000000000000bcid02",
    schemaUidMainnet: null,
    description: "Community contribution credential.",
  },
  {
    slug: "bcid-community-leader-v1",
    schemaString: BASE_SCHEMA,
    revocable: true,
    schemaUidSepolia: "0x0000000000000000000000000000000000000000000000000000000000bcid03",
    schemaUidMainnet: null,
    description: "Moderation / leadership role.",
  },
  {
    slug: "bcid-verified-human-v1",
    schemaString: BASE_SCHEMA,
    revocable: true,
    schemaUidSepolia: "0x0000000000000000000000000000000000000000000000000000000000bcid04",
    schemaUidMainnet: null,
    description: "Human proof via Web3.bio / World ID / Coinbase verification.",
  },
  {
    slug: "bcid-dao-member-v1",
    schemaString: BASE_SCHEMA,
    revocable: true,
    schemaUidSepolia: "0x0000000000000000000000000000000000000000000000000000000000bcid05",
    schemaUidMainnet: null,
    description: "DAO pilot — member of participating organization.",
  },
  {
    slug: "bcid-grant-applicant-v1",
    schemaString: BASE_SCHEMA,
    revocable: true,
    schemaUidSepolia: "0x0000000000000000000000000000000000000000000000000000000000bcid06",
    schemaUidMainnet: null,
    description: "Grant program applicant identity binding.",
  },
];

export function getEasSchemaBySlug(slug: string): BcidEasSchema | undefined {
  return BCID_EAS_SCHEMAS.find((s) => s.slug === slug);
}
