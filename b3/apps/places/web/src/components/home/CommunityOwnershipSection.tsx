import Link from "next/link";

export function CommunityOwnershipSection() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-eco/20 bg-gradient-to-br from-forest-deep/80 to-transparent px-8 py-12 sm:px-12">
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-action/10 blur-3xl" aria-hidden />
      <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Real estate owned by the people</h2>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
        Participation should be simple, transparent, and global — within the rules that apply to you and your issuer.
      </p>
      <ul className="mt-8 space-y-4 text-sm text-canvas">
        <li className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-eco/20 text-eco">1</span>
          Anyone can invest — where offerings and KYC permit.
        </li>
        <li className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-eco/20 text-eco">2</span>
          Anyone can trade — when pools and compliance allow.
        </li>
        <li className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-eco/20 text-eco">3</span>
          Anyone can earn yield — contract- and issuer-dependent; not guaranteed.
        </li>
      </ul>
      <Link
        href="/community"
        className="mt-10 inline-flex rounded-full border border-eco/40 bg-eco/10 px-6 py-2.5 text-sm font-semibold text-eco-light transition hover:bg-eco/20"
      >
        Join the community →
      </Link>
    </section>
  );
}
