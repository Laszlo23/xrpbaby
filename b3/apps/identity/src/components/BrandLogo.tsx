import { Link } from "@tanstack/react-router";
import buildingCultureLogo from "@/assets/building-culture-logo.png";

type BrandLogoProps = {
  /** Show “culture.layer” wordmark beside the mark */
  showWordmark?: boolean;
  className?: string;
  imageClassName?: string;
};

export function BrandLogo({
  showWordmark = true,
  className = "",
  imageClassName = "h-8 w-8 object-contain",
}: BrandLogoProps) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 ${className}`}>
      <img
        src={buildingCultureLogo}
        alt="Building Culture"
        width={32}
        height={32}
        className={imageClassName}
        decoding="async"
      />
      {showWordmark && (
        <span className="font-display text-sm font-medium tracking-tight">
          culture<span className="text-muted-foreground">.layer</span>
        </span>
      )}
    </Link>
  );
}

export function BrandLogoMark({
  className = "h-7 w-7 object-contain",
}: {
  className?: string;
}) {
  return (
    <img
      src={buildingCultureLogo}
      alt="Building Culture"
      width={28}
      height={28}
      className={className}
      decoding="async"
    />
  );
}
