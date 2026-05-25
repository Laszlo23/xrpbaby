import type { ReactNode } from "react";

export function LegalProse({
  title,
  counselBanner,
  children,
}: {
  title: string;
  /** When true, show a prominent “replace with counsel-approved text” notice. */
  counselBanner?: boolean;
  children: ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 shadow-[inset_0_1px_0_rgb(255_255_255/0.04)] md:p-8">
      <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">{title}</h2>
      {counselBanner ? (
        <aside className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
          <p className="font-medium text-amber-50">Counsel review required</p>
          <p className="mt-1 text-amber-100/85">
            Replace this page with jurisdiction-specific, counsel-approved text before scaling paid
            mints, raffles, or regulated audiences. Imprint obligations (e.g. Germany/EU) apply
            independently of English copy.
          </p>
        </aside>
      ) : null}
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-zinc-400">{children}</div>
    </article>
  );
}
