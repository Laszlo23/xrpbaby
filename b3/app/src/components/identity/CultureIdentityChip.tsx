import { Link } from "@tanstack/react-router";
import { Fingerprint } from "lucide-react";
import { useWalletCultureIdentity } from "@/hooks/useWalletCultureIdentity";

type Props = {
  className?: string;
  size?: "sm" | "md";
};

export function CultureIdentityChip({ className = "", size = "sm" }: Props) {
  const { primaryName, profilePath, isVerified, isLoading } = useWalletCultureIdentity();

  const pad = size === "md" ? "px-4 py-2 text-sm" : "px-3 py-1.5 text-[11px]";
  const base = `inline-flex max-w-[min(100%,14rem)] items-center gap-1.5 truncate rounded-full border font-mono font-medium uppercase tracking-wide transition ${pad}`;

  if (isLoading) {
    return (
      <span className={`${base} border-white/10 bg-black/30 text-zinc-500 ${className}`} aria-busy>
        <Fingerprint className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
        Identity…
      </span>
    );
  }

  if (primaryName && profilePath) {
    const nameParam = primaryName.includes(".") ? primaryName : primaryName;
    return (
      <Link
        to="/id/$name"
        params={{ name: nameParam }}
        title={isVerified ? "Your Culture ID" : "Culture ID (verify on-chain)"}
        className={`${base} border-[var(--vault-gold)]/40 bg-[var(--vault-gold)]/10 text-[var(--vault-gold)] hover:border-[var(--vault-gold)]/70 hover:bg-[var(--vault-gold)]/20 ${className}`}
      >
        <Fingerprint className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="truncate">{primaryName}</span>
      </Link>
    );
  }

  return (
    <Link
      to="/pass"
      className={`${base} border-white/15 bg-black/30 text-zinc-400 hover:border-[#C5FF41]/40 hover:text-[#C5FF41] ${className}`}
    >
      <Fingerprint className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
      Claim .culture
    </Link>
  );
}
