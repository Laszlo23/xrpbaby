import type { Metadata } from "next";
import Link from "next/link";
import { PUBLIC_DOCUMENTS } from "@/lib/public-documents";
import { DOCUMENT_STORIES } from "@/lib/document-stories";

export const metadata: Metadata = {
  title: "Plan library — Building Culture",
  description:
    "Storytelling and context for each architectural PDF — disclosures, integrity notes, and links to files.",
};

export default function DocumentsIndexPage() {
  return (
    <div className="mx-auto max-w-[720px] space-y-10 pb-16">
      <header className="space-y-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-muted">Documentation</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Plan library</h1>
        <p className="text-sm leading-relaxed text-zinc-400">
          Each PDF has a short storytelling page with context for investors and operators. Files remain static assets;
          on-chain commitments (hashes) can be added when a registry contract is deployed.
        </p>
      </header>
      <ul className="space-y-4">
        {PUBLIC_DOCUMENTS.map((doc) => {
          const story = DOCUMENT_STORIES[doc.id];
          return (
            <li key={doc.id}>
              <Link
                href={`/documents/${doc.id}`}
                className="block rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition hover:border-brand/40 hover:bg-white/[0.05]"
              >
                <h2 className="font-semibold text-white">{story?.title ?? doc.title}</h2>
                {story?.dek && <p className="mt-2 text-sm text-zinc-400">{story.dek}</p>}
                <p className="mt-3 text-xs font-medium text-brand">Read story →</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
