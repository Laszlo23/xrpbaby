"use client";

import { Link } from "@tanstack/react-router";
import { Hexagon } from "lucide-react";
import type { ReactNode } from "react";

import { WalletConnectButton } from "@/components/solana/WalletConnectButton";
import { useBuilder } from "@/hooks/use-builder";

export function WalletGate({ children }: { children: ReactNode }) {
  const { connected, isLoading } = useBuilder();

  if (isLoading && connected) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Syncing builder profile...
        </p>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Hexagon className="h-12 w-12 fill-signal text-signal" strokeWidth={1.5} />
        <h1 className="mt-8 font-display text-4xl font-bold">Connect to build</h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          Link your Solana wallet to access missions, earn BCC tokens, and mint on-chain
          achievements.
        </p>
        <div className="mt-8">
          <WalletConnectButton />
        </div>
        <Link
          to="/"
          className="mt-8 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-signal"
        >
          ← Back to home
        </Link>
      </div>
    );
  }

  return children;
}
