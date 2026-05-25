import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { useMemo } from "react";
import { useAccount } from "wagmi";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Coins,
  HeartHandshake,
  Layers,
  Map,
  Rocket,
  Scale,
  Sparkles,
  Target,
  Users,
  Vote,
  Wallet,
} from "lucide-react";
import { MarketingShell } from "@/components/MarketingShell";
import { MissionGenesisClaim } from "@/components/MissionGenesisClaim";
import { PointsLedgerSection } from "@/components/PointsLedgerSection";
import { Button } from "@/components/ui/button";
import { useAiCoach } from "@/contexts/AiCoachContext";
import { useBcdEconomy } from "@/contexts/BcdEconomyContext";
import { BCD_SYMBOL, getBcdGenesisClaimAddress, getBcdTokenAddress } from "@/lib/bcd-config";
import { loadProgress } from "@/lib/playerProgress";
import { MissionDeployedContracts } from "@/components/MissionDeployedContracts";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";

export const Route = createFileRoute("/mission")({
  head: () =>
    pageHead({
      title: "Mission — Building Culture Dollar",
      description:
        "Building Culture DAO mission: genesis BCD, honest drops UX, treasury programs — on-chain first, DAO voting next.",
      path: "/mission",
      keywords: ["Building Culture Dollar", "BCD", "DAO", "mission", "BUILDCHAIN"],
    }),
  component: MissionPage,
});

