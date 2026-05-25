"use client";

import Link from "next/link";
import { useState } from "react";
import { InvestFlowModal } from "@/components/InvestFlowModal";

export function HomeHeroActions() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-primary-shine w-full rounded-full px-8 py-3.5 text-sm font-semibold text-black shadow-xl shadow-black/40 transition duration-300 sm:w-auto"
          style={{
            background: "linear-gradient(to right, #9a7d45, #C6A55C, #d4b87a)",
          }}
        >
          Start investing
        </button>
        <Link
          href="/properties"
          className="w-full rounded-full border border-white/20 bg-white/[0.04] px-8 py-3.5 text-sm font-medium text-white backdrop-blur transition duration-300 hover:border-brand/50 hover:text-white sm:w-auto"
        >
          Browse properties
        </Link>
      </div>
      <InvestFlowModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
