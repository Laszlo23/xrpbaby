import { TrustStrip } from "@/components/TrustStrip";

export function TrustSection({ className = "" }: { className?: string }) {
  return (
    <section className={className} aria-labelledby="trust-heading">
      <h2 id="trust-heading" className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-eco-muted">
        Trust &amp; transparency
      </h2>
      <TrustStrip />
    </section>
  );
}
