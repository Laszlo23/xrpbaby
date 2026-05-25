import type { HTMLAttributes, ReactNode } from "react";

export function Section({
  children,
  className = "",
  y = "default",
  ...rest
}: HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  y?: "default" | "tight" | "none";
}) {
  const space = y === "default" ? "space-y-8 py-8" : y === "tight" ? "space-y-6 py-6" : "";
  return (
    <section className={`${space} ${className}`} {...rest}>
      {children}
    </section>
  );
}
