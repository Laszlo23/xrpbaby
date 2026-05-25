import Link from "next/link";
import { ContactConciergeCta } from "@/components/ContactConciergeCta";

type Props = {
  propertyIdStr: string;
};

/**
 * Disclosure-first strip: links to plan library, offering overview, and human contact.
 */
export function PropertyDealRoomStrip({ propertyIdStr }: Props) {
  return (
    <section
      aria-labelledby="deal-room-heading"
      className="scroll-mt-28 space-y-4 rounded-2xl border border-gold-500/20 bg-gradient-to-br from-gold-950/20 to-black/40 p-6 sm:p-8"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="deal-room-heading" className="text-lg font-semibold text-white">
            Deal room (reference)
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-zinc-400">
            Issuer-controlled offering documents supersede UI copy. Use these links for structure, risks, and plan artifacts
            — Legal hub for disclosures.
          </p>
        </div>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <li>
          <Link
            href="/documents"
            className="block rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm font-medium text-white transition hover:border-eco/35 hover:bg-white/[0.06]"
          >
            Plan library
            <span className="mt-0.5 block text-[11px] font-normal text-zinc-500">Documents index</span>
          </Link>
        </li>
        <li>
          <Link
            href="/legal/offerings"
            className="block rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm font-medium text-white transition hover:border-eco/35 hover:bg-white/[0.06]"
          >
            Offering structure
            <span className="mt-0.5 block text-[11px] font-normal text-zinc-500">Legal overview</span>
          </Link>
        </li>
        <li>
          <Link
            href="/legal/risk"
            className="block rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm font-medium text-white transition hover:border-eco/35 hover:bg-white/[0.06]"
          >
            Risks & disclaimer
            <span className="mt-0.5 block text-[11px] font-normal text-zinc-500">Required reading</span>
          </Link>
        </li>
        <li>
          <Link
            href="/transparency"
            className="block rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm font-medium text-white transition hover:border-eco/35 hover:bg-white/[0.06]"
          >
            Transparency
            <span className="mt-0.5 block text-[11px] font-normal text-zinc-500">Fees & contracts</span>
          </Link>
        </li>
      </ul>
      <p className="text-[11px] text-zinc-500">
        Listing id <span className="font-mono text-zinc-400">#{propertyIdStr}</span> — cite this when contacting issuer or registrar.
      </p>
      <ContactConciergeCta variant="compact" />
    </section>
  );
}
