import type { PublicDocumentId } from "@/lib/public-documents";

export type DocumentStorySection = {
  heading: string;
  body: string;
};

export type DocumentStory = {
  id: PublicDocumentId;
  /** Short label for nav / cards */
  label: string;
  /** Page title */
  title: string;
  /** One-line context */
  dek: string;
  sections: DocumentStorySection[];
  /** Plain-language disclaimer (not legal advice) */
  disclaimer: string;
};

/**
 * Editorial storytelling for each plan PDF — reference context; verify against issuer docs.
 * Optional future step: anchor file hashes on-chain via a registry contract + IPFS.
 */
export const DOCUMENT_STORIES: Record<PublicDocumentId, DocumentStory> = {
  "droes-plans-221219": {
    id: "droes-plans-221219",
    label: "Droeß plan set",
    title: "Droeß — engineering plans (221219)",
    dek: "Technical drawings for parcel and envelope decisions — use with legal survey and title.",
    sections: [
      {
        heading: "Why this matters",
        body: "Plan sets translate architect intent into buildable scope. For community investors, they show what was modeled for costs, setbacks, and services — not a promise of final as-built conditions.",
      },
      {
        heading: "How to read it",
        body: "Look for sheet index, scales, and revision dates. Cross-check boundaries against land registry excerpts. Any redlines after this PDF belong in a change log with issuer sign-off.",
      },
      {
        heading: "On-chain note",
        body: "The PDF itself stays off-chain (size and privacy). A production deployment can store a commitment hash (e.g. keccak256 of file bytes or IPFS CID) in a registry contract for tamper evidence — this UI is preparatory.",
      },
    ],
    disclaimer:
      "Reference context — issuer offering documents govern substance; jurisdiction-specific rules apply.",
  },
  "katzelsdorf-studie-auswechslung": {
    id: "katzelsdorf-studie-auswechslung",
    label: "Katzelsdorf — A3 Auswechslung",
    title: "Hausumbau Katzelsdorf — A3 map (Auswechslung)",
    dek: "Study binder for a residential retrofit in Katzelsdorf — replacement / swap scope.",
    sections: [
      {
        heading: "Story",
        body: "Rural revitalization often starts with a clear study: what stays, what is swapped out, and how the building meets modern energy and fire codes. This map supports that narrative for community-funded projects.",
      },
      {
        heading: "Community angle",
        body: "Locals, remote workers, and small operators can share use of upgraded spaces. Tokenization maps economic participation to disclosures — not to guaranteed occupancy or rent.",
      },
      {
        heading: "Integrity",
        body: "For real testing, pin the canonical file (IPFS or secure storage) and record its hash on-chain so updates are visible to holders.",
      },
    ],
    disclaimer: "Supporting documentation — not a securities filing.",
  },
  "katzelsdorf-studie-encoded": {
    id: "katzelsdorf-studie-encoded",
    label: "Katzelsdorf — A3 (alt)",
    title: "Hausumbau Katzelsdorf — alternate export",
    dek: "Same study line as the primary A3 map; alternate filename from export tooling.",
    sections: [
      {
        heading: "Purpose",
        body: "Duplicate exports happen when CAD/PDF pipelines encode spaces in filenames. Treat one file as canonical for governance votes on documentation.",
      },
      {
        heading: "Investor takeaway",
        body: "Before relying on either file, confirm with the issuer which revision is referenced in the subscription agreement.",
      },
    ],
    disclaimer: "Keep both hashes if both circulate — mismatch risks confusion in audits.",
  },
  "bernhardsthal-plans": {
    id: "bernhardsthal-plans",
    label: "Bernhardsthal plans",
    title: "Bernhardsthal — plan set (reference)",
    dek: "Parcel and layout references for the Bernhardsthal storyline in the rural bucket.",
    sections: [
      {
        heading: "Narrative",
        body: "Smaller municipalities can combine housing and micro-commercial. Plans anchor the conversation about what capital is buying: footprint, access, and servicing.",
      },
      {
        heading: "Testing checklist",
        body: "Verify wallet reads, property IDs, and that document links resolve with encoded URLs (spaces, double .pdf extensions).",
      },
    ],
    disclaimer: "Reference plans — verify against current land records.",
  },
  "altes-kaufhaus-prater": {
    id: "altes-kaufhaus-prater",
    label: "Altes Kaufhaus — Prater",
    title: "Altes Kaufhaus — Prater (A3 klein)",
    dek: "Adaptive reuse context near the Prater — cultural/commercial fabric.",
    sections: [
      {
        heading: "Cultural real estate",
        body: "Heritage-adjacent assets need both preservation discipline and a clear operating story (hospitality, retail, events). Plans communicate volume and circulation for stakeholders.",
      },
      {
        heading: "Liquidity layer",
        body: "Tokenized shares can fund renovation milestones; secondary liquidity depends on pools and compliance — never assumed from a PDF alone.",
      },
    ],
    disclaimer: "Marketing context — rights to names and imagery require separate clearance.",
  },
  "stix-a3-klein": {
    id: "stix-a3-klein",
    label: "Stix — A3 klein",
    title: "Stix — A3 plans (klein)",
    dek: "Compact A3 set associated with the Stix / Keutschach storyline — flagship creative village narrative.",
    sections: [
      {
        heading: "Vision",
        body: "Lakeside clusters can mix housing, work, and gathering. This drawing set supports the ‘C3 Creative Village’ story: community-owned places with transparent funding rounds.",
      },
      {
        heading: "What on-chain can prove",
        body: "Smart contracts can enforce supply caps, transfers, and compliance hooks; PDFs prove what was disclosed off-chain at a point in time. Together: process integrity, not a forecast of returns.",
      },
      {
        heading: "Next step for production",
        body: "Deploy a DocumentRegistry contract that stores bytes32 commitments, wire the app to display matching hashes, and host files on IPFS or HTTPS with TLS.",
      },
    ],
    disclaimer: "Figures on the site are reference unless stated otherwise — reconcile with issuer filings.",
  },
  "land-mark-bernhardsthal-20210625": {
    id: "land-mark-bernhardsthal-20210625",
    label: "Land-Mark Bernhardsthal",
    title: "Land-Mark — Bernhardsthal (2021)",
    dek: "Rural Weinviertel storyline — grain-storage conversion and mixed programme; planning context.",
    sections: [
      {
        heading: "Why this matters",
        body: "Large-format PDFs anchor the conversation about footprint, access, and servicing for community-funded rural projects.",
      },
      {
        heading: "How to read it",
        body: "Use sheet indices and revision dates; cross-check with current land records before any commitment.",
      },
    ],
    disclaimer: "Supporting documentation — issuer offering documents govern.",
  },
  "bau-land-kultur-20201113": {
    id: "bau-land-kultur-20201113",
    label: "Bau — Land — Kultur",
    title: "Bau — Land — Kultur (2020)",
    dek: "Culture-forward building narrative — editorial context for adaptive reuse and stewardship.",
    sections: [
      {
        heading: "Story",
        body: "Heritage-adjacent and community-led development needs both preservation discipline and a clear operating story (housing, hospitality, culture).",
      },
      {
        heading: "Integrity",
        body: "Pin canonical file hashes when moving from staging to production registries.",
      },
    ],
    disclaimer: "Marketing context — verify rights and issuer disclosures.",
  },
  "stix-baukultur-en-20221110": {
    id: "stix-baukultur-en-20221110",
    label: "Stix building culture",
    title: "Stix — Building culture (EN)",
    dek: "English-language narrative on building culture aligned with the Keutschach / Water Side programme.",
    sections: [
      {
        heading: "Purpose",
        body: "Communicates design intent and stewardship values alongside the A3 plan sets.",
      },
    ],
    disclaimer: "Editorial context — not an endorsement of any security.",
  },
  "water-side-keutschach-20220112": {
    id: "water-side-keutschach-20220112",
    label: "Water Side Keutschach",
    title: "Water Side — Keutschach am See (2022)",
    dek: "Project PDF for the lakeside residential cluster — use with partner briefs and issuer docs.",
    sections: [
      {
        heading: "Context",
        body: "Lake-adjacent development combines housing with landscape and access constraints; plans show how the scheme was modeled.",
      },
    ],
    disclaimer: "Verify figures against issuer materials.",
  },
  "vkp-lageplan-20220622": {
    id: "vkp-lageplan-20220622",
    label: "VKP Lageplan",
    title: "VKP 1169 — Lageplan (2022)",
    dek: "Site plan for the VKP 1169 multi-family scheme — relationship to parcel and outdoor programme.",
    sections: [
      {
        heading: "How to read it",
        body: "Check scale, north arrow, and legend. Compare against survey and easements before relying on distances.",
      },
    ],
    disclaimer: "Technical reference — not a title report.",
  },
  "vkp-pool-20220308": {
    id: "vkp-pool-20220308",
    label: "VKP Pool",
    title: "VKP 1169 — Pool (2022)",
    dek: "Outdoor / pool programme sheet for the VKP 1169 development.",
    sections: [
      {
        heading: "Investor note",
        body: "Amenity scope can change with zoning and operator decisions — treat as indicative until contracted.",
      },
    ],
    disclaimer: "Reference plans only.",
  },
  "vkp-haus-a-og-top3-20221102": {
    id: "vkp-haus-a-og-top3-20221102",
    label: "VKP Haus A OG Top 3",
    title: "VKP 1169 — Haus A OG Top 3 (2022)",
    dek: "Unit plan sheet — Haus A, upper floor, Top 3.",
    sections: [
      {
        heading: "Checklist",
        body: "Verify room labels, areas, and revision against the latest issuer package.",
      },
    ],
    disclaimer: "Not a survey or lease outline.",
  },
  "vkp-haus-b-eg-top1-20220516": {
    id: "vkp-haus-b-eg-top1-20220516",
    label: "VKP Haus B EG Top 1",
    title: "VKP 1169 — Haus B EG Top 1 (2022)",
    dek: "Ground-floor unit plan — Haus B, Top 1.",
    sections: [
      {
        heading: "Checklist",
        body: "Cross-check areas and services with the latest drawings.",
      },
    ],
    disclaimer: "Supporting documentation — verify with issuer materials.",
  },
  "vkp-haus-c-eg-top2-20220308": {
    id: "vkp-haus-c-eg-top2-20220308",
    label: "VKP Haus C EG Top 2",
    title: "VKP 1169 — Haus C EG Top 2 (2022)",
    dek: "Ground-floor unit plan — Haus C, Top 2.",
    sections: [
      {
        heading: "Checklist",
        body: "Cross-check areas and services with the latest drawings.",
      },
    ],
    disclaimer: "Supporting documentation — verify with issuer materials.",
  },
  "vkp-haus-e-eg-top1-20220308": {
    id: "vkp-haus-e-eg-top1-20220308",
    label: "VKP Haus E EG Top 1",
    title: "VKP 1169 — Haus E EG Top 1 (2022)",
    dek: "Ground-floor unit plan — Haus E, Top 1.",
    sections: [
      {
        heading: "Checklist",
        body: "Cross-check areas and services with the latest drawings.",
      },
    ],
    disclaimer: "Supporting documentation — verify with issuer materials.",
  },
  "vkp-haus-e-eg-top3-20230316": {
    id: "vkp-haus-e-eg-top3-20230316",
    label: "VKP Haus E EG Top 3",
    title: "VKP 1169 — Haus E EG Top 3 (2023)",
    dek: "Ground-floor unit plan — Haus E, Top 3.",
    sections: [
      {
        heading: "Checklist",
        body: "Verify revision date against subscription documents.",
      },
    ],
    disclaimer: "Supporting documentation — verify with issuer materials.",
  },
  "vkp-haus-e-up-tg-kg-20230621": {
    id: "vkp-haus-e-up-tg-kg-20230621",
    label: "VKP Haus E ÜP TG+KG",
    title: "VKP 1169 — Haus E ÜP TG+KG (2023)",
    dek: "Underground / garage level sheet — Haus E (TG+KG).",
    sections: [
      {
        heading: "Checklist",
        body: "Parking and storage allocations are issuer-specific; confirm against contracts.",
      },
    ],
    disclaimer: "Supporting documentation — verify with issuer materials.",
  },
  "vkp-felsennest-eg-top1-20220315": {
    id: "vkp-felsennest-eg-top1-20220315",
    label: "VKP Felsennest EG Top 1",
    title: "VKP 1169 — Felsennest EG Top 1 (2022)",
    dek: "Ground-floor unit plan — Felsennest, Top 1.",
    sections: [
      {
        heading: "Checklist",
        body: "Cross-check areas and services with the latest drawings.",
      },
    ],
    disclaimer: "Supporting documentation — verify against issuer materials and cadastral records.",
  },
  "berggasse-brochure-en": {
    id: "berggasse-brochure-en",
    label: "Berggasse 35 brochure",
    title: "Berggasse 35 — Servitenviertel (English brochure)",
    dek: "Project brochure for Building Culture City Berggasse — heritage residential in Vienna’s 9th district.",
    sections: [
      {
        heading: "Place",
        body: "Berggasse sits in the Servitenviertel: Gründerzeit fabric, courtyards, and long horizons for careful renewal — aligned with how Building Culture stewards real assets alongside the community.",
      },
      {
        heading: "How to use this PDF",
        body: "Use it alongside issuer disclosures and land-register excerpts. Economic terms follow offering documents and on-chain programs — not summarized marketing alone.",
      },
      {
        heading: "Integrity",
        body: "Canonical files are mirrored on resilient storage (4everbucket); pin or hash commitments can be recorded on-chain for tamper-evidence as programs mature.",
      },
    ],
    disclaimer:
      "Marketing brochure — economic terms follow issuer offering documents; jurisdiction-specific rules apply.",
  },
  "teaser-biberstrasse-4-1010-wien": {
    id: "teaser-biberstrasse-4-1010-wien",
    label: "Biberstraße teaser",
    title: "Teaser — Biberstraße 4, 1010 Vienna",
    dek: "Broker teaser PDF referenced alongside the Whalewatching diligence narrative — third-party disposition process.",
    sections: [
      {
        heading: "Purpose",
        body: "Shows marketing / process framing supplied by an appointed Austrian broker for an inner-city asset. It is reproduced for investor orientation only.",
      },
      {
        heading: "Independence",
        body: "Building Culture does not sell the Biberstraße asset as part of this app; reconcile any purchase process directly with counsel and the broker identified in the PDF.",
      },
    ],
    disclaimer:
      "Third-party broker communications — Building Culture does not adopt them as its own offering. Confirm confidentiality, timelines, and commission terms with the broker.",
  },
};

export function getStoryBySlug(slug: string): DocumentStory | undefined {
  if (slug in DOCUMENT_STORIES) return DOCUMENT_STORIES[slug as PublicDocumentId];
  return undefined;
}

export function allStorySlugs(): PublicDocumentId[] {
  return Object.keys(DOCUMENT_STORIES) as PublicDocumentId[];
}
