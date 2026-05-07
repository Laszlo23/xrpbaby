import type { LucideIcon } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { MarketingShell } from "@/components/MarketingShell";
import { Button } from "@/components/ui/button";
import { Gem, Sparkles, Ticket, Vote, Percent, Clock } from "lucide-react";
import {
  getGenesisDistrictHeroImageUrl,
  getGenesisVaultPassTierImageUrl,
} from "@/lib/genesis-district-config";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { GenesisVaultMintPanel } from "@/components/GenesisVaultMintPanel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/genesis-district")({
  head: () =>
    pageHead({
      title: "Genesis vault pass — Phase 0",
      description:
        "Unlock early vault access with the Genesis vault pass — three on-chain tiers on Base. Not financial advice.",
      path: "/genesis-district",
      keywords: ["Build Culture", "Genesis vault pass", "NFT", "Base", "access"],
    }),
  component: GenesisDistrictPage,
});

const STORY_LINES = [
  "genesis district — phase 0",
  "",
  "before the world was built, there was one block.",
  "",
  "a place where ownership wasn’t promised — it was tested.",
  "where systems weren’t trusted — they were verified.",
  "where culture wasn’t consumed — it was created.",
  "",
  "this is that moment.",
  "",
  "the first district on-chain.",
  "the first signal.",
  "the first proof that real-world assets can live inside a game — and still matter outside of it.",
  "",
  "hold this, and you’re not early.",
  "you’re origin.",
];

