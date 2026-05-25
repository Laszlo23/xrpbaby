import Image from "next/image";
import Link from "next/link";
import { CULTURE_LAND_PROJECTS } from "@/lib/culture-land-portfolio";

const STRIP = CULTURE_LAND_PROJECTS.filter((p) => p.exploreHref).slice(0, 3);

export function CultureLandImageStrip() {
  if (STRIP.length === 0) return null;
  return (
    <section className="mx-auto w-full max-w-[1280px] overflow-hidden rounded-2xl border border-white/[0.07] bg-black/20">
      <div className="grid gap-0 sm:grid-cols-3">
        {STRIP.map((p, i) => (
          <Link
            key={p.id}
            href={p.exploreHref ?? "#"}
            className="group relative block aspect-[4/3] min-h-[200px] overflow-hidden border-white/[0.06] sm:min-h-[240px] sm:border-r sm:last:border-r-0"
          >
            <Image
              src={p.imageSrc}
              alt={p.imageAlt}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, 33vw"
              priority={i === 0}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-eco-light/90">{p.region}</p>
              <p className="mt-1 text-sm font-semibold text-white">{p.title}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
