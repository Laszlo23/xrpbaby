import { chainlinkComplianceCopy } from "@/lib/chainlink-compliance-copy";

export function ChainlinkComplianceStrip() {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">RWA compliance</p>
      <h2 className="mt-2 font-heading text-lg font-semibold text-white">{chainlinkComplianceCopy.headline}</h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">{chainlinkComplianceCopy.body}</p>
      <ul className="mt-4 list-inside list-disc space-y-1 text-xs text-zinc-500">
        {chainlinkComplianceCopy.disclaimers.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <a
          href={chainlinkComplianceCopy.placesHref}
          target="_blank"
          rel="noreferrer noopener"
          className="text-[#00E5FF] hover:underline"
        >
          Places transparency ↗
        </a>
        <a href="/places" className="text-zinc-400 hover:text-white">
          Unified Places hub
        </a>
      </div>
    </section>
  );
}