function GenesisDistrictPage() {
  const heroImageUrl = getGenesisDistrictHeroImageUrl();
  const cardArt = getGenesisVaultPassTierImageUrl("phase0");
  return (
    <MarketingShell
      eyebrow="Access key · not a poster"
      tone="cyan"
      heroSize="compact"
      articleClassName="max-w-4xl"
      title={
        <>
          Genesis vault pass —{" "}
          <span className="bg-gradient-to-r from-emerald-200 via-white to-[rgb(0_82_255/90%)] bg-clip-text text-transparent">
            Phase 0
          </span>
        </>
      }
      subtitle="Position before the vault opens wide: three ERC-721 tiers on Base, framed as a pass — metadata carries perks; the image stays clean for marketplaces."
      actions={
        <>
          <a href="#unlock-vault">
            <span className="inline-flex items-center justify-center rounded-full bg-[var(--b3-purple)] px-6 py-3 text-sm font-medium text-white shadow-[0_0_44px_-6px_rgb(0_82_255/85%)] ring-1 ring-white/10 transition hover:bg-[var(--base-blue-hover)] active:scale-[0.98]">
              Unlock vault access
            </span>
          </a>
          <Link to="/profile">
            <span className="inline-flex items-center justify-center rounded-full border border-white/18 bg-white/[0.06] px-6 py-3 text-sm font-medium text-zinc-100 backdrop-blur-md transition hover:border-white/28 hover:bg-white/[0.1] active:scale-[0.98]">
              Profile badge
            </span>
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-12 md:gap-16">
        <section className="flex flex-col items-center gap-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
            Collectible preview · same layout, tier variants at mint
          </p>
          <div className="relative w-full max-w-[380px] px-2">
            <div
              className="absolute -inset-0.5 rounded-[1.35rem] bg-gradient-to-br from-[rgb(212_175_55/0.45)] via-[rgb(0_82_255/0.15)] to-transparent opacity-80 blur-md"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-3xl border-2 border-[rgb(212_175_55/0.35)] bg-black shadow-[0_0_48px_-8px_rgb(212_175_55/0.45)] ring-1 ring-white/15">
              <div className="relative w-full">
                <img
                  src={cardArt}
                  alt={`${BRAND_DISPLAY_NAME} Genesis vault pass visual`}
                  className="w-full max-h-[min(85vh,720px)] object-contain object-center"
                  loading="eager"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/75 to-transparent px-4 pb-5 pt-20">
                  <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[var(--vault-gold)]">
                    Genesis vault pass
                  </p>
                  <p className="mt-1 font-heading text-xl font-semibold text-white">Phase 0</p>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    This is ownable access — not a landing hero.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <a
            href={heroImageUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-zinc-500 underline-offset-4 hover:text-zinc-300"
          >
            Open full artwork source
          </a>
        </section>

        <div id="unlock-vault" className="scroll-mt-24">
          <GenesisVaultMintPanel />
        </div>

        <section className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 md:p-8">
          <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">At a glance</h2>
          <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-zinc-400 marker:text-zinc-600">
            <li>
              <strong className="font-medium text-zinc-200">What it is:</strong> on-chain pass
              (three contracts = three scarcity tiers).
            </li>
            <li>
              <strong className="font-medium text-zinc-200">Why metadata matters:</strong> perks,
              tier, and links — keep images minimal for previews.
            </li>
            <li>
              <strong className="font-medium text-zinc-200">In-app:</strong> profile badge + daily
              XP uplift by tier on{" "}
              <Link to="/profile" className="text-zinc-300 underline underline-offset-2">
                Profile
              </Link>
              .
            </li>
          </ul>
        </section>

        <Accordion
          type="multiple"
          className="rounded-3xl border border-white/[0.08] bg-black/25 px-4"
        >
          <AccordionItem value="story">
            <AccordionTrigger className="font-heading text-lg text-white hover:no-underline">
              Full story
            </AccordionTrigger>
            <AccordionContent>
              <div className="whitespace-pre-line pb-4 font-mono text-sm leading-relaxed text-zinc-400 md:text-[15px]">
                {STORY_LINES.join("\n")}
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="utility">
            <AccordionTrigger className="font-heading text-lg text-white hover:no-underline">
              Utility (wired + planned)
            </AccordionTrigger>
            <AccordionContent>
              <p className="pb-4 text-sm text-zinc-500">
                Wire <span className="font-mono text-zinc-400">VITE_GENESIS_VAULT_PASS_PHASE*</span>{" "}
                after deploy. Holder badge + tier XP on Profile today; drops and premium gates are
                product decisions.
              </p>
              <div className="grid gap-4 pb-4 md:grid-cols-2">
                <UtilityCard
                  icon={Gem}
                  title="Tier badge + XP"
                  status="In-app today"
                  body="Highest tier sets your pill; daily claim adds +20 / +12 / +6 XP by tier."
                />
                <UtilityCard
                  icon={Sparkles}
                  title="Early vault framing"
                  status="UX"
                  body="Hero and vault sections can surface hints for non-holders — no hard paywall on public content."
                />
                <UtilityCard
                  icon={Percent}
                  title="Pricing hooks"
                  status="Contract / product"
                  body="Future −% or allowlist requires sale contracts or snapshots — not enforced here yet."
                />
                <UtilityCard
                  icon={Clock}
                  title="Early drops"
                  status="Go-to-market"
                  body="Announce early windows; optional merkle or subgraph snapshots later."
                />
                <UtilityCard
                  icon={Ticket}
                  title="Extra ticket weight"
                  status="Future"
                  body="Raffle contract or off-chain rules — separate upgrade."
                />
                <UtilityCard
                  icon={Vote}
                  title="Governance"
                  status="Future"
                  body="Narrative alignment until a DAO framework ships."
                />
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="mint">
            <AccordionTrigger className="font-heading text-lg text-white hover:no-underline">
              Mint strategy (guidance)
            </AccordionTrigger>
            <AccordionContent>
              <ul className="list-inside list-disc space-y-2 pb-4 text-sm text-amber-100/85 marker:text-amber-600">
                <li>
                  <strong className="font-medium text-amber-50">Supply:</strong> defaults 333 / 777
                  / 1500 in deploy script — tune per launch.
                </li>
                <li>
                  <strong className="font-medium text-amber-50">Positioning:</strong> sell access,
                  not “buy jpeg.”
                </li>
                <li>
                  <strong className="font-medium text-amber-50">Distribution:</strong> Farcaster +
                  in-app mint beats noise-only social.
                </li>
              </ul>
              <p className="pb-4 text-xs text-amber-200/70">
                Not financial advice. Token sales may be regulated where you operate — get counsel
                before publishing a mint.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="metadata">
            <AccordionTrigger className="font-heading text-lg text-white hover:no-underline">
              Metadata examples
            </AccordionTrigger>
            <AccordionContent>
              <p className="pb-4 text-sm text-zinc-500">
                Short marketplace copy lives in JSON per tier. Examples in{" "}
                <a
                  href="/genesis-vault-pass-phase0-metadata.example.json"
                  className="text-zinc-300 underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  phase0
                </a>
                ,{" "}
                <a
                  href="/genesis-vault-pass-phase1-metadata.example.json"
                  className="text-zinc-300 underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  phase1
                </a>
                ,{" "}
                <a
                  href="/genesis-vault-pass-phase2-metadata.example.json"
                  className="text-zinc-300 underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  phase2
                </a>
                . Images: host tier variants (glow / color) on your CDN or IPFS.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <section className="flex flex-wrap gap-3">
          <Button variant="secondary" className="rounded-full" asChild>
            <Link to="/mission">Mission (BCD)</Link>
          </Button>
          <Button variant="outline" className="rounded-full" asChild>
            <Link to="/faq">FAQ</Link>
          </Button>
          <Button variant="outline" className="rounded-full" asChild>
            <Link to="/investors">Investor overview</Link>
          </Button>
        </section>
      </div>
    </MarketingShell>
  );
}

function UtilityCard({
  icon: Icon,
  title,
  status,
  body,
}: {
  icon: LucideIcon;
  title: string;
  status: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-black/30 p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05]">
          <Icon className="h-5 w-5 text-emerald-300/90" aria-hidden />
        </span>
        <div>
          <h3 className="font-heading text-base font-semibold text-white">{title}</h3>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            {status}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">{body}</p>
        </div>
      </div>
    </div>
  );
}
