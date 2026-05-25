"use client";

import { Link } from "@tanstack/react-router";
import { useWalletIdentities } from "@/hooks/useWalletIdentities";
import { parseIdentityFullName } from "@/lib/chain/tlds";

export function OwnerIdentitiesList({ currentFullName }: { currentFullName: string }) {
  const { data, isLoading } = useWalletIdentities();
  const identities = data?.identities ?? [];
  const currentKey = currentFullName.toLowerCase();

  if (isLoading) {
    return (
      <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        Loading your identities…
      </p>
    );
  }

  if (identities.length <= 1) {
    return null;
  }

  const sorted = [...identities].sort((a, b) => {
    const aCurrent = a.fullName.toLowerCase() === currentKey;
    const bCurrent = b.fullName.toLowerCase() === currentKey;
    if (aCurrent !== bCurrent) return aCurrent ? -1 : 1;
    return a.fullName.localeCompare(b.fullName);
  });

  return (
    <div className="mt-4 border-t border-border-strong/60 pt-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        Your identities ({identities.length})
      </p>
      <ul className="mt-3 flex flex-col gap-2" role="list">
        {sorted.map((identity) => {
          const parsed = parseIdentityFullName(identity.fullName);
          const isCurrent = identity.fullName.toLowerCase() === currentKey;
          const handle = parsed?.handle ?? identity.fullName.split(".")[0];
          const tld = parsed?.tld ?? identity.fullName.split(".")[1] ?? "";

          if (isCurrent) {
            return (
              <li key={identity.fullName}>
                <span
                  className="flex w-full items-center justify-between rounded-xl border border-primary/40 bg-primary/10 px-3 py-2.5"
                  aria-current="page"
                >
                  <span className="font-display text-sm font-medium">
                    <span className="text-gradient">{handle}</span>
                    <span className="font-serif italic text-primary">.{tld}</span>
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                    Viewing
                  </span>
                </span>
              </li>
            );
          }

          return (
            <li key={identity.fullName}>
              <Link
                to="/id/$name"
                params={{ name: identity.fullName }}
                className="flex w-full items-center justify-between rounded-xl border border-border-strong px-3 py-2.5 transition hover:border-primary/30 hover:bg-surface-elevated"
              >
                <span className="font-display text-sm font-medium text-foreground">
                  <span>{handle}</span>
                  <span className="font-serif italic text-primary">.{tld}</span>
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Open →
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <Link
        to="/"
        hash="claim"
        className="mt-3 inline-block font-mono text-[10px] uppercase tracking-wider text-primary hover:underline"
      >
        Mint another name →
      </Link>
    </div>
  );
}
