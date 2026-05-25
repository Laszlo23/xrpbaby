import Link from "next/link";
import { PLATFORM_LINKS } from "@/components/home/platform-icons";

export function PlatformEcosystemSection() {
  return (
    <section className="relative z-10 mx-auto max-w-[1280px] px-0">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-eco-muted">Platform</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">One ecosystem</h2>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        One stack for community-funded cultural real estate — from discovery to trade — on Base. Behaviour depends on
        deployment and issuer configuration.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {PLATFORM_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group relative rounded-2xl border border-eco/15 bg-forest/25 p-6 transition hover:border-action/35 hover:bg-forest/40"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-eco/30 bg-eco/10 text-eco-light">
                {item.icon("h-5 w-5")}
              </span>
              <div className="min-w-0">
                <h3 className="font-semibold text-canvas group-hover:text-action-light">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
