"use client";

import { useEffect, useState } from "react";
import { flagshipCampaign } from "@/lib/flagship-campaign";

const NAMES = ["Laszlo", "Anna", "Marco", "Sofia", "Jonas", "Elena", "David", "Priya"];
const CITIES = ["Vienna", "Berlin", "Munich", "Zurich", "Amsterdam", "Paris", "Milan", "Stockholm"];

function narrativeLine(): string {
  const n = NAMES[Math.floor(Math.random() * NAMES.length)];
  const c = CITIES[Math.floor(Math.random() * CITIES.length)];
  const pool = [
    `Investor from ${c} backed ${flagshipCampaign.displayName} — reference round`,
    `Community round reached ${52 + Math.floor(Math.random() * 15)}% of reference target`,
    `New property narrative submitted by an architect (review queue)`,
    `${n} from ${c} joined the founding investor waitlist`,
    `Heritage allocation updated for ${flagshipCampaign.displayName.split("—")[0].trim()} (reference UI)`,
    `${n} reserved ${800 + Math.floor(Math.random() * 4200)} USDC in the app UI (not a bank deposit)`,
    `Rural revitalization project added to discovery`,
    `Governance vote queued on amenities package — verify on-chain when live`,
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}

function randomLine(): string {
  if (Math.random() > 0.35) return narrativeLine();
  const n = NAMES[Math.floor(Math.random() * NAMES.length)];
  const c = CITIES[Math.floor(Math.random() * CITIES.length)];
  if (Math.random() > 0.45) {
    const amt = 800 + Math.floor(Math.random() * 9200);
    return `${n} from ${c} invested $${amt.toLocaleString("en-US")} (reference)`;
  }
  const shares = 12 + Math.floor(Math.random() * 400);
  return `${n} from ${c} bought ${shares.toLocaleString("en-US")} shares (reference)`;
}

type Props = {
  /** Horizontal marquee ticker (home hero) vs stacked list */
  variant?: "list" | "ticker";
};

export function LiveActivityFeed({ variant = "list" }: Props) {
  const [lines, setLines] = useState<string[]>(() => Array.from({ length: 5 }, () => randomLine()));

  useEffect(() => {
    const t = setInterval(() => {
      setLines((prev) => [randomLine(), ...prev.slice(0, 7)]);
    }, 12_000);
    return () => clearInterval(t);
  }, []);

  if (variant === "ticker") {
    const duplicated = [...lines, ...lines];
    return (
      <div className="glass-card overflow-hidden border-eco/20 py-0">
        <div className="flex items-center gap-4 border-b border-eco/15 px-4 py-3 sm:px-6">
          <p className="shrink-0 text-[11px] font-medium uppercase tracking-[0.2em] text-eco-muted">Live activity</p>
          <p className="text-[10px] text-muted">Synthetic community feed</p>
        </div>
        <div className="relative overflow-hidden py-3 motion-reduce:animate-none">
          <div className="flex w-max animate-marquee gap-16 whitespace-nowrap pr-16 motion-reduce:animate-none">
            {duplicated.map((line, i) => (
              <span key={`${line}-${i}`} className="text-sm text-canvas/90">
                <span className="text-eco">●</span> {line}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden border-eco/20">
      <div className="border-b border-eco/15 px-5 py-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-eco-muted">Live activity</p>
        <p className="text-xs text-muted">Synthetic feed — not on-chain events</p>
      </div>
      <ul
        className="max-h-52 space-y-0 divide-y divide-eco/10 overflow-y-auto text-sm outline-none focus-visible:ring-2 focus-visible:ring-eco/35"
        tabIndex={0}
        aria-label="Activity lines"
      >
        {lines.map((line, i) => (
          <li
            key={`${line}-${i}`}
            className={`px-5 py-2.5 text-canvas/90 transition ${i === 0 ? "bg-eco/10" : ""}`}
          >
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
