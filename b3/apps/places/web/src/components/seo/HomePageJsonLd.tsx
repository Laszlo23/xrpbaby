import { REFERENCE_YIELD_BAND_LABEL } from "@/lib/demo-properties";
import { getSiteUrl } from "@/lib/site-url";

/** Organization + WebSite structured data for the homepage. */
export function HomePageJsonLd() {
  const url = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        name: "Building Culture",
        url,
        description: `Community funding for cultural and sustainable real estate on Base. Planning yield band ${REFERENCE_YIELD_BAND_LABEL} p.a. is illustrative — see issuer materials and Legal.`,
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: "Building Culture",
        description: `Cultural real estate on Base — ${REFERENCE_YIELD_BAND_LABEL} planning band in materials · issuer disclosures and Legal hub.`,
        publisher: { "@id": `${url}/#organization` },
        inLanguage: "en",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Safe: static structured data built from site URL and copy.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
