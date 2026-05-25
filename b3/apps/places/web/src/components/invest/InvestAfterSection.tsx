import Link from "next/link";

export function InvestAfterSection() {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8" aria-labelledby="after-invest-heading">
      <h2 id="after-invest-heading" className="text-lg font-semibold text-white">
        After your investment
      </h2>
      <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-zinc-300">
        <li>
          Shares appear in{" "}
          <Link href="/portfolio" className="text-brand hover:underline">
            Portfolio
          </Link>{" "}
          once the transaction confirms.
        </li>
        <li>Distributions follow issuer schedules — track announcements and on-chain transfers where applicable.</li>
        <li>
          Buyback or liquidity programs depend on issuer terms — see disclosure and{" "}
          <Link href="/transparency" className="text-brand hover:underline">
            Transparency
          </Link>
          .
        </li>
      </ul>
    </section>
  );
}
