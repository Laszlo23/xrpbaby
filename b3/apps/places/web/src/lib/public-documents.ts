/**
 * Curated PDFs for Architecture / Documents tabs.
 * `filePath` is either a site-relative path under `public/` or an absolute `https://` URL (e.g. 4everbucket).
 * Relative paths use encodeURI in `publicDocumentHref`. Previews: `scripts/export-pdf-previews.mjs` → `public/extracted/{id}/page-NN.jpg` (skipped for remote URLs).
 */
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

/** Hosted PDFs on 4everbucket (Building Culture). */
export const EVERBUCKET_BASE = "https://buildingculture.4everbucket.com";

export type PublicDocument = {
  id: PublicDocumentId;
  title: string;
  /** Path under `public/` or absolute `https://` URL */
  filePath: string;
  /** Pages exported to `/extracted/{id}/page-NN.jpg` (run export script). */
  previewPages: 1 | 2 | 3;
};

export const PUBLIC_DOCUMENTS: readonly PublicDocument[] = [
  {
    id: "droes-plans-221219",
    title: "Plan set — Droeß",
    filePath: `${EVERBUCKET_BASE}/377-DROES-100-P-S-221219.pdf`,
    previewPages: 3,
  },
  {
    id: "katzelsdorf-studie-auswechslung",
    title: "Studie Hausumbau Katzelsdorf — A3 Mappe (Auswechslung)",
    filePath: "/Studie Hausumbau Katzelsdorf_A3-Mappe_AUSWECHSLUNG.pdf",
    previewPages: 3,
  },
  {
    id: "katzelsdorf-studie-encoded",
    title: "Studie Hausumbau Katzelsdorf — A3 (alt. file)",
    filePath: "/Studie_20Hausumbau_20Katzelsdorf_A3-Mappe_AUSWECHSLUNG.pdf.pdf",
    previewPages: 3,
  },
  {
    id: "bernhardsthal-plans",
    title: "Plan set — Bernhardsthal (reference)",
    filePath: "/371-BERNHARDSTHAL-100-P-S-221114.pdf.pdf",
    previewPages: 3,
  },
  {
    id: "altes-kaufhaus-prater",
    title: "Altes Kaufhaus — Prater (A3 klein)",
    filePath: "/Altes_20Kaufhaus_Pra_CC_88s_20A3_20klein.pdf.pdf",
    previewPages: 3,
  },
  {
    id: "stix-a3-klein",
    title: "Stix — A3 plans (klein)",
    filePath: "/Prä_StixA3klein.pdf",
    previewPages: 3,
  },
  {
    id: "land-mark-bernhardsthal-20210625",
    title: "Land-Mark — Bernhardsthal (2021)",
    filePath: `${EVERBUCKET_BASE}/20210625_Land-Mark-Bernhardsthal.pdf`,
    previewPages: 3,
  },
  {
    id: "bau-land-kultur-20201113",
    title: "Bau — Land — Kultur (2020)",
    filePath: `${EVERBUCKET_BASE}/20201113-Bau-Land-Kultur.pdf`,
    previewPages: 3,
  },
  {
    id: "stix-baukultur-en-20221110",
    title: "Stix — Building culture (EN, 2022)",
    filePath: "/20221110_Stix_Baukultur_EN_Web.pdf",
    previewPages: 3,
  },
  {
    id: "water-side-keutschach-20220112",
    title: "Water Side — Keutschach am See (2022)",
    filePath: "/20220112_WATER-SIDE-Keutschach-am-See (1).pdf",
    previewPages: 3,
  },
  {
    id: "teaser-biberstrasse-4-1010-wien",
    title: "Teaser — Biberstraße 4, 1010 Vienna (broker)",
    filePath: `${EVERBUCKET_BASE}/Teaser_Biberstrasse_4_1010_Wien.pdf`,
    previewPages: 3,
  },
  {
    id: "vkp-lageplan-20220622",
    title: "VKP 1169 — Lageplan (2022)",
    filePath: "/1169_VKP_Lageplan_2022-06-22.pdf",
    previewPages: 1,
  },
  {
    id: "vkp-pool-20220308",
    title: "VKP 1169 — Pool (2022)",
    filePath: "/1169_VKP_Pool_2022-03-08.pdf",
    previewPages: 1,
  },
  {
    id: "vkp-haus-a-og-top3-20221102",
    title: "VKP 1169 — Haus A OG Top 3 (2022)",
    filePath: "/1169_VKP_Haus A_OG_Top3_2022-11-02.pdf",
    previewPages: 1,
  },
  {
    id: "vkp-haus-b-eg-top1-20220516",
    title: "VKP 1169 — Haus B EG Top 1 (2022)",
    filePath: "/1169_VKP_Haus B_EG_Top 1_2022-05-16.pdf",
    previewPages: 1,
  },
  {
    id: "vkp-haus-c-eg-top2-20220308",
    title: "VKP 1169 — Haus C EG Top 2 (2022)",
    filePath: "/1169_VKP_Haus C_EG_Top 2_2022-03-08.pdf",
    previewPages: 1,
  },
  {
    id: "vkp-haus-e-eg-top1-20220308",
    title: "VKP 1169 — Haus E EG Top 1 (2022)",
    filePath: "/1169_VKP_Haus E_EG_Top 1_2022-03-08.pdf",
    previewPages: 1,
  },
  {
    id: "vkp-haus-e-eg-top3-20230316",
    title: "VKP 1169 — Haus E EG Top 3 (2023)",
    filePath: "/1169_VKP_Haus E_EG_Top 3_2023-03-16.pdf",
    previewPages: 1,
  },
  {
    id: "vkp-haus-e-up-tg-kg-20230621",
    title: "VKP 1169 — Haus E ÜP TG+KG (2023)",
    filePath: "/1169_VKP_Haus E_ÜP_TG+KG_2023-06-21.pdf",
    previewPages: 1,
  },
  {
    id: "vkp-felsennest-eg-top1-20220315",
    title: "VKP 1169 — Felsennest EG Top 1 (2022)",
    filePath: `${EVERBUCKET_BASE}/1169_VKP_Felsennest_EG_Top%201_2022-03-15.pdf`,
    previewPages: 1,
  },
  {
    id: "berggasse-brochure-en",
    title: "Berggasse 35 — brochure (EN)",
    filePath: `${EVERBUCKET_BASE}/Broschuere_BERGGASSE_35_EN.pdf`,
    previewPages: 1,
  },
];

export function getPublicDocumentById(id: PublicDocumentId): PublicDocument | undefined {
  return PUBLIC_DOCUMENTS.find((d) => d.id === id);
}

/** Safe href for static files or passthrough for absolute PDF URLs */
export function publicDocumentHref(filePath: string): string {
  if (filePath.startsWith("https://") || filePath.startsWith("http://")) return filePath;
  if (!filePath.startsWith("/")) return encodeURI(`/${filePath}`);
  return encodeURI(filePath);
}

/** Raster previews under `public/extracted/` (see export script). Empty when `filePath` is remote-only. */
export function getPublicDocumentPreviewPaths(doc: PublicDocument): string[] {
  if (doc.filePath.startsWith("https://") || doc.filePath.startsWith("http://")) return [];
  const n = doc.previewPages;
  return Array.from({ length: n }, (_, i) => `/extracted/${doc.id}/page-${String(i + 1).padStart(2, "0")}.jpg`);
}
