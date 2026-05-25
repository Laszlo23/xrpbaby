import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { MarketingShell } from "@/components/MarketingShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ITEMS: { q: string; a: ReactNode }[] = [
  {
    q: "Which URL should I use?",
    a: (
      <>
        Use{" "}
        <strong className="font-medium text-zinc-300">app.buildingcultureid.space</strong> for
        everything in one place: the story at <Link to="/" className="text-zinc-200 underline">/</Link>
        , drops at <Link to="/play" className="text-zinc-200 underline">/play</Link>, your pass at{" "}
        <Link to="/join" className="text-zinc-200 underline">/join</Link>, and your hub at{" "}
        <Link to="/forest" className="text-zinc-200 underline">/forest</Link>. Legacy{" "}
        <strong className="font-medium text-zinc-300">0x</strong> and{" "}
        <strong className="font-medium text-zinc-300">app.buildingculture.capital</strong> hosts
        redirect here during cutover. Brand sites like buildingculture.capital stay separate.
      </>
    ),
  },
  {
    q: "What is Building Culture Dollar (BCD)?",
    a: "BCD is the app’s economic layer—a narrative and wallet balance you stack toward drops. Ticket rows show “≈ X BCD” using a fixed display rate from env until campaigns price tickets directly in BCD.",
  },
  {
    q: "Do I pay for tickets in BCD today?",
    a: "Not yet on-chain. The live raffle contract settles each mint in the chain’s native gas token (e.g. ETH on B3). The UI leads with BCD as the pricing story and spells out ETH settlement so expectations stay honest until a BCD-invoice raffle ships.",
  },
  {
    q: "Where is the Building Culture mission and genesis claim?",
    a: (
      <>
        See{" "}
        <Link to="/mission" className="text-zinc-200 underline underline-offset-2 hover:text-white">
          Mission (BCD)
        </Link>
        —that page explains the treasury narrative, roadmap (including future on-chain DAO votes),
        and hosts the merkle genesis card when{" "}
        <span className="font-mono text-zinc-400">VITE_BCD_GENESIS_CLAIM_ADDRESS</span> is
        configured. Proofs can come from your hosted JSON pack or be pasted for testing.
      </>
    ),
  },
  {
    q: "Does buying or claiming BCD guarantee profit or access to specific assets?",
    a: "No guarantees. Genesis/fee mechanics may be regulated in your jurisdiction—get counsel before running large paid campaigns. Drops and experiences have their own rules; BCD is framed as culture coordination and access storytelling, not an investment product.",
  },
  {
    q: "What is BUILDCHAIN, in one breath?",
    a: "A playground where minted tickets can unlock real stays, art, and experiences—with quests and XP so the grind between drops still feels good.",
  },
  {
    q: "How do drops actually work?",
    a: "Each card spells out what’s on offer. When a live raffle contract is wired up, minting and draws follow the rules in code—always read that campaign before you buy tickets.",
  },
  {
    q: "Do I need a crypto wallet?",
    a: "To mint on live campaigns, yes—connect a supported wallet. Demo drops let you poke around the UI even without a deployed contract.",
  },
  {
    q: "Where are Terms & Privacy?",
    a: (
      <>
        Footer → Legal:{" "}
        <Link
          to="/legal/terms"
          className="text-zinc-200 underline underline-offset-2 hover:text-white"
        >
          Terms
        </Link>
        ,{" "}
        <Link
          to="/legal/privacy"
          className="text-zinc-200 underline underline-offset-2 hover:text-white"
        >
          Privacy
        </Link>
        , imprint, cookies. Replace placeholder legal text with counsel-reviewed copy before you
        ship for real.
      </>
    ),
  },
  {
    q: "Is this investment advice?",
    a: "No. Crypto and games involve risk—nothing here is investment, tax, or legal advice. Play what you can afford to lose.",
  },
];

export const Route = createFileRoute("/faq")({
  head: () =>
    pageHead({
      title: "FAQ",
      description:
        "Straight answers on BUILDCHAIN drops, wallets, Base network, and real-world prize fulfillment.",
      path: "/faq",
      keywords: ["BUILDCHAIN", "FAQ", "wallet", "drops", "Base"],
    }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <MarketingShell
      eyebrow="Straight answers"
      tone="cyan"
      title={
        <>
          FAQ—{" "}
          <span className="bg-gradient-to-r from-cyan-100/95 via-white to-cyan-200/80 bg-clip-text text-transparent">
            no jargon wall
          </span>
        </>
      }
      subtitle="Quick clarity on wallets, drops, and where to read the serious stuff. Still unsure? Start at the drops section and click around—the UI is meant to be playable."
      heroSize="hero"
    >
      <Accordion
        type="single"
        collapsible
        className="w-full overflow-hidden rounded-2xl border border-white/[0.1] bg-white/[0.03] px-2 shadow-[inset_0_1px_0_rgb(255_255_255/0.05)] md:px-4"
      >
        {ITEMS.map((item, i) => (
          <AccordionItem key={item.q} value={`item-${i}`} className="border-white/[0.06] px-2">
            <AccordionTrigger className="py-5 text-left text-[15px] font-medium text-zinc-100 hover:no-underline md:text-base">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="pb-5 text-[15px] leading-relaxed text-zinc-500">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </MarketingShell>
  );
}
