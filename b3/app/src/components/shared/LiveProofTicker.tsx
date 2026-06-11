import { usePublicProof } from "@/hooks/usePublicProof";
import {
  proofSignalHref,
  proofSignalValue,
  proofSignalsFor,
} from "@/lib/proof-signals";

type LiveProofTickerProps = {
  section: "ticker" | "bcc";
  className?: string;
};

export function LiveProofTicker({ section, className = "" }: LiveProofTickerProps) {
  const { data: proof, isLoading } = usePublicProof();
  const signals = proofSignalsFor(section);

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-mono text-[10px] tracking-[0.14em] text-zinc-500 uppercase sm:text-[11px] ${className}`}
    >
      {signals.map((signal) => {
        const href = proofSignalHref(signal.key, proof);
        const value = proofSignalValue(signal.key, proof, isLoading);
        const inner = (
          <>
            <span className="text-zinc-600">{signal.label}</span>{" "}
            <span className="tabular-nums text-[#00E5FF]">{value}</span>
          </>
        );
        return href ? (
          <a
            key={signal.key}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="transition hover:text-zinc-300"
            title={signal.note}
          >
            {inner}
          </a>
        ) : (
          <span key={signal.key} title={signal.note}>
            {inner}
          </span>
        );
      })}
      <a
        href="/api/investors/traction?view=proof"
        className="text-zinc-600 underline-offset-2 hover:text-[#C5FF41] hover:underline"
      >
        Verify →
      </a>
    </div>
  );
}
