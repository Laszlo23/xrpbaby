/**
 * PDF catalog for property deep-dive — paths under `public/assets/docs/`.
 * Remote originals match ogchain `public-documents.ts` (4everbucket where applicable).
 */
export const EVERBUCKET_BASE = "https://buildingculture.4everbucket.com";

export type PublicDocumentId =
  | "droes-plans-221219"
  | "katzelsdorf-studie-auswechslung"
  | "katzelsdorf-studie-encoded"
  | "bernhardsthal-plans"
  | "altes-kaufhaus-prater"
  | "stix-a3-klein"
  | "land-mark-bernhardsthal-20210625"
  | "bau-land-kultur-20201113"
  | "stix-baukultur-en-20221110"
  | "water-side-keutschach-20220112"
  | "teaser-biberstrasse-4-1010-wien"
  | "vkp-lageplan-20220622"
  | "vkp-pool-20220308"
  | "vkp-haus-a-og-top3-20221102"
  | "vkp-haus-b-eg-top1-20220516"
  | "vkp-haus-c-eg-top2-20220308"
  | "vkp-haus-e-eg-top1-20220308"
  | "vkp-haus-e-eg-top3-20230316"
  | "vkp-haus-e-up-tg-kg-20230621"
  | "vkp-felsennest-eg-top1-20220315"
  | "berggasse-brochure-en";

export type PublicDocumentMeta = {
  id: PublicDocumentId;
  title: string;
  /** Primary PDF link (site-relative or absolute) */
  pdfHref: string;
  /** Raster previews under `/assets/docs/{id}/page-NN.jpg` */
  previewCount: 0 | 1 | 2 | 3;
};

function previewsFor(id: PublicDocumentId, n: 0 | 1 | 2 | 3): string[] {
  if (n === 0) return [];
  return Array.from({ length: n }, (_, i) => `/assets/docs/${id}/page-${String(i + 1).padStart(2, "0")}.jpg`);
}

