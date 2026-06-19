import { createFileRoute, Link } from "@tanstack/react-router";

import { ProfileShareBar } from "@/components/identity/ProfileShareBar";
import { cultureProfileUrl } from "@/lib/identity/urls";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/id/$name/card")({
  component: ProfileShareCardPage,
  head: ({ params }) =>
    pageHead({
      title: `${params.name} — share card`,
      description: `Shareable culture profile card for ${params.name}.`,
      path: `/id/${params.name}/card`,
    }),
});

function ProfileShareCardPage() {
  const { name } = Route.useParams();
  const shareUrl = cultureProfileUrl(name);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5 py-12">
      <div className="w-full max-w-md rounded-3xl border border-[var(--vault-gold)]/30 bg-gradient-to-br from-zinc-950 via-black to-[#1a1025] p-8 text-center shadow-[0_0_60px_-15px_var(--vault-gold)]">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--vault-gold)]">
          Culture ID
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold text-white">{name}</h1>
        <p className="mt-2 text-sm text-zinc-400">Building culture onchain</p>
        <div className="mt-8 flex justify-center">
          <ProfileShareBar shareUrl={shareUrl} title={name} />
        </div>
        <Link
          to="/id/$name"
          params={{ name }}
          className="mt-8 inline-block text-sm text-[#00E5FF] hover:underline"
        >
          Full profile →
        </Link>
      </div>
    </div>
  );
}
