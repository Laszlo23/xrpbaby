import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Offerings & legal structure — Building Culture",
  description:
    "How protocol software, settlement tokens, and property SPVs are separated. Not legal advice.",
};

export default function LegalOfferingsPage() {
  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <h1 className="text-2xl font-bold text-white">Offerings & legal structure</h1>
      <p className="text-zinc-400">
        This page summarizes how we separate layers for transparent expectations.{" "}
        <strong className="font-medium text-zinc-300">It is not legal advice.</strong> Engage qualified counsel before any
        offering or solicitation.
      </p>

      <h2 className="mt-10 text-lg font-semibold text-white">Three layers</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-400">
        <li>
          <strong className="text-zinc-300">Protocol (company)</strong> — Builds and operates software; earns disclosed
          protocol fees; funded through standard company equity instruments (e.g. SAFE, priced rounds) where applicable.
        </li>
        <li>
          <strong className="text-zinc-300">Settlement token (ERC-20)</strong> — Optional checkout asset on Base for
          integrated flows. It is{" "}
          <strong className="text-zinc-300">not</strong> a substitute for property share tokens unless explicitly
          structured and documented otherwise.
        </li>
        <li>
          <strong className="text-zinc-300">Property / SPV</strong> — Legal entities and offering documents govern title,
          rent, and exit. On-chain share tokens represent claims only as described in those documents.
        </li>
      </ul>

      <h2 className="mt-10 text-lg font-semibold text-white">Disclosure checklist</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-400">
        <li>Separate documents for software participation, any token sale, and each property or basket.</li>
        <li>Risk factors: liquidity, smart contracts, regulation, property markets, operator reliance.</li>
        <li>Avoid merged marketing that implies one token carries all economic rights unless legally true.</li>
        <li>Follow securities and marketing rules in each jurisdiction; use geoblocking where required.</li>
        <li>Publish treasury multisig addresses and fee policies (see Transparency).</li>
      </ul>

      <p className="mt-10 text-sm text-zinc-500">
        Repository reference: <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs">docs/legal-and-offerings.md</code>
      </p>

      <p className="mt-6">
        <Link href="/transparency" className="text-gold-400 hover:underline">
          Protocol transparency (fees & contracts) →
        </Link>
      </p>
    </div>
  );
}
