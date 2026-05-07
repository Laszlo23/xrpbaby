import { useEffect, useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { CommunityProfile } from "@/lib/community-profile/types";
import { toast } from "sonner";

function parsePriceEth(raw: string | null | undefined): number | null {
  if (raw == null || raw === "") return null;
  const n = Number.parseFloat(String(raw).replace(/,/g, ""));
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function isEffectivelyFree(price: number | null): boolean {
  return price === null || price === 0;
}

function unlockStorageKey(slug: string): string {
  return `buildchain_contact_unlock_${slug}`;
}

export function getPrimaryEvmAddress(profile: CommunityProfile): string | null {
  const evm = profile.walletLinks?.find((w) => w.chain === "evm");
  return evm?.address ?? null;
}

export function ContactGateway({ profile }: { profile: CommunityProfile }) {
  const [open, setOpen] = useState(false);
  const [confirmedPay, setConfirmedPay] = useState(false);
  const [sessionUnlocked, setSessionUnlocked] = useState(false);

  const enabled = profile.contactEnabled === true;
  const dest = profile.contactDestinationUrl?.trim();
  const intro = profile.contactIntro?.trim();
  const priceEth = parsePriceEth(profile.contactPriceEth);
  const free = isEffectivelyFree(priceEth);
  const payAddress = useMemo(() => getPrimaryEvmAddress(profile), [profile]);

  useEffect(() => {
    if (!open || typeof sessionStorage === "undefined") return;
    setSessionUnlocked(sessionStorage.getItem(unlockStorageKey(profile.slug)) === "1");
    setConfirmedPay(false);
  }, [open, profile.slug]);

  if (!enabled || !dest) {
    return null;
  }

  function persistUnlock() {
    try {
      sessionStorage.setItem(unlockStorageKey(profile.slug), "1");
      setSessionUnlocked(true);
    } catch {
      /* ignore */
    }
  }

  function openDestination() {
    window.open(dest, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <section className="rounded-3xl border border-[var(--b3-purple)]/25 bg-[var(--b3-purple)]/[0.06] px-5 py-5 md:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-500">
              Contact
            </p>
            <h3 className="font-heading text-lg font-semibold text-white">
              Direct message gateway
            </h3>
            {intro ? (
              <p className="text-sm leading-relaxed text-zinc-400">{intro}</p>
            ) : (
              <p className="text-sm text-zinc-500">
                {free
                  ? "Reach out directly — no fee."
                  : `Set your price — ${priceEth} ETH to unlock this contact link (viewer confirms payment).`}
              </p>
            )}
          </div>
          <Button
            type="button"
            className="shrink-0 rounded-full bg-[var(--b3-purple)] px-6 text-white hover:bg-[var(--base-blue-hover)]"
            onClick={() => setOpen(true)}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            {free ? "Contact" : `Contact · ${priceEth} ETH`}
          </Button>
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass border-white/[0.08] sm:max-w-md sm:rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {free ? "Contact" : `Contact (${priceEth} ETH)`}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              {free
                ? "Opens the link they set (Warpcast DM, email, calendar, Telegram, etc.)."
                : "Send ETH to their verified primary wallet, confirm below, then open their contact link. Unlock is remembered on this device."}
            </DialogDescription>
          </DialogHeader>

          {free ? (
            <DialogFooter className="gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="rounded-full bg-[var(--b3-purple)] text-white"
                onClick={() => {
                  openDestination();
                  setOpen(false);
                }}
              >
                Open contact link
              </Button>
            </DialogFooter>
          ) : (
            <div className="space-y-4 py-2">
              {!payAddress ? (
                <p className="text-sm text-amber-400/95">
                  No verified EVM wallet on this profile — add a primary wallet before offering a
                  paid gateway.
                </p>
              ) : sessionUnlocked ? (
                <p className="text-sm text-zinc-400">Already unlocked on this device.</p>
              ) : (
                <>
                  <div className="space-y-2 rounded-2xl border border-white/[0.06] bg-black/30 px-4 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      Send {priceEth} ETH to
                    </p>
                    <p className="font-mono text-xs text-zinc-200 break-all">{payAddress}</p>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="rounded-full"
                      onClick={async () => {
                        await navigator.clipboard.writeText(payAddress);
                        toast.message("Address copied");
                      }}
                    >
                      Copy address
                    </Button>
                  </div>
                  <label className="flex cursor-pointer items-start gap-3 text-sm text-zinc-300">
                    <Checkbox
                      checked={confirmedPay}
                      onCheckedChange={(v) => setConfirmedPay(v === true)}
                      className="mt-0.5"
                    />
                    <span>
                      I sent {priceEth} ETH to this address (same chain as their profile).
                    </span>
                  </label>
                </>
              )}
              <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setOpen(false)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  disabled={!payAddress || (!sessionUnlocked && !confirmedPay)}
                  className="rounded-full bg-[var(--b3-purple)] text-white disabled:opacity-40"
                  onClick={() => {
                    if (!payAddress) return;
                    if (sessionUnlocked) {
                      openDestination();
                      setOpen(false);
                      return;
                    }
                    if (!confirmedPay) return;
                    persistUnlock();
                    toast.success("Unlocked on this device.");
                    openDestination();
                    setOpen(false);
                  }}
                >
                  Open contact link
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