export const PUBLIC_DOCUMENTS: readonly PublicDocumentMeta[] = [
  {
    id: "droes-plans-221219",
    title: "Plan set — Droeß",
    pdfHref: `${EVERBUCKET_BASE}/377-DROES-100-P-S-221219.pdf`,
    previewCount: 3,
  },
  {
    id: "katzelsdorf-studie-auswechslung",
    title: "Studie Hausumbau Katzelsdorf — A3 Mappe (Auswechslung)",
    pdfHref: "/assets/docs/katzelsdorf-studie-auswechslung/source.pdf",
    previewCount: 3,
  },
  {
    id: "katzelsdorf-studie-encoded",
    title: "Studie Hausumbau Katzelsdorf — A3 (alt. file)",
    pdfHref: "/assets/docs/katzelsdorf-studie-encoded/source.pdf",
    previewCount: 3,
  },
  {
    id: "bernhardsthal-plans",
    title: "Plan set — Bernhardsthal (reference)",
    pdfHref: "/assets/docs/bernhardsthal-plans/source.pdf",
    previewCount: 3,
  },
  {
    id: "altes-kaufhaus-prater",
    title: "Altes Kaufhaus — Prater (A3 klein)",
    pdfHref: "/assets/docs/altes-kaufhaus-prater/source.pdf",
    previewCount: 3,
  },
  {
    id: "stix-a3-klein",
    title: "Stix — A3 plans (klein)",
    pdfHref: "/assets/docs/stix-a3-klein/source.pdf",
    previewCount: 3,
  },
  {
    id: "land-mark-bernhardsthal-20210625",
    title: "Land-Mark — Bernhardsthal (2021)",
    pdfHref: `${EVERBUCKET_BASE}/20210625_Land-Mark-Bernhardsthal.pdf`,
    previewCount: 3,
  },
  {
    id: "bau-land-kultur-20201113",
    title: "Bau — Land — Kultur (2020)",
    pdfHref: `${EVERBUCKET_BASE}/20201113-Bau-Land-Kultur.pdf`,
    previewCount: 3,
  },
  {
    id: "stix-baukultur-en-20221110",
    title: "Stix — Building culture (EN, 2022)",
    pdfHref: "/assets/docs/stix-baukultur-en-20221110/source.pdf",
    previewCount: 3,
  },
  {
    id: "water-side-keutschach-20220112",
    title: "Water Side — Keutschach am See (2022)",
    pdfHref: "/assets/docs/water-side-keutschach-20220112/source.pdf",
    previewCount: 3,
  },
  {
    id: "teaser-biberstrasse-4-1010-wien",
    title: "Teaser — Biberstraße 4, 1010 Vienna (broker)",
    pdfHref: `${EVERBUCKET_BASE}/Teaser_Biberstrasse_4_1010_Wien.pdf`,
    previewCount: 0,
  },
  {
    id: "vkp-lageplan-20220622",
    title: "VKP 1169 — Lageplan (2022)",
    pdfHref: "/assets/docs/vkp-lageplan-20220622/source.pdf",
    previewCount: 1,
  },
  {
    id: "vkp-pool-20220308",
    title: "VKP 1169 — Pool (2022)",
    pdfHref: "/assets/docs/vkp-pool-20220308/source.pdf",
    previewCount: 1,
  },
  {
    id: "vkp-haus-a-og-top3-20221102",
    title: "VKP 1169 — Haus A OG Top 3 (2022)",
    pdfHref: "/assets/docs/vkp-haus-a-og-top3-20221102/source.pdf",
    previewCount: 1,
  },
  {
    id: "vkp-haus-b-eg-top1-20220516",
    title: "VKP 1169 — Haus B EG Top 1 (2022)",
    pdfHref: "/assets/docs/vkp-haus-b-eg-top1-20220516/source.pdf",
    previewCount: 1,
  },
  {
    id: "vkp-haus-c-eg-top2-20220308",
    title: "VKP 1169 — Haus C EG Top 2 (2022)",
    pdfHref: "/assets/docs/vkp-haus-c-eg-top2-20220308/source.pdf",
    previewCount: 1,
  },
  {
    id: "vkp-haus-e-eg-top1-20220308",
    title: "VKP 1169 — Haus E EG Top 1 (2022)",
    pdfHref: "/assets/docs/vkp-haus-e-eg-top1-20220308/source.pdf",
    previewCount: 1,
  },
  {
    id: "vkp-haus-e-eg-top3-20230316",
    title: "VKP 1169 — Haus E EG Top 3 (2023)",
    pdfHref: "/assets/docs/vkp-haus-e-eg-top3-20230316/source.pdf",
    previewCount: 1,
  },
  {
    id: "vkp-haus-e-up-tg-kg-20230621",
    title: "VKP 1169 — Haus E ÜP TG+KG (2023)",
    pdfHref: "/assets/docs/vkp-haus-e-up-tg-kg-20230621/source.pdf",
    previewCount: 1,
  },
  {
    id: "vkp-felsennest-eg-top1-20220315",
    title: "VKP 1169 — Felsennest EG Top 1 (2022)",
    pdfHref: "/assets/docs/vkp-felsennest-eg-top1-20220315/source.pdf",
    previewCount: 1,
  },
  {
    id: "berggasse-brochure-en",
    title: "Berggasse 35 — brochure (EN)",
    pdfHref: `${EVERBUCKET_BASE}/Broschuere_BERGGASSE_35_EN.pdf`,
    previewCount: 0,
  },
];

export function getPublicDocumentById(id: PublicDocumentId): PublicDocumentMeta | undefined {
  return PUBLIC_DOCUMENTS.find((d) => d.id === id);
}

export function getPublicDocumentPreviewPaths(doc: PublicDocumentMeta): string[] {
  return previewsFor(doc.id, doc.previewCount);
}
