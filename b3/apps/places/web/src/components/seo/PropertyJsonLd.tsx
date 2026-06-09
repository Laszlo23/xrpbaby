import { getSiteUrl } from "@/lib/site-url";

type PropertyJsonLdInput = {
  propertyId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  addressLocality?: string;
  addressCountry?: string;
};

/** RealEstateListing structured data for property detail pages. */
export function PropertyJsonLd({
  propertyId,
  name,
  description,
  imageUrl,
  addressLocality,
  addressCountry,
}: PropertyJsonLdInput) {
  const url = getSiteUrl();
  const pageUrl = `${url}/marketplace/${propertyId}`;
  const data = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": `${pageUrl}#listing`,
    name,
    description:
      description ??
      `${name} — cultural real estate on Building Culture. See issuer materials and Legal for disclosures.`,
    url: pageUrl,
    ...(imageUrl ? { image: imageUrl } : {}),
    ...(addressLocality || addressCountry
      ? {
          address: {
            "@type": "PostalAddress",
            ...(addressLocality ? { addressLocality } : {}),
            ...(addressCountry ? { addressCountry } : {}),
          },
        }
      : {}),
    provider: {
      "@type": "Organization",
      name: "Building Culture",
      url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
