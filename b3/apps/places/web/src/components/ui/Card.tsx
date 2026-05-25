import type { HTMLAttributes, ReactNode } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  hover?: boolean;
  padding?: "md" | "lg";
};

const pad = { md: "p-6", lg: "p-8" };

export function Card({ children, className = "", hover = false, padding = "md", ...rest }: Props) {
  return (
    <div
      className={`rounded-2xl border border-eco/15 bg-forest/40 shadow-xl shadow-black/35 ${pad[padding]} ${
        hover
          ? "transition duration-300 hover:-translate-y-0.5 hover:border-eco/30 hover:shadow-2xl hover:shadow-black/45"
          : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