function MissionPage() {
  const { isConnected } = useAccount();
  const { openCoach } = useAiCoach();
  const { openGetBcd } = useBcdEconomy();
  const genesis = getBcdGenesisClaimAddress();
  const token = getBcdTokenAddress();

  const { address } = useAccount();
  const checklist = useMemo(() => {
    const p = address ? loadProgress(address) : null;
    return {
      wallet: isConnected,
      pulseCoach: Boolean(p?.bcdTutorialSeen),
      genesisLive: !!genesis && !!token,
      tokenConfigured: !!token,
      genesisClaimed: p?.questsCompleted.includes("bcd_genesis_claimed") ?? false,
    };
  }, [address, genesis, token, isConnected]);

  function row(
    ok: boolean,
    label: string,
    hint: string,
    action?: { label: string; onClick: () => void },
  ) {
    return (
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="mt-0.5 shrink-0 text-neon">
            {ok ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Circle className="h-5 w-5 text-zinc-600" />
            )}
          </span>
          <div>
            <p className={`font-medium ${ok ? "text-zinc-200" : "text-zinc-400"}`}>{label}</p>
            <p className="mt-1 text-sm text-zinc-600">{hint}</p>
          </div>
        </div>
        {action ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="shrink-0 rounded-full"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <MarketingShell
      eyebrow="Building Culture"
      tone="purple"
      heroSize="hero"
      articleClassName="max-w-6xl w-full [&_a]:no-underline"
      title={
        <>
          Owning culture—{" "}
          <span className="bg-gradient-to-r from-amber-100/95 via-white to-neon bg-clip-text text-transparent">
            {BCD_SYMBOL}
          </span>{" "}
          genesis &amp; the path to DAO votes
        </>
      }
      subtitle="Fair drops stay verifiable while we grow a treasury that funds real venues, art, and travel—BCD aligns builders, patrons, and the communities we enter together."
      actions={
        <>
          <Link to="/forest" className="text-neon underline">
            <span className="inline-flex items-center justify-center rounded-full bg-[var(--b3-purple)] px-7 py-3 text-sm font-medium text-white shadow-[0_0_44px_-6px_rgb(0_82_255/85%)] ring-1 ring-white/10 transition hover:bg-[var(--base-blue-hover)] active:scale-[0.98]">
              Community pulse
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </span>
          </Link>
          <Link to="/faq">
            <span className="inline-flex items-center justify-center rounded-full border border-white/18 bg-white/[0.06] px-7 py-3 text-sm font-medium text-zinc-100 backdrop-blur-md transition hover:border-white/28 hover:bg-white/[0.1]">
              Read disclaimers
            </span>
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-16 md:gap-20">
        <section className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 md:p-10">
          <div className="flex items-start gap-3">
            <Target className="mt-1 h-6 w-6 shrink-0 text-emerald" aria-hidden />
            <div className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
                North star
              </h2>
              <p className="text-zinc-400">
                {BRAND_DISPLAY_NAME} proves the receipts for culture: tickets, treasury flow, and an
                app layer that respects what collectors care about—not hidden odds. Building Culture
                Dollar (BCD) is the treasury-aligned token brand for this loop: genesis first,
                programmatic culture second, DAO voting wired when the legal and custody model is
                intentional—not rushed.
              </p>
              <p className="text-zinc-400">
                We monetize ethically the same places real platforms do—primary fees, treasury
                programs, and sponsored experiences—without turning every drop into undisclosed
                brokerage.
              </p>
            </div>
          </div>
        </section>

        <MissionDeployedContracts />

        <PointsLedgerSection />

        <section>
          <h2 className="font-heading mb-8 flex items-center gap-2 text-xl font-semibold text-white md:text-2xl">
            <Scale className="h-6 w-6 text-zinc-500" aria-hidden />
            Token honesty (today)
          </h2>
          <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-white/[0.04] font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                <tr>
                  <th className="border-b border-white/[0.06] px-4 py-3">Topic</th>
                  <th className="border-b border-white/[0.06] px-4 py-3">Today</th>
                  <th className="border-b border-white/[0.06] px-4 py-3">Phase next</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400">
                <tr>
                  <td className="border-b border-white/[0.06] px-4 py-3 font-medium text-zinc-200">
                    Raffle tickets
                  </td>
                  <td className="border-b border-white/[0.06] px-4 py-3">
                    Paid in native gas token during legacy campaigns
                  </td>
                  <td className="border-b border-white/[0.06] px-4 py-3">
                    Dedicated raffle accepting BCD via allowance
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-white/[0.06] px-4 py-3 font-medium text-zinc-200">
                    {BCD_SYMBOL} display
                  </td>
                  <td className="border-b border-white/[0.06] px-4 py-3">
                    ≈ conversions for clarity (env ratio)
                  </td>
                  <td className="border-b border-white/[0.06] px-4 py-3">
                    Denominated ticketing + treasury metering
                  </td>
                </tr>
                <tr>
                  <td className="border-b border-white/[0.06] px-4 py-3 font-medium text-zinc-200">
                    DAO governance
                  </td>
                  <td className="border-b border-white/[0.06] px-4 py-3">
                    Product + treasury execution (planned)
                  </td>
                  <td className="border-b border-white/[0.06] px-4 py-3">
                    Votes + timelocked execution on-chain
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[13px] text-zinc-600">
            No guaranteed returns—BCD is a coordination &amp; access layer, not a promise of
            profits. Regulatory treatment depends on how you distribute and communicate;{" "}
            <Link to="/legal/terms" className="text-zinc-400 underline-offset-4 hover:text-white">
              legal
            </Link>{" "}
            placeholders must become counsel-reviewed before large paid genesis waves.
          </p>
        </section>

        <section>
          <h2 className="font-heading mb-8 flex items-center gap-2 text-xl font-semibold text-white md:text-2xl">
            <Map className="h-6 w-6 text-cyan-400/90" aria-hidden />
            Roadmap rails
          </h2>
          <ol className="grid gap-5 md:grid-cols-2">
            {[
              {
                icon: Coins,
                title: "BCD genesis",
                body: "Merkle claim + treasury fee optional; proofs hosted or pasted for controlled cohorts.",
              },
              {
                icon: Layers,
                title: "Treasury culture programs",
                body: `${BCD_SYMBOL}-first perks, experiences placements, leaderboard affinity—everything auditable.`,
              },
              {
                icon: Rocket,
                title: "Sustainable rake",
                body: "Platform fees on sanctioned drops, patron packages, infra—not hidden vig on players.",
              },
              {
                icon: Vote,
                title: "DAO voting module",
                body: `${BCD_SYMBOL}-weighted votes on curated decisions once counsel + custody roadmap say go.`,
              },
            ].map((item, idx) => (
              <li
                key={item.title}
                className="flex gap-4 rounded-2xl border border-white/[0.08] bg-black/30 px-5 py-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]"
              >
                <span className="font-mono text-xs text-zinc-600">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-neon" aria-hidden />
                <div>
                  <p className="font-heading font-semibold text-zinc-100">{item.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <MissionGenesisClaim />

        <section>
          <h2 className="font-heading mb-6 flex items-center gap-2 text-xl font-semibold text-white md:text-2xl">
            <Sparkles className="h-6 w-6 text-amber-300" aria-hidden />
            Your mission checklist
          </h2>
          <div className="flex flex-col gap-3">
            {row(
              checklist.wallet,
              "Connect wallet",
              "Required for proofs, claims, and on-chain badges.",
              undefined,
            )}
            {!checklist.wallet ? null : (
              <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-4">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className="mt-0.5 shrink-0 text-neon">
                    {checklist.pulseCoach ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5 text-zinc-600" />
                    )}
                  </span>
                  <div>
                    <p className="font-medium text-zinc-200">Economy tools</p>
                    <p className="mt-1 text-sm text-zinc-600">
                      Use Get BCD for the primer; Pulse Coach explains drops, XP, and settlement
                      honesty.
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="rounded-full"
                    onClick={openGetBcd}
                  >
                    Get BCD
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="rounded-full"
                    onClick={openCoach}
                  >
                    Pulse Coach
                  </Button>
                </div>
              </div>
            )}
            {row(
              checklist.genesisLive,
              `${BCD_SYMBOL} contracts wired`,
              genesis && token
                ? "Genesis + token env addresses set."
                : "Deploy + set genesis + token env.",
            )}
            {checklist.genesisLive && checklist.wallet && !checklist.genesisClaimed && address
              ? row(
                  false,
                  `Claim genesis ${BCD_SYMBOL}`,
                  `Use the genesis card above for wallet ${address.slice(0, 6)}…`,
                )
              : null}
            {checklist.wallet && checklist.genesisClaimed
              ? row(
                  true,
                  "Genesis claimed (local badge)",
                  "+75 XP queued if you landed the chain tx from this UI.",
                )
              : null}
            {row(
              checklist.tokenConfigured,
              "Live balance reads",
              token ? `${BCD_SYMBOL} token wired for wallets.` : "Add VITE_BCD_TOKEN_ADDRESS",
            )}
          </div>
        </section>

        <section>
          <h2 className="font-heading mb-6 flex items-center gap-2 text-xl font-semibold text-white md:text-2xl">
            <HeartHandshake className="h-6 w-6 text-rose-300/90" aria-hidden />
            Ecosystem map
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                to: "/",
                hash: "drops" as const,
                label: "Drops",
                Icon: Layers,
                desc: "Raffle tickets toward real venues & art.",
              },
              {
                to: "/experiences",
                label: "Experiences",
                Icon: Sparkles,
                desc: "Culture-forward spotlight programming.",
              },
              {
                to: "/profile",
                label: "Profile & quests",
                Icon: Wallet,
                desc: "XP, builder identity, quests.",
              },
              {
                to: "/leaderboard",
                label: "Leaderboard",
                Icon: Users,
                desc: "Climb ranks; surface culture crew.",
              },
            ].map(({ to, hash, label, Icon, desc }) => (
              <Link
                key={label}
                to={to}
                {...(hash ? { hash } : {})}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 transition hover:border-white/[0.14] hover:bg-white/[0.04]"
              >
                <Icon className="h-5 w-5 text-neon" aria-hidden />
                <p className="mt-3 font-heading font-semibold text-zinc-100">{label}</p>
                <p className="mt-2 text-[13px] leading-snug text-zinc-600">{desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-black/40 to-[rgb(40_18_72/0.45)] p-6 md:p-8">
          <h3 className="font-heading flex items-center gap-2 text-lg font-semibold text-white">
            Monetization that fits the treasury
          </h3>
          <ul className="mt-4 grid gap-3 text-sm leading-relaxed text-zinc-400 md:grid-cols-2">
            <li>Optional native fee on genesis claim (already in contract).</li>
            <li>Future sanctioned drop fees / sponsor tiers (off-chain + on-chain metering).</li>
            <li>
              Patron memberships &amp; culture packages priced transparently—not hidden margins.
            </li>
            <li>
              Infra monetization where it doesn’t degrade trust (Pulse Coach quotas, infra keys).
            </li>
          </ul>
        </section>

        <p className="text-center font-mono text-[11px] text-zinc-600">
          Council review before marketing paid allocation waves. Drops remain fun; legal stays
          sober.
        </p>
      </div>
    </MarketingShell>
  );
}
