import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPublicDocumentById,
  getPublicDocumentPreviewPaths,
  publicDocumentHref,
  type PublicDocumentId,
} from "@/lib/public-documents";
import { getStoryBySlug, allStorySlugs } from "@/lib/document-stories";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return allStorySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = getStoryBySlug(slug);
  if (!story) return { title: "Document" };
  return {
    title: `${story.title} — Building Culture`,
    description: story.dek,
    openGraph: { title: story.title, description: story.dek },
    twitter: { card: "summary", title: story.title, description: story.dek },
  };
}

export default async function DocumentStoryPage({ params }: Props) {
  const { slug } = await params;
  const story = getStoryBySlug(slug);
  const doc = getPublicDocumentById(slug as PublicDocumentId);

  if (!story || !doc) notFound();

  const pdfHref = publicDocumentHref(doc.filePath);
  const previews = getPublicDocumentPreviewPaths(doc);
  const isRemotePdf = pdfHref.startsWith("https://") || pdfHref.startsWith("http://");

  return (
    <article className="mx-auto max-w-[min(100%,56rem)] space-y-10 pb-16">
      <nav className="text-sm text-zinc-500">
        <Link href="/documents" className="text-brand hover:underline">
          ← Plan library
        </Link>
      </nav>

      <header className="space-y-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-muted">Story</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{story.title}</h1>
        <p className="text-lg text-zinc-300">{story.dek}</p>
      </header>

      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-muted">Viewer</p>
        <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-950 shadow-lg shadow-black/40">
          <iframe title={story.title} src={pdfHref} className="min-h-[75vh] w-full border-0 bg-zinc-900" />
        </div>
        <p className="text-xs text-zinc-500">
          The PDF loads in your browser&apos;s embedded viewer{isRemotePdf ? " (hosted file)" : ""}. If this area stays
          blank, use{" "}
          <a href={pdfHref} target="_blank" rel="noreferrer" className="text-brand hover:underline">
            open in new tab
          </a>
          .
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {!isRemotePdf ? (
          <a
            href={pdfHref}
            download
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-[#0A0A0A] hover:bg-brand-light"
          >
            Download
          </a>
        ) : null}
        <a
          href={pdfHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium text-zinc-200 hover:border-brand/40"
        >
          Open PDF (new tab)
        </a>
      </div>

      {previews.length > 0 ? (
        <div className="space-y-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-muted">Preview</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {previews.map((src) => (
              <div
                key={src}
                className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900"
              >
                <Image
                  src={src}
                  alt={`${story.title} — preview`}
                  fill
                  className="object-contain object-center"
                  sizes="(max-width: 720px) 100vw, 33vw"
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-zinc-500">
            Raster previews from the PDF (first pages). Open the file for full resolution and all sheets.
          </p>
        </div>
      ) : null}

      <div className="space-y-8">
        {story.sections.map((s) => (
          <section key={s.heading} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-white">{s.heading}</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-400">{s.body}</p>
          </section>
        ))}
      </div>

      <aside className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-100/90">
        <p className="font-medium text-amber-200">Disclaimer</p>
        <p className="mt-2">{story.disclaimer}</p>
      </aside>

      <p className="text-center text-xs text-zinc-500">
        <Link href="/legal/risk" className="underline underline-offset-2 hover:text-zinc-300">
          Risks &amp; legal
        </Link>
      </p>
    </article>
  );
}
