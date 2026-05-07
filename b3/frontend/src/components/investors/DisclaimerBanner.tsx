import { AlertTriangle } from "lucide-react";

/** Investor-facing legal framing — not securities advice. */
export function DisclaimerBanner({ dense }: { dense?: boolean }) {
  return (
    <aside
      className={`rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] ${dense ? "p-4" : "p-6"} text-sm text-amber-100/90`}
      role="note"
    >
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400/90" aria-hidden />
        <div className="space-y-2 leading-relaxed">
          <p className="font-medium text-amber-50">Important — not an offer; not advice</p>
          <p className="text-amber-100/85">
            This page is for discussion only. Nothing here is an offer to sell securities or a
            solicitation to buy. Figures are illustrative placeholders or toy scenarios—not audited
            forecasts, accounting, or tax advice. BCD and related mechanics may implicate
            regulations in your jurisdiction; retain counsel before running paid campaigns or
            promoting tokens.
          </p>
        </div>
      </div>
    </aside>
  );
}
