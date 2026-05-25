import Link from "next/link";
import type { DemoPropertyDetail } from "@/lib/demo-properties";

const DEFAULT_BULLETS = [
  "Fractional economic exposure to the underlying asset per issuer disclosure — not direct title to land.",
  "Share of rental or other distributions only when declared by the issuer under the waterfall.",
  "Transferable ERC-20 on the listings chain when ComplianceRegistry and offering rules allow.",
  "Governance rights only where described in offering documents or SPV articles.",
];

type Props = {
  demo: DemoPropertyDetail | undefined;
};

export function InvestOwnershipSection({ demo }: Props) {
  const bullets = demo?.investorRightsBullets?.length ? demo.investorRightsBullets : DEFAULT_BULLETS;

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8" aria-labelledby="ownership-heading">
      <h2 id="ownership-heading" className="text-lg font-semibold text-white">
        What you own
      </h2>
      <p className="mt-1 text-xs text-zinc-500">
        Summary only — see{" "}
        <Link href="/legal" className="text-brand hover:underline">
          Legal
        </Link>{" "}
        and issuer documents.
      </p>
      <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-zinc-300">
        {bullets.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </section>
  );
}
