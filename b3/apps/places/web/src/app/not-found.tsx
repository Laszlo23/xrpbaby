import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-eco-muted">Building Culture</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">Page not found</h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        This URL isn&apos;t part of the current deployment, or the listing may have moved. Try the hub pages below.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
        <Link
          href="/properties"
          className="rounded-full bg-gradient-to-r from-eco to-eco-light px-6 py-3 text-sm font-semibold text-[#0a0f0d] shadow-lg shadow-eco/20 hover:opacity-95"
        >
          Investment opportunities
        </Link>
        <Link
          href="/culture-land"
          className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:border-eco/40 hover:bg-white/[0.04]"
        >
          Culture Land portfolio
        </Link>
        <Link href="/" className="rounded-full px-6 py-3 text-sm font-medium text-zinc-400 hover:text-white">
          Home
        </Link>
      </div>
    </div>
  );
}
