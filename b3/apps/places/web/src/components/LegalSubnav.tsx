"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/legal", label: "Overview" },
  { href: "/legal/offerings", label: "Offerings" },
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/risk", label: "Risks" },
];

export function LegalSubnav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Legal sections"
      className="flex flex-wrap gap-2 border-b border-white/[0.06] pb-4 md:flex-col md:border-b-0 md:border-r md:pr-6 md:pb-0"
    >
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-lg px-3 py-2 text-sm transition md:w-full ${
              active ? "bg-white/[0.08] font-medium text-brand" : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
