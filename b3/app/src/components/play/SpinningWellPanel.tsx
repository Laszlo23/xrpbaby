import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import {
  useAccount,
  useChainId,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SevenSegmentDisplay } from "@/components/play/SevenSegmentDisplay";
import { getCultureSpinningWellAddress } from "@/lib/culture-spinning-well";
import { cultureSpinningWellAbi } from "@bc/contracts-sdk";
import { getDefaultChain } from "@/lib/chains";
import { utcCheckInDayIndex } from "@/lib/daily-checkin";
import { postCompleteWellSpin, postPointsBalance } from "@/lib/points-fns";
import { usePointsSiweSign } from "@/hooks/usePointsSiweSign";
import {
  isCircleAroundTarget,
  nextCountdownDigit,
  passiveStopDigit,
  pointsForWellDigit,
  WELL_MAX_DIGIT,
  WELL_TICK_MS,
  type CirclePoint,
} from "@/lib/spinning-well";
import { explorerAddressUrl } from "@/lib/explorer";

type Phase = "ready" | "spinning" | "stopped" | "claiming" | "done";

export function SpinningWellPanel() {
  const contractAddress = getCultureSpinningWellAddress();
  const wantChain = getDefaultChain();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { signSiwe, signing } = usePointsSiweSign();
  const completeWell = useServerFn(postCompleteWellSpin);
  const fetchBalance = useServerFn(postPointsBalance);
  const { writeContractAsync, isPending: txPending } = useWriteContract();

  const [phase, setPhase] = useState<Phase>("ready");
  const [digit, setDigit] = useState(WELL_MAX_DIGIT);
  const [stoppedDigit, setStoppedDigit] = useState<number | null>(null);
  const [circleCaught, setCircleCaught] = useState(false);
  const [ledgerDoneToday, setLedgerDoneToday] = useState(false);
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [claiming, setClaiming] = useState(false);
  const processedHash = useRef<string | null>(null);
  const strokePoints = useRef<CirclePoint[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const digitCenterRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);

  const todayIndex = utcCheckInDayIndex();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const { data: lastDay, refetch: refetchLastDay } = useReadContract({
    address: contractAddress,
    abi: cultureSpinningWellAbi,
    functionName: "lastSpinDay",
    args: address ? [address] : undefined,
    query: { enabled: !!contractAddress && !!address },
  });

  const onChainDoneToday =
    contractAddress !== undefined && lastDay !== undefined && lastDay === todayIndex;

  const refreshLedger = useCallback(async () => {
    if (!address) return;
    try {
      const r = await fetchBalance({ data: { address } });
      if (r.ok) {
        setLedgerDoneToday(r.wellSpinToday === true);
      }
    } catch {
      /* best-effort */
    }
  }, [address, fetchBalance]);

  useEffect(() => {
    void refreshLedger();
  }, [refreshLedger]);

  const stopAt = useCallback((value: number, circled: boolean) => {
    const v = Math.max(1, Math.min(WELL_MAX_DIGIT, value));
    setStoppedDigit(v);
    setCircleCaught(circled);
    setPhase("stopped");
  }, []);

  useEffect(() => {
    if (phase !== "spinning") return;

    const id = window.setInterval(() => {
      setDigit((d) => {
        const next = nextCountdownDigit(d);
        if (next <= 0) {
          window.clearInterval(id);
          stopAt(passiveStopDigit(), false);
          return 0;
        }
        return next;
      });
    }, WELL_TICK_MS);

    return () => window.clearInterval(id);
  }, [phase, stopAt]);

  function startSpin() {
    strokePoints.current = [];
    setStoppedDigit(null);
    setCircleCaught(false);
    setDigit(WELL_MAX_DIGIT);
    setPhase("spinning");
  }

  function canvasPoint(e: ReactPointerEvent<HTMLCanvasElement>): CirclePoint {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function checkCircle() {
    const canvas = canvasRef.current;
    const digitEl = digitCenterRef.current;
    if (!canvas || !digitEl) return;

    const canvasRect = canvas.getBoundingClientRect();
    const digitRect = digitEl.getBoundingClientRect();
    const center: CirclePoint = {
      x: digitRect.left + digitRect.width / 2 - canvasRect.left,
      y: digitRect.top + digitRect.height / 2 - canvasRect.top,
    };

    if (isCircleAroundTarget(strokePoints.current, center) && phase === "spinning") {
      stopAt(digit, true);
    }
  }

  function onPointerDown(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (phase !== "spinning") return;
    drawing.current = true;
    strokePoints.current = [canvasPoint(e)];
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || phase !== "spinning") return;
    strokePoints.current.push(canvasPoint(e));
    checkCircle();
  }

  function onPointerUp(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    drawing.current = false;
    strokePoints.current.push(canvasPoint(e));
    checkCircle();
    strokePoints.current = [];
  }

  const recordWell = useCallback(
    async (opts: { txHash?: `0x${string}`; chainId?: number; value: number }) => {
      setClaiming(true);
      try {
        const signed = await signSiwe();
        if (!signed) return false;

        const res = await completeWell({
          data: {
            message: signed.prepared,
            signature: signed.signature,
            value: opts.value,
            ...(opts.txHash ? { txHash: opts.txHash, chainId: opts.chainId } : {}),
          },
        });

        if (!res.ok) {
          toast.error(res.error ?? "Could not record well spin");
          return false;
        }

        if (res.alreadyCompleted) {
          toast.message("Culture Well already credited today");
        } else {
          toast.success(`+${res.pointsGranted ?? pointsForWellDigit(opts.value)} Culture Points`);
        }

        setLedgerDoneToday(true);
        setPhase("done");
        void refetchLastDay();
        return true;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Sign failed");
        return false;
      } finally {
        setClaiming(false);
      }
    },
    [completeWell, refetchLastDay, signSiwe],
  );

  useEffect(() => {
    if (!isSuccess || !hash || stoppedDigit === null || processedHash.current === hash) return;
    processedHash.current = hash;
    void (async () => {
      const ok = await recordWell({ txHash: hash, chainId: wantChain.id, value: stoppedDigit });
      if (!ok) processedHash.current = null;
      setHash(undefined);
    })();
  }, [hash, isSuccess, recordWell, stoppedDigit, wantChain.id]);

  async function claimOnChain() {
    if (!contractAddress || stoppedDigit === null) return;
    try {
      if (chainId !== wantChain.id) {
        await switchChainAsync({ chainId: wantChain.id });
      }
      setPhase("claiming");
      const h = await writeContractAsync({
        address: contractAddress,
        abi: cultureSpinningWellAbi,
        functionName: "spin",
        args: [stoppedDigit],
      });
      setHash(h);
    } catch (e) {
      setPhase("stopped");
      const msg = e instanceof Error ? e.message : "Transaction failed";
      if (/AlreadySpun|already spun/i.test(msg)) {
        toast.message("Already spun on-chain today (UTC day)");
        void refetchLastDay();
        return;
      }
      toast.error(msg);
    }
  }

  async function claimSiweOnly() {
    if (stoppedDigit === null) return;
    setPhase("claiming");
    await recordWell({ value: stoppedDigit });
  }

  const doneToday = ledgerDoneToday || onChainDoneToday;
  const busy = txPending || confirming || claiming || signing;
  const displayDigit = phase === "spinning" || phase === "ready" ? digit : (stoppedDigit ?? digit);
  const pointsPreview =
    stoppedDigit !== null ? pointsForWellDigit(stoppedDigit) : pointsForWellDigit(digit);

  const explorer = contractAddress && chainId ? explorerAddressUrl(chainId, contractAddress) : null;

  return (
    <section
      id="culture-well"
      className="scroll-mt-24 border-b border-[rgb(0_82_255/20%)] bg-gradient-to-b from-[rgb(0_82_255/8%)] via-black to-black px-4 py-12 md:px-8 md:py-16"
    >
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#C5FF41]">
          Daily turn · once per UTC day
        </p>
        <h2 className="mt-3 font-heading text-2xl font-semibold text-white md:text-3xl">
          Culture Spinning Well
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          Countdown from 33 — draw a circle around the digits to stop high. No circle? Settles at
          1–7. Claim <span className="text-zinc-200">min(digit × 3, 33)</span> Culture Points
          on-chain.
        </p>

        <div className="relative mx-auto mt-8 max-w-md">
          <div
            className="pointer-events-none absolute inset-0 animate-[spin_12s_linear_infinite] rounded-full bg-[radial-gradient(circle,rgb(0_82_255/25%)_0%,transparent_70%)]"
            aria-hidden
          />
          <div className="relative rounded-3xl border border-white/10 bg-black/70 p-6 ring-1 ring-[#C5FF41]/15">
            <div ref={digitCenterRef} className="relative z-10 flex justify-center">
              <SevenSegmentDisplay value={displayDigit} />
            </div>

            {phase === "spinning" ? (
              <canvas
                ref={canvasRef}
                className="absolute inset-0 z-20 h-full w-full cursor-crosshair touch-none rounded-3xl"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
              />
            ) : null}

            <div className="mt-4 space-y-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              <p>
                UTC day <span className="text-[#C5FF41]">{todayIndex.toString()}</span>
                {contractAddress ? (
                  <>
                    {" "}
                    · contract{" "}
                    <a
                      href={explorer ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-300 underline underline-offset-2"
                    >
                      {contractAddress.slice(0, 6)}…{contractAddress.slice(-4)}
                    </a>
                  </>
                ) : (
                  " · contract pending deploy"
                )}
              </p>
              {stoppedDigit !== null ? (
                <p className="text-zinc-400">
                  Stopped at <span className="text-white">{stoppedDigit}</span>
                  {circleCaught ? " · circle catch" : " · passive stop"} →{" "}
                  <span className="text-[#C5FF41]">{pointsPreview} pts</span>
                </p>
              ) : null}
            </div>

            <div className="mt-6 flex flex-col gap-2">
              {!isConnected ? (
                <p className="text-sm text-zinc-500">
                  Connect wallet at the top to play today&apos;s turn.
                </p>
              ) : doneToday || phase === "done" ? (
                <p className="text-sm text-emerald-400/90">
                  Today&apos;s well spin claimed. Come back tomorrow.
                </p>
              ) : phase === "ready" ? (
                <Button
                  type="button"
                  className="rounded-full bg-[#C5FF41] text-black hover:bg-[#C5FF41]/90"
                  onClick={startSpin}
                >
                  Spin the well
                </Button>
              ) : phase === "spinning" ? (
                <p className="text-xs text-zinc-500">
                  Draw a circle around the number to freeze the countdown…
                </p>
              ) : phase === "stopped" ? (
                <Button
                  type="button"
                  className="rounded-full bg-[var(--b3-purple)] text-white"
                  disabled={busy}
                  onClick={() => (contractAddress ? void claimOnChain() : void claimSiweOnly())}
                >
                  {busy ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Claiming…
                    </span>
                  ) : contractAddress ? (
                    `Claim ${pointsPreview} pts on-chain`
                  ) : (
                    `Sign to claim ${pointsPreview} pts`
                  )}
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-zinc-600">
          Also on{" "}
          <Link
            to="/forest"
            className="text-zinc-400 underline underline-offset-2 hover:text-white"
          >
            Forest dashboard
          </Link>
          . Separate from profile daily check-in.
        </p>
      </div>
    </section>
  );
}
