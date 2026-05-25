import type { Metadata } from "next";
import { ImmersiveExperience } from "@/components/experience/ImmersiveExperience";
import { REFERENCE_YIELD_BAND_LABEL } from "@/lib/demo-properties";

/** Avoid stale CDN/HTML cache serving an old immersive shell after deploys. */
export const dynamic = "force-dynamic";

const ogImagePath = "/partners/Keutschach-am-See-1b-1.jpg";

export const metadata: Metadata = {
  title: "Immersive story — Building Culture | Community-owned cultural real estate",
  description: `Full-screen visual story: City, Land, and Water — ${REFERENCE_YIELD_BAND_LABEL} planning band, curated listings, transparent reference economics on Base — Legal hub for terms.`,
  keywords: [
    "Building Culture",
    "community real estate",
    "tokenized property",
    "RWA",
    "cultural real estate",
    "Base",
    "fractional ownership",
    "community funding",
    "real estate crowdfunding",
  ],
  authors: [{ name: "Building Culture" }],
  alternates: {
    canonical: "/experience",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: "Immersive story — Building Culture",
    description: `Photography-led stories — ${REFERENCE_YIELD_BAND_LABEL} planning band · community-owned places on Base.`,
    type: "website",
    url: "/experience",
    siteName: "Building Culture",
    locale: "en_US",
    images: [
      {
        url: ogImagePath,
        width: 1920,
        height: 1080,
        alt: "Building Culture — immersive flagship visual story",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Immersive story — Building Culture",
    description: `City · Land · Water — ${REFERENCE_YIELD_BAND_LABEL} planning band · cultural real estate on Base.`,
    images: [ogImagePath],
  },
};

export default function ExperiencePage() {
  return (
    <div className="min-h-[100dvh] bg-black">
      <ImmersiveExperience />
    </div>
  );
}
