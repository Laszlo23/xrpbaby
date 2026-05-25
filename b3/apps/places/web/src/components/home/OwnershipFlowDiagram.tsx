"use client";

import { Fragment } from "react";

const stages = [
  { title: "Property", sub: "Real asset" },
  { title: "Tokenization", sub: "On-chain share token" },
  { title: "Community ownership", sub: "Fractional holders" },
  { title: "Rental yield", sub: "Issuer-dependent" },
];

/**
 * Property → Tokenization → Community ownership → Rental yield (reference flow).
 */
export function OwnershipFlowDiagram() {
  return (
    <div className="w-full px-1">
      <div className="flex flex-col items-center gap-2 md:flex-row md:flex-wrap md:justify-center md:gap-0">
        {stages.map((st, i) => (
          <Fragment key={st.title}>
            <div className="w-full max-w-sm rounded-2xl border border-eco/25 bg-forest/40 px-5 py-4 text-center shadow-lg shadow-black/20 md:w-auto md:min-w-[132px] md:max-w-none md:flex-1 lg:min-w-[148px]">
              <p className="text-sm font-semibold text-canvas">{st.title}</p>
              <p className="mt-1 text-[11px] text-muted">{st.sub}</p>
            </div>
            {i < stages.length - 1 ? (
              <>
                <div className="flex py-1 text-eco/35 md:hidden" aria-hidden>
                  <svg className="mx-auto h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="hidden px-1 text-eco/35 md:flex" aria-hidden>
                  <svg className="h-8 w-8 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </>
            ) : null}
          </Fragment>
        ))}
      </div>
      <p className="mt-6 text-center text-[10px] text-muted">
        Reference flow — actual rights and cash flows depend on issuer documents and smart contract terms.
      </p>
    </div>
  );
}
