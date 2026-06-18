"use client";

import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Copy, Users } from "lucide-react";
import { toast } from "sonner";

import { getPartnerTree } from "@/lib/api/member.functions";
import { COMMISSION_RATES } from "@/lib/tracks-data";

export const Route = createFileRoute("/members/partner")({
  component: PartnerPage,
});

function PartnerPage() {
  const { member } = useRouteContext({ from: "/members" });
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const fullLink = `${origin}/join?ref=${member.referralCode}`;

  const { data: tree } = useQuery({
    queryKey: ["partner-tree"],
    queryFn: () => getPartnerTree(),
  });

  const copyLink = () => {
    navigator.clipboard.writeText(fullLink);
    toast.success("Referral link copied.");
  };

  return (
    <div className="mx-auto max-w-4xl px-6 pb-20">
      <p className="font-mono text-xs uppercase tracking-widest text-signal">Partner program</p>
      <h1 className="mt-4 font-display text-4xl font-bold md:text-5xl">Share. Earn. Scale.</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Web2-friendly income — no crypto required. Introduce people to RESET and earn on three
        levels when they join.
      </p>

      <div className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-3">
        <div className="bg-background p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Pending
          </div>
          <div className="mt-2 font-display text-3xl font-bold text-signal">
            ${((member.partner.pendingEarningsCents ?? 0) / 100).toFixed(2)}
          </div>
        </div>
        <div className="bg-background p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Total earned
          </div>
          <div className="mt-2 font-display text-3xl font-bold">
            ${((member.partner.totalEarningsCents ?? 0) / 100).toFixed(2)}
          </div>
        </div>
        <div className="bg-background p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Direct partners
          </div>
          <div className="mt-2 flex items-center gap-2 font-display text-3xl font-bold">
            <Users className="h-6 w-6 text-signal" />
            {member.partner.directReferrals}
          </div>
        </div>
      </div>

      <div className="mt-8 border border-border bg-surface p-6">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Your referral link
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <code className="flex-1 break-all border border-border bg-background px-4 py-3 font-mono text-xs">
            {fullLink}
          </code>
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex items-center gap-2 bg-signal px-4 py-3 font-mono text-xs font-semibold uppercase tracking-widest text-signal-foreground"
          >
            <Copy className="h-4 w-4" /> Copy
          </button>
        </div>
        <p className="mt-3 font-mono text-[10px] text-muted-foreground">
          Code: {member.referralCode}
        </p>
      </div>

      <div className="mt-8 border border-border">
        <div className="border-b border-border bg-surface px-6 py-4 font-mono text-xs uppercase tracking-widest">
          Commission structure
        </div>
        {COMMISSION_RATES.map((c) => (
          <div
            key={c.level}
            className="flex items-center justify-between border-b border-border px-6 py-4 last:border-0"
          >
            <span>
              Level {c.level} — {c.label}
            </span>
            <span className="font-display text-xl font-bold text-signal">
              {(c.rate * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>

      {tree && tree.directPartners.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-2xl font-bold">Your direct partners</h2>
          <div className="mt-4 space-y-2">
            {tree.directPartners.map((p) => (
              <div
                key={p.referralCode}
                className="flex items-center justify-between border border-border p-4"
              >
                <span>{p.name}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {p.plan} · {new Date(p.joinedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
