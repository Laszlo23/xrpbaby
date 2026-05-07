import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingShell } from "@/components/MarketingShell";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/team")({
  head: () =>
    pageHead({
      title: "Team",
      description:
        "Meet the founders and operators behind BUILDCHAIN—protocol integration, real estate depth, and financial reporting.",
      path: "/team",
      keywords: ["BUILDCHAIN", "team", "founders", "Building Culture"],
    }),
  component: TeamPage,
});

function SocialLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex items-center gap-1 font-medium text-neon underline decoration-neon/40 underline-offset-4 transition hover:text-white hover:decoration-white/60"
    >
      {children}
      <span className="text-[10px] font-normal text-zinc-600" aria-hidden>
        ↗
      </span>
    </a>
  );
}

function TeamPage() {
  return (
    <MarketingShell
      eyebrow="People"
      tone="slate"
      title={
        <>
          The team{" "}
          <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            building BUILDCHAIN
          </span>
        </>
      }
      subtitle="Operators across product, physical assets, and reporting—focused on shipping what communities can actually use."
      actions={
        <Link
          to="/about"
          className="inline-flex items-center justify-center rounded-full border border-white/18 bg-white/[0.06] px-7 py-3 text-sm font-medium text-zinc-100 backdrop-blur-md transition hover:border-white/28 hover:bg-white/[0.1] active:scale-[0.98]"
        >
          About the project
        </Link>
      }
    >
      <div className="flex flex-col gap-12 md:gap-14">
        <section className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-gradient-to-br from-white/[0.06] via-black/30 to-[rgb(0_35_100/0.2)] p-8 md:p-10">
          <div className="pointer-events-none absolute -right-12 top-0 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgb(0_82_255/0.25),transparent_70%)]" />
          <div className="relative space-y-4">
            <h2 className="font-heading text-xl font-semibold tracking-tight text-white md:text-2xl">
              Laszlo Bihary
            </h2>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
              Co-founder & product
            </p>
            <p className="text-sm leading-relaxed text-zinc-300 md:text-[15px]">
              Driving protocol integration and investor-facing product on Base.
            </p>
            <p className="text-sm leading-relaxed text-zinc-400 md:text-[15px]">
              Twenty-four years building on the web — from creative direction and SEO at 8Limes to
              project work at 4fans on decentralized products. Vienna-based; bridges storytelling,
              video, and blockchain so communities can actually use what we ship.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1 text-sm">
              <SocialLink href="https://www.linkedin.com/in/laszlo-bihary/">LinkedIn</SocialLink>
              <SocialLink href="https://x.com/bihary41418">X</SocialLink>
              <SocialLink href="https://www.tiktok.com/@nftdad33">TikTok @nftdad33</SocialLink>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-3xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/[0.06] via-black/35 to-black/45 p-8 md:p-10">
          <div className="relative space-y-4">
            <h2 className="font-heading text-xl font-semibold tracking-tight text-white md:text-2xl">
              Reinhard Stix
            </h2>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-200/70">
              Co-founder & real estate
            </p>
            <p className="text-sm leading-relaxed text-zinc-400 md:text-[15px]">
              Reinhard has been active in real estate development in Vienna and in holiday regions of
              Austria since 1997. Since 2013, his own company has implemented projects with total
              investment costs of €1.3 billion. These projects include new construction,
              comprehensive renovations, and conversions. They primarily involve residential buildings,
              but also some smaller offices and retail spaces, as well as data centers.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1 text-sm">
              <SocialLink href="https://www.linkedin.com/in/reinhard-stix-1b8328a8/">
                LinkedIn
              </SocialLink>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 md:p-10">
          <h2 className="font-heading text-xl font-semibold tracking-tight text-white md:text-2xl">
            Roman Horvath
          </h2>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
            Accountant
          </p>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400 md:text-[15px]">
            Financial reporting and compliance-oriented bookkeeping for the venture.
          </p>
        </section>
      </div>
    </MarketingShell>
  );
}
