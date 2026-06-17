import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

export function ProfileFooterCTA() {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center md:px-10">
      <p className="font-display text-xl font-semibold text-white md:text-2xl">
        Your name. Your culture. Your onchain identity.
      </p>
      <p className="mx-auto mt-3 max-w-lg text-sm text-zinc-400">
        Mint a transferable Culture Layer name on Base — resolve across Building Culture and share
        one proof-first profile link.
      </p>
      <Button asChild size="lg" className="mt-6 rounded-full">
        <Link to="/pass">Mint your Culture Layer identity</Link>
      </Button>
    </section>
  );
}
