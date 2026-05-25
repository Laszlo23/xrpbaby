const steps = [
  { title: "Community", sub: "Backers & believers" },
  { title: "Funding", sub: "Community round" },
  { title: "Property SPV", sub: "Legal holdco" },
  { title: "Tokenized shares", sub: "On-chain ERC-20" },
  { title: "Revenue", sub: "Rents & fees" },
  { title: "Investors", sub: "Distributions" },
];

/**
 * Vertical flow: Community → … → Investors (reference model).
 */
export function CulturalEcosystemFlow() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-0">
      {steps.map((st, i) => (
        <div key={st.title}>
          <div className="rounded-2xl border border-eco/25 bg-forest/40 px-6 py-5 text-center shadow-lg shadow-black/20">
            <p className="text-sm font-semibold text-canvas">{st.title}</p>
            <p className="mt-1 text-[11px] text-muted">{st.sub}</p>
          </div>
          {i < steps.length - 1 ? (
            <div className="flex justify-center py-1.5 text-eco/50" aria-hidden>
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ) : null}
        </div>
      ))}
      <p className="mt-4 text-center text-[10px] text-muted">Reference flow — actual terms vary by issuer and jurisdiction.</p>
    </div>
  );
}
