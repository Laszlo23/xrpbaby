import { CalendarCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { DailyOnChainCheckIn } from "@/components/DailyOnChainCheckIn";
import { usePointsSiweSign } from "@/hooks/usePointsSiweSign";

type Props = {
  onBalanceRefresh?: () => void;
};

export function ForestDailyCard({ onBalanceRefresh }: Props) {
  const { signSiwe, signing } = usePointsSiweSign();

  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C5FF41]/15">
          <CalendarCheck className="h-5 w-5 text-[#C5FF41]" />
        </div>
        <div>
          <p className="font-display text-base font-semibold text-white">Daily check-in</p>
          <p className="mt-1 text-xs text-zinc-400">Up to 20 pts · stamp once per UTC day</p>
        </div>
      </div>
      <div className="mt-4 flex-1">
        <DailyOnChainCheckIn
          signSiwe={signSiwe}
          signingDisabled={signing}
          onBalance={() => onBalanceRefresh?.()}
          compact
        />
      </div>
      <p className="mt-4 border-t border-white/10 pt-4 text-xs text-zinc-500">
        <Link
          to="/play"
          hash="culture-well"
          className="text-[#C5FF41] underline underline-offset-2 hover:text-[#C5FF41]/80"
        >
          Play today&apos;s spin on /play
        </Link>{" "}
        for the Culture Spinning Well (separate daily reward).
      </p>
    </div>
  );
}
