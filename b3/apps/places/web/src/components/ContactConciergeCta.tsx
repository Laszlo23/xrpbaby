import Link from "next/link";

const email = typeof process.env.NEXT_PUBLIC_CONTACT_EMAIL === "string" ? process.env.NEXT_PUBLIC_CONTACT_EMAIL.trim() : "";

type Props = {
  /** Larger card on hub pages vs compact strip on property detail */
  variant?: "card" | "compact";
};

/**
 * Human touchpoint for sponsors / LPs — wire NEXT_PUBLIC_CONTACT_EMAIL at deploy.
 * Align copy with `/legal/privacy` if you enable lead capture.
 */
export function ContactConciergeCta({ variant = "card" }: Props) {
  const mailto = email ? `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent("Building Culture — inquiry")}` : null;

  const inner = (
    <>
      <div className="min-w-0">
        <p className="font-semibold text-white">Questions on diligence or allocations?</p>
        <p className="mt-1 text-xs text-zinc-500">
          Published figures are for orientation — confirm details with the team before any commitment.
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        {mailto ? (
          <a
            href={mailto}
            className="rounded-full bg-gradient-to-r from-eco to-eco-light px-4 py-2 text-xs font-semibold text-[#0a0f0d] shadow-md hover:opacity-95"
          >
            Email us
          </a>
        ) : null}
        <Link
          href="/build-with-us"
          className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white hover:border-eco/40 hover:bg-white/[0.04]"
        >
          Build with us
        </Link>
        <Link href="/feedback" className="rounded-full px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white">
          Feedback
        </Link>
      </div>
    </>
  );

  if (variant === "compact") {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-black/25 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        {inner}
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-eco/20 bg-gradient-to-br from-forest/40 to-black/40 px-6 py-6 backdrop-blur-sm sm:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">{inner}</div>
    </section>
  );
}
