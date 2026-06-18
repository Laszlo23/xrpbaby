import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { ProductPageLayout } from "@/components/products/ProductPageLayout";
import { StatusBadge } from "@/components/landing/StatusBadge";
import { PILLAR_PRODUCTS, LANDING_TAGLINE } from "@/lib/landing-copy";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/products/")({
  head: () =>
    pageHead({
      title: "Products — Building Culture",
      description:
        "Building Culture ID, Campaign Hub, AI Agents, and Grant Proof — the community OS for portable reputation and verifiable impact.",
      path: "/products",
      keywords: [
        "Building Culture",
        "community OS",
        "Web3 reputation",
        "campaign hub",
        "AI agents",
        "grant proof",
      ],
    }),
  component: ProductsIndexPage,
});

function ProductsIndexPage() {
  return (
    <div className="bc-surface min-h-screen">
      <section className="relative overflow-hidden bg-black pt-28 pb-16 sm:pt-36">
        <div className="absolute inset-0 bc-grid opacity-30" />
        <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
          <p className="mono-label">{LANDING_TAGLINE}</p>
          <h1 className="mt-6 font-display text-[40px] font-bold tracking-tight text-white sm:text-6xl">
            Our products
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-400">
            Four pillars that power community-owned growth — identity, campaigns, AI agents, and
            grant proof.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-24 sm:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          {PILLAR_PRODUCTS.map((product) => (
            <Link
              key={product.id}
              to={product.productPageHref}
              className="group rounded-3xl bc-glass p-7 transition-all hover:bc-glass-strong"
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{product.emoji}</span>
                <StatusBadge status={product.status} />
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold text-white">{product.name}</h2>
              <p className="mt-2 text-zinc-400">{product.tagline}</p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#C5FF41]">
                Learn more
                <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/"
            hash="ecosystem"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-white"
          >
            Explore full ecosystem
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
