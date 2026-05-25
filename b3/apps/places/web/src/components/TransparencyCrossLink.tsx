import Link from "next/link";

/** Subtle disclosure path now that Transparency is out of the main navbar. */
export function TransparencyCrossLink({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[11px] leading-relaxed text-zinc-500 ${className}`}>
      Fees, deployments & settlements:{" "}
      <Link href="/transparency" className="font-medium text-brand hover:underline">
        Transparency
      </Link>
      {" · "}
      <Link href="/legal/offerings" className="text-zinc-400 underline-offset-2 hover:text-white hover:underline">
        Offering structure
      </Link>
    </p>
  );
}
