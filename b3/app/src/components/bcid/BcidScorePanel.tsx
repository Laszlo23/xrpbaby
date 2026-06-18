import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

type Props = {
  did: string;
  publicHandle: string | null;
  builder: number;
  trust: number;
  contribution: number;
  verification: number;
  credentialCount: number;
  isOwner?: boolean;
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  const width = Math.min(100, value);
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className="font-mono text-zinc-200">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-[#00E5FF] to-[#C5FF41]"
        />
      </div>
    </div>
  );
}

export function BcidScorePanel({
  did,
  publicHandle,
  builder,
  trust,
  contribution,
  verification,
  credentialCount,
  isOwner,
}: Props) {
  return (
    <section className="rounded-2xl border border-[#C5FF41]/20 bg-[#C5FF41]/5 p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="mono-label !text-[#C5FF41]">BCID REPUTATION</p>
          <p className="mt-1 font-mono text-xs text-zinc-500">{did}</p>
        </div>
        <Link
          to="/bcid"
          className="rounded-full border border-[#C5FF41]/30 px-3 py-1 text-xs text-[#C5FF41] hover:bg-[#C5FF41]/10"
        >
          About BCID
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ScoreBar label="Builder" value={builder} />
        <ScoreBar label="Trust" value={trust} />
        <ScoreBar label="Contribution" value={contribution} />
        <ScoreBar label="Verification" value={verification} />
      </div>

      <p className="mt-4 text-xs text-zinc-500">
        {credentialCount} BCID credential{credentialCount === 1 ? "" : "s"} · Verifiable contributions
        only (no follower weight)
      </p>

      {isOwner ? (
        <Link
          to="/bcid/mint"
          className="mt-4 inline-block text-sm text-[#C5FF41] hover:underline"
        >
          Manage BCID →
        </Link>
      ) : publicHandle ? (
        <p className="mt-4 text-xs text-zinc-600">Handle: {publicHandle}</p>
      ) : null}
    </section>
  );
}
