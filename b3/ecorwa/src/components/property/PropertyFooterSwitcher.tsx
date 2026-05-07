import { Anchor, Building, Building2, Hammer, Store, Warehouse, Waves } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PropertyIconName } from "@/lib/properties";
import { PROPERTIES, getAllPropertySlugs } from "@/lib/properties";
import { Link, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<PropertyIconName, LucideIcon> = {
  Building2,
  Building,
  Anchor,
  Warehouse,
  Hammer,
  Store,
  Waves,
};

export function PropertyFooterSwitcher() {
  const { slug: activeSlug } = useParams<{ slug: string }>();
  const slugs = getAllPropertySlugs();

  return (
    <section
      aria-label="Switch property"
      className="relative flex min-h-screen snap-start snap-always flex-col justify-center border-t border-border/50 bg-[radial-gradient(ellipse_at_50%_30%,hsl(var(--primary)/0.06),transparent_55%)] py-16 md:py-24"
    >
      <div className="container px-4">
        <p className="sr-only">Choose another property by icon</p>
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4 lg:grid-cols-7">
          {slugs.map((slug) => {
            const p = PROPERTIES[slug];
            const Icon = ICON_MAP[p.iconName];
            const isActive = slug === activeSlug;
            return (
              <Link
                key={slug}
                to={`/property/${slug}`}
                aria-label={p.headline}
                className={cn(
                  "group flex aspect-square items-center justify-center rounded-2xl border border-border/40 bg-background/30 ring-1 ring-border/30 transition duration-300",
                  "hover:scale-[1.06] hover:border-primary/40 hover:shadow-[0_0_40px_hsl(var(--primary)/0.2)] hover:ring-primary/25",
                  isActive && "pointer-events-none scale-[0.97] opacity-35 hover:scale-[0.97] hover:shadow-none",
                )}
              >
                <Icon className="h-14 w-14 text-primary transition group-hover:text-acid md:h-16 md:w-16" strokeWidth={1.1} aria-hidden />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
