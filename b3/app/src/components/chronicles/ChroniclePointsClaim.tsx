import { useCallback, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePointsSiweSign } from "@/hooks/usePointsSiweSign";
import { postCompleteTaskWithSiwe } from "@/lib/points-fns";
import type { CultureChronicle } from "@/content/culture-chronicles";
import { chroniclePointsForEdition } from "@/lib/culture-chronicles-perks";

type Props = {
  chapter: CultureChronicle;
  owned: boolean;
  completedSlugs: string[];
  onClaimed?: () => void;
};

export function ChroniclePointsClaim({ chapter, owned, completedSlugs, onClaimed }: Props) {
  const taskSlug = `chronicle-mint-edition-${chapter.editionId}`;
  const done = completedSlugs.includes(taskSlug);
  const { signSiwe, signing } = usePointsSiweSign();
  const completeTask = useServerFn(postCompleteTaskWithSiwe);
  const [claiming, setClaiming] = useState(false);
  const pts = chroniclePointsForEdition(chapter.editionId);

  const claim = useCallback(async () => {
    setClaiming(true);
    try {
      const signed = await signSiwe();
      if (!signed) {
        toast.error("Sign in with wallet to claim Culture Points.");
        return;
      }
      const result = await completeTask({
        data: { message: signed.prepared, signature: signed.signature, taskSlug },
      });
      if (!result.ok) {
        toast.error(result.error ?? "Could not claim points");
        return;
      }
      toast.success(result.alreadyCompleted ? "Already claimed" : `+${pts} Culture Points`);
      onClaimed?.();
    } finally {
      setClaiming(false);
    }
  }, [completeTask, onClaimed, pts, signSiwe, taskSlug]);

  if (!owned) return null;
  if (done) {
    return (
      <p className="text-center font-mono text-[11px] text-emerald-400">
        +{pts} pts claimed for this chapter
      </p>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full rounded-full border-emerald-500/30 text-emerald-300"
      disabled={claiming || signing}
      onClick={() => void claim()}
    >
      {claiming || signing ? (
        <>
          <Loader2 className="mr-2 inline h-4 w-4 animate-spin" aria-hidden />
          Claiming…
        </>
      ) : (
        `Claim +${pts} Culture Points`
      )}
    </Button>
  );
}
