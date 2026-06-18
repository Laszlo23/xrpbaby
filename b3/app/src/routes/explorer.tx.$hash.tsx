import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Clock, Fuel, XCircle } from "lucide-react";

import { pageHead } from "@/lib/seo";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AiExplanation } from "@/modules/explorer/AiExplanation";
import { ExplorerSearch } from "@/modules/explorer/ExplorerSearch";
import { NerdModePanel } from "@/modules/explorer/NerdModePanel";
import { ValueFlow } from "@/modules/explorer/ValueFlow";
import {
  TX_KIND_LABELS,
  shortAddress,
  timeAgo,
  type TxExplanationContent,
  type TxFacts,
} from "@/modules/explorer/lib";

export const Route = createFileRoute("/explorer/tx/$hash")({
  head: ({ params }) =>
    pageHead({
      title: `Transaction ${shortAddress(params.hash)} explained — ${BRAND_DISPLAY_NAME}`,
      description: "This Base transaction, explained in plain language anyone can understand.",
      path: `/explorer/tx/${params.hash}`,
    }),
  component: TxStoryPage,
});

type TxResponse =
  | { ok: true; facts: TxFacts; source: string; explanation: TxExplanationContent | null }
  | { ok: false; error: string };

function StatusBanner({ facts }: { facts: TxFacts }) {
  if (facts.status === "success") {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.07] px-4 py-3">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
        <p className="text-sm text-emerald-100/90">
          This transaction <span className="font-semibold">worked</span> — everything below happened
          exactly as shown.
        </p>
      </div>
    );
  }
  if (facts.status === "failed") {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-red-500/25 bg-red-500/[0.07] px-4 py-3">
        <XCircle className="h-5 w-5 shrink-0 text-red-400" aria-hidden />
        <p className="text-sm text-red-100/90">
          This transaction <span className="font-semibold">failed</span> — nothing was transferred,
          but the small network fee was still paid.
        </p>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-4 py-3">
      <Clock className="h-5 w-5 shrink-0 text-amber-400" aria-hidden />
      <p className="text-sm text-amber-100/90">
        This transaction is still <span className="font-semibold">being processed</span> by the
        network.
      </p>
    </div>
  );
}

function TxStorySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-56 w-full rounded-2xl" />
    </div>
  );
}

function TxStoryPage() {
  const { hash } = Route.useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["explorer-tx", hash],
    queryFn: async (): Promise<TxResponse> => {
      const res = await fetch(`/api/explorer/tx/${hash}`);
      return (await res.json()) as TxResponse;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Link
          to="/explorer"
          className="inline-flex w-fit items-center gap-1.5 text-xs text-zinc-500 transition hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to explorer
        </Link>
        <ExplorerSearch />
      </div>

      {isLoading ? <TxStorySkeleton /> : null}

      {!isLoading && (!data || !data.ok) ? (
        <div className="rounded-2xl border border-white/[0.06] bg-black/30 px-6 py-10 text-center">
          <p className="font-heading text-lg font-semibold text-white">
            We couldn't find that transaction
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
            Double-check the transaction hash — it should be 66 characters starting with 0x. It may
            also be on a different network than Base.
          </p>
        </div>
      ) : null}

      {data?.ok ? (
        <>
          <StatusBanner facts={data.facts} />

          <section className="rounded-2xl border border-white/[0.06] bg-black/30 p-5 md:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full bg-[var(--base-blue)]/20 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--base-blue)] hover:bg-[var(--base-blue)]/20">
                {TX_KIND_LABELS[data.facts.kind].label}
              </Badge>
              {data.facts.ecosystemTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="rounded-full border-[var(--vault-gold)]/30 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--vault-gold)]"
                >
                  {tag}
                </Badge>
              ))}
              {data.facts.timestamp ? (
                <span className="ml-auto text-xs text-zinc-500">
                  {timeAgo(data.facts.timestamp)}
                </span>
              ) : null}
            </div>
            <h1 className="mt-4 font-heading text-xl font-semibold leading-snug text-white md:text-2xl">
              {data.facts.summary}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-500">
              {data.facts.feeEth ? (
                <span className="inline-flex items-center gap-1.5">
                  <Fuel className="h-3.5 w-3.5" aria-hidden />
                  Network fee: {data.facts.feeEth} ETH
                  {data.facts.feeUsd != null ? ` (≈ $${data.facts.feeUsd})` : ""}
                </span>
              ) : null}
              {data.facts.blockNumber != null ? (
                <span>Block #{data.facts.blockNumber.toLocaleString("en-US")}</span>
              ) : null}
              <span className="font-mono">{shortAddress(data.facts.hash)}</span>
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
              Who sent what to whom
            </h2>
            <ValueFlow facts={data.facts} />
          </section>

          {data.facts.riskFlags.length > 0 ? (
            <section className="space-y-2">
              {data.facts.riskFlags.map((flag) => (
                <div
                  key={flag.code}
                  className="rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-4 py-3 text-sm text-amber-100/90"
                >
                  {flag.message}
                </div>
              ))}
            </section>
          ) : null}

          <AiExplanation txHash={data.facts.hash} initialExplanation={data.explanation} />

          <NerdModePanel facts={data.facts} />
        </>
      ) : null}
    </div>
  );
}
