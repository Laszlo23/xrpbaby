import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { useQuery } from "@tanstack/react-query";
import { fetchProfileBySlug } from "@/lib/community-profile/api";
import { ProfileHero } from "@/components/community-profile/ProfileHero";
import { ProfileSections } from "@/components/community-profile/ProfileSections";

export const Route = createFileRoute("/p/$slug")({
  head: ({ params }) =>
    pageHead({
      title: `@${params.slug}`,
      description: `Community profile @${params.slug} on BUILDCHAIN — builder stats and public showcase.`,
      path: `/p/${params.slug}`,
      keywords: ["BUILDCHAIN", "profile", params.slug],
    }),
  component: PublicProfilePage,
});

function PublicProfilePage() {
  const { slug } = Route.useParams();
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = origin ? `${origin}/p/${slug}` : "";

  const q = useQuery({
    queryKey: ["community-profile", slug],
    queryFn: () => fetchProfileBySlug(slug),
  });

  if (q.isLoading) {
    return (
      <div className="min-h-screen pb-nav-safe px-4 pt-16 text-center text-sm text-zinc-500 md:pt-20">
        Loading profile…
      </div>
    );
  }

  if (q.isError || !q.data) {
    return (
      <div className="min-h-screen pb-nav-safe px-4 pt-16 text-center md:pt-20">
        <h1 className="font-heading text-2xl text-white">Profile not found</h1>
        <p className="mt-2 text-sm text-zinc-500">
          This handle does not exist or Strapi is unreachable. Set{" "}
          <span className="font-mono text-zinc-400">VITE_STRAPI_URL</span> if needed.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <div className="mx-auto max-w-4xl px-4 pt-12 md:px-8 md:pt-16">
        <ProfileHero profile={q.data} shareUrl={shareUrl} />
      </div>
      <ProfileSections profile={q.data} />
    </div>
  );
}
