import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Build with us — Building Culture",
  description:
    "Partner with Building Culture to launch community-owned cultural real estate — architects, developers, landowners, and rural communities.",
};

export default function BuildWithUsPage() {
  return (
    <div className="mx-auto max-w-[720px] space-y-12 pb-16">
      <header className="space-y-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-muted">Partners</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Build community-owned places with us
        </h1>
        <p className="text-sm leading-relaxed text-zinc-400">
          We help teams structure tokenized ownership and community funding rounds for coworking, cultural, and housing
          projects — production pilots require issuer, legal, and jurisdiction fit. Not an offer to sell
          securities.
        </p>
      </header>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-white">Who this is for</h2>
        <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-zinc-400">
          <li>Architects</li>
          <li>Developers</li>
          <li>Rural communities</li>
          <li>Land owners</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-white">How it works</h2>
        <ol className="mt-4 list-inside list-decimal space-y-3 text-sm text-zinc-400">
          <li>Submit project — high-level site, use, and jurisdiction.</li>
          <li>Structure tokenization — SPV, share instrument, compliance path (working-session templates).</li>
          <li>Launch community funding — round UI patterns; regulated raises require counsel-approved docs.</li>
          <li>Build and operate — delivery and governance per issuer charter.</li>
        </ol>
      </section>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <ButtonLink href="/issuer">Submit a project</ButtonLink>
        <Link href="/feedback" className="text-center text-sm font-medium text-brand hover:underline sm:text-left">
          General feedback (no wallet) →
        </Link>
      </div>

      <p className="text-xs text-zinc-500">
        Technical submissions use the issuer flow. For platform questions, see{" "}
        <Link href="/legal" className="text-brand hover:underline">
          Legal &amp; risks
        </Link>
        .
      </p>
    </div>
  );
}
