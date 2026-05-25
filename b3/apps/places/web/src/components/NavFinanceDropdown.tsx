"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const IconInvest = (cls: string) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" />
  </svg>
);
const IconTrade = (cls: string) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
    <path d="M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconPortfolio = (cls: string) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
    <rect x="3" y="3" width="7" height="18" rx="1" />
    <rect x="14" y="9" width="7" height="12" rx="1" />
  </svg>
);
const IconPool = (cls: string) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
    <path
      d="M12 3c-2 3-6 3-6 8s4 5 6 8c2-3 6-3 6-8s-4-5-6-8Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M12 14c-2 2-4 1.5-4 4M12 14c2 2 4 1.5 4 4" strokeLinecap="round" />
  </svg>
);
const IconStake = (cls: string) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinejoin="round" />
  </svg>
);

export type FinanceNavItem = {
  href: string;
  label: string;
  hint: string;
  icon: (cls: string) => ReactNode;
};

/** Shared with mobile drawer — order: journey → execution → positions → liquidity → staking */
export const FINANCE_NAV_ITEMS: FinanceNavItem[] = [
  { href: "/invest", label: "Invest", hint: "Size a position & journey", icon: IconInvest },
  { href: "/trade", label: "Trade", hint: "Primary & secondary execution", icon: IconTrade },
  { href: "/portfolio", label: "Portfolio", hint: "Your holdings", icon: IconPortfolio },
  { href: "/pool", label: "Pool", hint: "Add liquidity", icon: IconPool },
  { href: "/stake", label: "Stake", hint: "Stake native ETH for rewards", icon: IconStake },
];

export function financeSectionActive(pathname: string): boolean {
  return FINANCE_NAV_ITEMS.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
}

function navLinkClass(active: boolean) {
  return `group relative inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] transition-colors duration-200 md:px-2.5 ${
    active
      ? "bg-eco/15 text-eco-light"
      : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
  }`;
}

export function NavFinanceDropdown() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const sectionActive = financeSectionActive(pathname);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const iconCls = "h-3.5 w-3.5 shrink-0 opacity-90";

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        id={`${menuId}-trigger`}
        data-testid="nav-finance-trigger"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        className={navLinkClass(sectionActive)}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
      >
        <svg className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" />
        </svg>
        <span>Finance</span>
        <svg
          className={`h-3 w-3 shrink-0 opacity-70 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <div
          id={menuId}
          data-testid="nav-finance-menu"
          role="menu"
          aria-labelledby={`${menuId}-trigger`}
          className="absolute left-0 top-[calc(100%+6px)] z-[60] min-w-[14rem] rounded-xl border border-white/[0.1] bg-surface/98 py-1 shadow-2xl shadow-black/50 backdrop-blur-xl ring-1 ring-white/[0.06]"
        >
          {FINANCE_NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                className={`flex items-start gap-3 px-3 py-2.5 text-left text-[13px] transition first:rounded-t-lg last:rounded-b-lg ${
                  active ? "bg-eco/15 text-eco-light" : "text-zinc-200 hover:bg-white/[0.06]"
                }`}
                onClick={() => setOpen(false)}
              >
                <span className="mt-0.5 shrink-0 text-current">{item.icon("h-4 w-4 opacity-90")}</span>
                <span>
                  <span className="block font-medium">{item.label}</span>
                  <span className="block text-[11px] font-normal text-zinc-500">{item.hint}</span>
                </span>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
