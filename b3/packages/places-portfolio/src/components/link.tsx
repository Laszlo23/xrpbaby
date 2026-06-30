import type { ComponentType } from "react";
import type { PortfolioLinkProps } from "../types.js";

export function DefaultPortfolioLink({ href, className, style, children }: PortfolioLinkProps) {
  return (
    <a href={href} className={className} style={style}>
      {children}
    </a>
  );
}

export function resolveLink(
  LinkComponent?: ComponentType<PortfolioLinkProps>,
): ComponentType<PortfolioLinkProps> {
  return LinkComponent ?? DefaultPortfolioLink;
}
