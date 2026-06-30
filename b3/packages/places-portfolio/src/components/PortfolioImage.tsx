import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
};

/** Property still with gradient fallback when CDN / Places host is unreachable. */
export function PortfolioImage({ src, alt, className, loading = "lazy" }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`bg-gradient-to-br from-[#1a1208] via-[#0a0a0a] to-[#0a1628] ${className ?? ""}`}
        role="img"
        aria-label={alt}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setFailed(true)}
    />
  );
}
