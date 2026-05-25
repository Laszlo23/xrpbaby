"use client";

import { getOsmEmbedUrl, getOsmExternalUrl, type PropertyGeo } from "@/lib/property-geo";

type Props = {
  geo: PropertyGeo;
  label?: string;
  className?: string;
};

/**
 * OpenStreetMap iframe embed — no API keys; approximate map position for orientation.
 */
export function PropertyLocationMap({ geo, label = "Approximate location map", className = "" }: Props) {
  const src = getOsmEmbedUrl(geo);
  const external = getOsmExternalUrl(geo);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative aspect-[2/1] max-h-72 w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-900/80">
        <iframe
          title={label}
          src={src}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <p className="text-[10px] text-muted">
        Map position is approximate — verify against legal surveys and issuer disclosures.{" "}
        <a href={external} target="_blank" rel="noopener noreferrer" className="text-eco-light/90 underline-offset-2 hover:underline">
          Open in OpenStreetMap
        </a>
      </p>
    </div>
  );
}
