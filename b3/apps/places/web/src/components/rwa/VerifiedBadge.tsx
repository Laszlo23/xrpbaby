type Props = { className?: string };

export function VerifiedBadge({ className = "" }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-bc-lime/30 bg-bc-lime/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-bc-lime ${className}`}
    >
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </svg>
      Verified
    </span>
  );
}
