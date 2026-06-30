import Link from "next/link";
import type { PortfolioLinkProps } from "@bc/places-portfolio";

export function NextPortfolioLink({ href, className, style, children }: PortfolioLinkProps) {
  if (href.startsWith("http") || href.startsWith("#")) {
    return (
      <a href={href} className={className} style={style}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} style={style}>
      {children}
    </Link>
  );
}
