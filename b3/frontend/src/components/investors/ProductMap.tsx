import { AppWindow, Landmark, Joystick } from "lucide-react";

const CARD =
  "rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 transition hover:border-white/[0.12] hover:bg-white/[0.05]";

export function ProductMap() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      <div className={CARD}>
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10">
          <Landmark className="h-5 w-5 text-amber-200/90" aria-hidden />
        </div>
        <h3 className="font-heading text-lg font-semibold text-white">buildingculture.capital</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          Umbrella brand for on-chain culture and savings-club positioning—treasury narrative,
          compliance-conscious rollout, and room for ecosystem partnerships.
        </p>
        <a
          href="https://buildingculture.capital/"
          target="_blank"
          rel="noreferrer noopener"
          className="mt-4 inline-flex text-sm font-medium text-zinc-200 underline-offset-4 hover:text-white"
        >
          Visit site ↗
        </a>
      </div>

      <div className={CARD}>
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10">
          <AppWindow className="h-5 w-5 text-emerald-200/90" aria-hidden />
        </div>
        <h3 className="font-heading text-lg font-semibold text-white">App</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          Primary product surface: wallet, marketplace, missions, XP / points ledger, community
          profile, and experiments such as x402-protected APIs—where players actually stack BCD
          story and receipts.
        </p>
        <a
          href="https://app.buildingculture.capital/"
          target="_blank"
          rel="noreferrer noopener"
          className="mt-4 inline-flex text-sm font-medium text-zinc-200 underline-offset-4 hover:text-white"
        >
          app.buildingculture.capital ↗
        </a>
      </div>

      <div className={CARD}>
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[rgb(0_82_255/30%)] bg-[rgb(0_82_255/12%)]">
          <Joystick className="h-5 w-5 text-neon" aria-hidden />
        </div>
        <h3 className="font-heading text-lg font-semibold text-white">Game</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          BUILDCHAIN loop: fair raffle tickets for real-world assets, drops, leaderboard, and
          campaigns—designed so odds and settlement stay inspectable on-chain.
        </p>
        <a
          href="https://game.buildingculture.capital/"
          target="_blank"
          rel="noreferrer noopener"
          className="mt-4 inline-flex text-sm font-medium text-zinc-200 underline-offset-4 hover:text-white"
        >
          game.buildingculture.capital ↗
        </a>
      </div>
    </div>
  );
}
