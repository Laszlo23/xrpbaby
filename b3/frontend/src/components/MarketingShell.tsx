import type { ReactNode } from "react";
import { MarketingHero, type MarketingHeroProps } from "@/components/MarketingHero";
import { cn } from "@/lib/utils";

type ShellProps = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  actions?: ReactNode;
  tone?: MarketingHeroProps["tone"];
  heroSize?: MarketingHeroProps["size"];
  /** Extra classes on the article wrapper */
  articleClassName?: string;
  children: ReactNode;
};

export function MarketingShell({
  eyebrow,
  title,
  subtitle,
  actions,
  tone = "purple",
  heroSize = "hero",
  articleClassName,
  children,
}: ShellProps) {
  return (
    <>
      <MarketingHero
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        actions={actions}
        tone={tone}
        size={heroSize}
      />
      <div className="px-4 pb-16 pt-10 md:px-8">
        <article
          className={cn(
            "mx-auto max-w-3xl text-[15px] leading-relaxed text-zinc-400 md:text-base [&_a]:text-zinc-200 [&_a]:underline-offset-4 [&_a]:hover:text-white",
            articleClassName,
          )}
        >
          {children}
        </article>
      </div>
    </>
  );
}
