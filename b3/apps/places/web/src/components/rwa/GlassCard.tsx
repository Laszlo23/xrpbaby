import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  strong?: boolean;
};

export function GlassCard({ children, className = "", strong = false }: Props) {
  return (
    <div className={`rounded-2xl ${strong ? "bc-glass-strong" : "bc-glass"} ${className}`}>{children}</div>
  );
}
