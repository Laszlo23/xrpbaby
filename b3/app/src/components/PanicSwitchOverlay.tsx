import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatUnits } from "viem";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { useAccount } from "wagmi";
import { usePointsSiweSign } from "@/hooks/usePointsSiweSign";
import { BCC_SYMBOL } from "@/lib/bcc-config";
import { capturePanicSwitchEvent } from "@/lib/analytics";
import { postClaimPanicSwitchBccReward, postClaimPanicSwitchVoucherNft } from "@/lib/points-fns";
import {
  clearPanicSwitchState,
  createInitialPanicSwitchState,
  defaultPanicSwitchConfig,
  derivePanicSwitchState,
  loadPanicSwitchState,
  markPanicSwitchRiddleClaimed,
  panicSwitchPrecisionScore,
  pressPanicSwitch,
  recordPanicSwitchRiddleAttempt,
  restartPanicSwitch,
  savePanicSwitchState,
  tickPanicSwitch,
  type PanicRiddleClue,
  type PanicSwitchConfig,
  type PanicSwitchEvent,
  type PanicSwitchState,
} from "@/lib/panic-switch";

type SceneFrame = {
  title: string;
  subtitle: string;
  frameClassName: string;
  quote: string;
};

type StoryBeat = {
  chapter: string;
  chapterHook: string;
  triggerPrep: string;
  triggerLive: string;
  activeBridge: string;
  enduranceBridge: string;
};

const sceneFrames: SceneFrame[] = [
  {
    title: "Neon Reactor",
    subtitle: "Core pressure climbing",
    frameClassName:
      "from-fuchsia-500/30 via-[#140026]/80 to-cyan-500/20 border-fuchsia-300/40 text-fuchsia-100",
    quote: "Pressure does not break legends, it reveals them.",
  },
  {
    title: "Forest Siren",
    subtitle: "Roots under stress",
    frameClassName:
      "from-emerald-500/30 via-[#05140d]/80 to-lime-400/20 border-emerald-300/40 text-emerald-100",
    quote: "When the wind is loud, the roots remember who they are.",
  },
  {
    title: "City Grid",
    subtitle: "District voltage unstable",
    frameClassName:
      "from-cyan-500/25 via-[#04111a]/80 to-blue-500/25 border-cyan-300/40 text-cyan-100",
    quote: "Every second you hold the line, the city learns to breathe again.",
  },
  {
    title: "Vault Echo",
    subtitle: "Containment almost lost",
    frameClassName:
      "from-amber-500/25 via-[#1a1204]/80 to-rose-500/20 border-amber-300/40 text-amber-100",
    quote: "Discipline is quiet power: one reset at a time.",
  },
];

const phaseQuotes: Record<PanicSwitchState["phase"], string> = {
  idle: "The board is quiet. Quiet is where the next legend starts.",
  active: "Each minute is a scene. Hit your mark exactly when pressure peaks.",
  endurance: "Now the movie slows down. Your discipline writes the ending.",
  failed: "The city flickered. Reload the chapter and run it cleaner.",
  completed: "Credits roll only for the patient. You stayed in the frame.",
};

const phaseStoryBridge: Record<PanicSwitchState["phase"], string> = {
  idle: "Connection cue: This is not a button. It is a promise to your future self.",
  active:
    "Connection cue: Every reset is a heartbeat for the culture. Hold your nerve, let others feel it.",
  endurance:
    "Connection cue: The long hold is community energy: quiet, steady, impossible to fake.",
  failed: "Connection cue: Missing the window is human. Returning with intention is leadership.",
  completed:
    "Connection cue: Your consistency becomes proof. Your proof becomes trust. Your trust builds culture.",
};

const cycleStoryBeats: StoryBeat[] = [
  {
    chapter: "Chapter 01 · Ignite",
    chapterHook: "Streetlights hum back online.",
    triggerPrep: "Scout the edge. Do not jump early.",
    triggerLive: "Move on siren. Own the second.",
    activeBridge: "Minute one is calibration. Your pulse teaches the board your tempo.",
    enduranceBridge: "Calibration complete. Carry this pace into the long hold.",
  },
  {
    chapter: "Chapter 02 · Static",
    chapterHook: "Neon rain hits steel and sparks.",
    triggerPrep: "Listen to static. Wait for the clean note.",
    triggerLive: "Cut through noise. Tap decisive.",
    activeBridge: "Noise is distraction. Precision is signal.",
    enduranceBridge: "Signal stays clean when your rhythm is honest.",
  },
  {
    chapter: "Chapter 03 · District Pulse",
    chapterHook: "Subway turbines sync with your breath.",
    triggerPrep: "Hold center. Let countdown come to you.",
    triggerLive: "Reset the grid before collapse.",
    activeBridge: "You are no longer reacting. You are conducting.",
    enduranceBridge: "Conductors do less, better, for longer.",
  },
  {
    chapter: "Chapter 04 · Rooftop Cipher",
    chapterHook: "A coded line flashes then vanishes.",
    triggerPrep: "Catch patterns, not panic.",
    triggerLive: "Press with intent. Leave no jitter.",
    activeBridge: "Pattern memory starts here. The puzzle notices your timing.",
    enduranceBridge: "Pattern memory survives only when your mind is still.",
  },
  {
    chapter: "Chapter 05 · Midnight Relay",
    chapterHook: "Unknown runners pass you the line.",
    triggerPrep: "Guard your lane. No accidental moves.",
    triggerLive: "Hand-off now. No dropped signal.",
    activeBridge: "You are in relay mode: one clean hand-off per minute.",
    enduranceBridge: "Relay discipline becomes endurance fuel.",
  },
  {
    chapter: "Chapter 06 · Underpass Echo",
    chapterHook: "Footsteps return answers from concrete.",
    triggerPrep: "Count in your head. Be exact.",
    triggerLive: "Seal the loop before zero.",
    activeBridge: "Exact timing opens hidden doors.",
    enduranceBridge: "Hidden doors stay open for the patient.",
  },
  {
    chapter: "Chapter 07 · Signal Hunt",
    chapterHook: "Three symbols hide in plain sight.",
    triggerPrep: "Track symbols while waiting.",
    triggerLive: "Lock the symbol. Strike clean.",
    activeBridge: "You are close to the hidden track. Keep the line flawless.",
    enduranceBridge: "Hidden track is now breathing. Stay with it.",
  },
  {
    chapter: "Chapter 08 · Siren Choir",
    chapterHook: "Every alarm harmonizes into one tone.",
    triggerPrep: "One tone. One move. One shot.",
    triggerLive: "Answer the choir. Press now.",
    activeBridge: "When chaos harmonizes, leaders emerge.",
    enduranceBridge: "Harmony means less force, more consistency.",
  },
  {
    chapter: "Chapter 09 · Vault Door",
    chapterHook: "A lock clicks somewhere below.",
    triggerPrep: "No hero spam. Wait for truth.",
    triggerLive: "Open the lock. Hit perfect.",
    activeBridge: "Vault logic respects calm operators.",
    enduranceBridge: "Doors open for people who can hold still under pressure.",
  },
  {
    chapter: "Chapter 10 · Hidden Track",
    chapterHook: "The final cue arrives off-script.",
    triggerPrep: "Final minute. No wasted motion.",
    triggerLive: "Drop the final reset and enter legend mode.",
    activeBridge: "Final act complete. Endurance decides if you can read the secret.",
    enduranceBridge: "Secret lane active. Keep the tab alive. Finish what you started.",
  },
];

const clueLabelMap: Record<PanicRiddleClue, string> = {
  signal: "Signal fragment found",
  timing: "Timing fragment found",
  patience: "Patience fragment found",
};

function currentBeat(state: PanicSwitchState, config: PanicSwitchConfig): StoryBeat {
  const idx = Math.min(
    cycleStoryBeats.length - 1,
    state.phase === "active" ? state.cyclesCompleted : Math.max(0, config.requiredCycles - 1),
  );
  return cycleStoryBeats[idx];
}

function triggerLine(
  phase: PanicSwitchState["phase"],
  warningActive: boolean,
  countdownSeconds: number,
  beat: StoryBeat,
): string {
  if (phase === "active" && warningActive) {
    return `Trigger live: "${countdownSeconds}s left. ${beat.triggerLive}"`;
  }
  if (phase === "active") {
    return `Trigger prep: "${beat.triggerPrep}"`;
  }
  if (phase === "idle") {
    return 'Trigger start: "Tap once. Start Chapter 01."';
  }
  if (phase === "endurance") {
    return 'Trigger hold: "Keep tab visible. Endurance writes your unlock."';
  }
  if (phase === "failed") {
    return 'Trigger recover: "Run that chapter back cleaner."';
  }
  return 'Trigger victory: "Proof earned. Hidden lane unlocked."';
}

function formatClock(ms: number): string {
  const sec = Math.max(0, Math.floor(ms / 1000));
  const mm = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const ss = (sec % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

function parseDebugConfig(base: PanicSwitchConfig): PanicSwitchConfig {
  if (typeof window === "undefined") return base;
  try {
    const raw = localStorage.getItem("panic_switch_debug_v1");
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<PanicSwitchConfig>;
    return {
      cycleMs: Math.max(600, parsed.cycleMs ?? base.cycleMs),
      warningLeadMs: Math.max(200, parsed.warningLeadMs ?? base.warningLeadMs),
      graceMs: Math.max(0, parsed.graceMs ?? base.graceMs),
      requiredCycles: Math.max(1, parsed.requiredCycles ?? base.requiredCycles),
      enduranceMs: Math.max(1_500, parsed.enduranceMs ?? base.enduranceMs),
      precisionTargetMs: Math.max(200, parsed.precisionTargetMs ?? base.precisionTargetMs),
      maxPrecisionDeviationMs: Math.max(
        500,
        parsed.maxPrecisionDeviationMs ?? base.maxPrecisionDeviationMs,
      ),
    };
  } catch {
    return base;
  }
}

function useTonePlayer() {
  return useCallback((frequency: number, durationMs: number) => {
    if (typeof window === "undefined") return;
    try {
      const ctx = new window.AudioContext();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + durationMs / 1000);
      oscillator.onended = () => {
        void ctx.close();
      };
    } catch {
      // Audio can fail in strict autoplay environments; game still works.
    }
  }, []);
}

export function PanicSwitchOverlay() {
  const { address, isConnected } = useAccount();
  const { signSiwe, signing } = usePointsSiweSign();
  const claimPanicReward = useServerFn(postClaimPanicSwitchBccReward);
  const claimVoucherReward = useServerFn(postClaimPanicSwitchVoucherNft);
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<PanicSwitchState>(createInitialPanicSwitchState());
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [statusHint, setStatusHint] = useState("Arm the switch to start chaos mode.");
  const [config, setConfig] = useState<PanicSwitchConfig>(defaultPanicSwitchConfig);
  const [tabVisible, setTabVisible] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [dockVisible, setDockVisible] = useState(true);
  const [smartMenuOpen, setSmartMenuOpen] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [claimingReward, setClaimingReward] = useState(false);
  const [claimedToday, setClaimedToday] = useState(false);
  const [riddleAnswer, setRiddleAnswer] = useState("");
  const [claimingVoucher, setClaimingVoucher] = useState(false);
  const [voucherClaimed, setVoucherClaimed] = useState(false);
  const [voucherTxHash, setVoucherTxHash] = useState<string | null>(null);
  const [voucherTokenId, setVoucherTokenId] = useState<string | null>(null);

  const playTone = useTonePlayer();
  const warningRef = useRef(false);
  const lastScrollY = useRef(0);

  const emitEvents = useCallback(
    (events: PanicSwitchEvent[]) => {
      for (const event of events) {
        capturePanicSwitchEvent(event.type, event.payload);
        switch (event.type) {
          case "panic_switch_started":
            setStatusHint("Switch armed. Wait for the 10-second panic countdown.");
            playTone(420, 80);
            break;
          case "panic_switch_reset":
            setStatusHint("Reset locked. Keep focus and hold the streak.");
            playTone(620, 90);
            break;
          case "panic_switch_early_press":
            setStatusHint("Too early. Hit only when countdown appears.");
            break;
          case "panic_switch_failed":
            setStatusHint("Boom. Countdown missed. Restart to recover.");
            playTone(140, 200);
            break;
          case "panic_switch_active_complete":
            setStatusHint("Active phase cleared. Entering 77-minute endurance.");
            playTone(740, 180);
            break;
          case "panic_switch_endurance_started":
            setStatusHint("Stay open. Endurance is now tracking.");
            break;
          case "panic_switch_endurance_complete":
            setStatusHint("Legend run complete. You held the full endurance.");
            playTone(840, 240);
            break;
          case "panic_switch_riddle_clue_unlocked":
            setStatusHint(
              `Hidden track clue unlocked: ${clueLabelMap[event.payload?.clue as PanicRiddleClue] ?? "fragment found"}.`,
            );
            playTone(980, 120);
            break;
          case "panic_switch_riddle_track_unlocked":
            setStatusHint("Hidden track is open. Solve the riddle to unlock voucher claim.");
            playTone(1_120, 180);
            break;
        }
      }
    },
    [playTone],
  );

  useEffect(() => {
    setHydrated(true);
    setNowMs(Date.now());
    setState(loadPanicSwitchState());
    setConfig(parseDebugConfig(defaultPanicSwitchConfig));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const onScroll = () => {
      const nextY = window.scrollY;
      const delta = nextY - lastScrollY.current;
      if (nextY <= 24) {
        setDockVisible(true);
      } else if (delta > 8) {
        setDockVisible(false);
      } else if (delta < -8) {
        setDockVisible(true);
      }
      lastScrollY.current = nextY;
    };
    lastScrollY.current = window.scrollY;
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    savePanicSwitchState(state);
  }, [hydrated, state]);

  useEffect(() => {
    const onVisibility = () => setTabVisible(document.visibilityState === "visible");
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setInterval(() => {
      const now = Date.now();
      setNowMs(now);
      setState((prev) => {
        const { state: next, events } = tickPanicSwitch(prev, now, tabVisible, config);
        if (events.length) emitEvents(events);
        return next;
      });
    }, 250);
    return () => window.clearInterval(timer);
  }, [config, emitEvents, hydrated, tabVisible]);

  const derived = useMemo(
    () => derivePanicSwitchState(state, nowMs, config),
    [config, nowMs, state],
  );
  const scene = sceneFrames[Math.abs(state.sceneIndex) % sceneFrames.length];
  const beat = currentBeat(state, config);
  const precision = panicSwitchPrecisionScore(state, config);

  useEffect(() => {
    if (state.phase !== "active") {
      warningRef.current = false;
      return;
    }
    if (derived.warningActive && !warningRef.current) {
      warningRef.current = true;
      playTone(880, 120);
    }
    if (!derived.warningActive && warningRef.current) {
      warningRef.current = false;
    }
  }, [derived.warningActive, playTone, state.phase]);

  const handlePress = useCallback(() => {
    const now = Date.now();
    setNowMs(now);
    setState((prev) => {
      const result =
        prev.phase === "failed" || prev.phase === "completed"
          ? restartPanicSwitch(now)
          : pressPanicSwitch(prev, now, config);
      emitEvents(result.events);
      return result.state;
    });
  }, [config, emitEvents]);

  const clearSession = useCallback(() => {
    clearPanicSwitchState();
    setState(createInitialPanicSwitchState());
    setNowMs(Date.now());
    setStatusHint("Session cleared. Arm again when ready.");
    setClaimedToday(false);
    setRiddleAnswer("");
    setClaimingVoucher(false);
    setVoucherClaimed(false);
    setVoucherTxHash(null);
    setVoucherTokenId(null);
  }, []);

  const claimDailyBccReward = useCallback(async () => {
    if (!isConnected || !address) {
      toast.error("Connect your wallet to claim BCC.");
      return;
    }
    if (!state.sessionId) {
      toast.error("No active session proof found.");
      return;
    }
    try {
      setClaimingReward(true);
      const signed = await signSiwe();
      if (!signed) {
        toast.error("Signature required to attest participation.");
        return;
      }
      const res = await claimPanicReward({
        data: {
          message: signed.prepared,
          signature: signed.signature,
          sessionId: state.sessionId,
          precisionScore: panicSwitchPrecisionScore(state, config),
        },
      });
      if (!res.ok) {
        toast.error(res.error ?? "Could not claim BCC reward.");
        return;
      }
      if (res.alreadyCompleted) {
        setClaimedToday(true);
        toast.message("Today's BCC reward already claimed.");
        return;
      }
      setClaimedToday(true);
      const amount =
        res.bccRewardWei && BigInt(res.bccRewardWei) > 0n
          ? formatUnits(BigInt(res.bccRewardWei), 18)
          : null;
      if (res.onchainSettled && res.onchainTxHash) {
        toast.success(
          amount
            ? `On-chain reward sent: ${amount} ${BCC_SYMBOL} (${res.onchainTxHash.slice(0, 10)}...)`
            : `On-chain ${BCC_SYMBOL} reward sent (${res.onchainTxHash.slice(0, 10)}...)`,
        );
      } else {
        toast.success(
          amount
            ? `Daily panic reward queued: ${amount} ${BCC_SYMBOL} (settlement pending).`
            : `Daily panic reward queued in ${BCC_SYMBOL} (settlement pending).`,
        );
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reward claim failed.");
    } finally {
      setClaimingReward(false);
    }
  }, [address, claimPanicReward, config, isConnected, signSiwe, state]);

  const claimHiddenVoucher = useCallback(async () => {
    if (!isConnected || !address) {
      toast.error("Connect your wallet to claim the hidden voucher.");
      return;
    }
    if (!state.sessionId) {
      toast.error("No Panic Switch session found.");
      return;
    }
    if (!derived.riddleReady && !derived.riddleSolved) {
      toast.error("Hidden track is still locked.");
      return;
    }
    const answer = riddleAnswer.trim();
    if (!answer) {
      toast.error("Enter your riddle answer first.");
      return;
    }
    const signed = await signSiwe();
    if (!signed) {
      toast.error("Signature required to mint voucher NFT.");
      return;
    }
    const now = Date.now();
    const clueFingerprint = [
      state.sessionId,
      derived.riddleCluesUnlocked.join("|"),
      state.cyclesCompleted.toString(),
      panicSwitchPrecisionScore(state, config).toString(),
    ].join("::");
    setState((prev) => recordPanicSwitchRiddleAttempt(prev, now));
    try {
      setClaimingVoucher(true);
      const res = await claimVoucherReward({
        data: {
          message: signed.prepared,
          signature: signed.signature,
          sessionId: state.sessionId,
          precisionScore: panicSwitchPrecisionScore(state, config),
          clueFingerprint,
          riddleAnswer: answer,
        },
      });
      if (!res.ok) {
        const msg =
          res.error === "riddle_incorrect"
            ? "Not quite. Read the fragments again."
            : res.error === "voucher_requires_today_attested_run"
              ? "Claim daily BCC reward first, then return to the hidden lane."
              : res.error === "precision_too_low"
                ? "Precision threshold missed. Tighten your timing and retry."
                : res.error;
        toast.error(msg ?? "Voucher claim failed.");
        return;
      }
      setState((prev) => markPanicSwitchRiddleClaimed(prev, now));
      setVoucherClaimed(true);
      setVoucherTxHash(res.txHash ?? null);
      setVoucherTokenId(res.tokenId ?? null);
      if (res.alreadyCompleted) {
        toast.message("Hidden voucher already claimed on this wallet.");
      } else if (res.txHash) {
        toast.success(`Voucher NFT minted${res.tokenId ? ` · token #${res.tokenId}` : ""}.`);
      } else {
        toast.message("Voucher claim recorded. Mint is queued by treasury.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Voucher claim failed.");
    } finally {
      setClaimingVoucher(false);
    }
  }, [
    address,
    claimVoucherReward,
    config,
    derived.riddleCluesUnlocked,
    derived.riddleReady,
    derived.riddleSolved,
    isConnected,
    riddleAnswer,
    signSiwe,
    state,
  ]);

  if (!hydrated) return null;

  const activeCycleLabel = `${Math.min(config.requiredCycles, state.cyclesCompleted + 1)}/${config.requiredCycles}`;
  const actionLabel =
    state.phase === "idle"
      ? "Arm Panic Switch"
      : state.phase === "active"
        ? derived.warningActive
          ? "RESET NOW"
          : "Stand By"
        : state.phase === "endurance"
          ? "Endurance Running"
          : "Restart Run";
  const actionDisabled = state.phase === "active" && !derived.warningActive;
  const canClaimReward =
    (state.phase === "endurance" || state.phase === "completed") && !claimedToday;
  const showVoucherSection = state.phase === "endurance" || state.phase === "completed";
  const canClaimVoucher =
    showVoucherSection &&
    derived.riddleReady &&
    !voucherClaimed &&
    !derived.riddleSolved &&
    isConnected &&
    !claimingVoucher &&
    !signing;
  const smartMenuHint =
    state.phase === "idle"
      ? "Ready"
      : state.phase === "active"
        ? derived.warningActive
          ? "RESET"
          : "LIVE"
        : state.phase === "endurance"
          ? "77m"
          : state.phase === "completed"
            ? "DONE"
            : "RETRY";

  const handleSwipeRestoreStart = (y: number) => setTouchStartY(y);
  const handleSwipeRestoreEnd = (y: number) => {
    if (touchStartY === null) return;
    if (touchStartY - y > 32) {
      setDockVisible(true);
      setSmartMenuOpen(false);
      setModalOpen(true);
    }
    setTouchStartY(null);
  };

  return (
    <div className="pointer-events-none fixed bottom-floating-safe left-4 z-30 sm:left-auto sm:right-4">
      {dockVisible ? (
        <div className="pointer-events-auto">
          <button
            type="button"
            aria-label="Open Panic Switch"
            onClick={() => setModalOpen(true)}
            className="group relative h-14 w-14 rounded-full bg-gradient-to-br from-[#C5FF41] via-[#8eff5c] to-[#00E5FF] p-[2px] shadow-[0_12px_28px_rgba(0,0,0,0.45)] transition hover:scale-105 active:translate-y-[2px] active:shadow-[0_6px_14px_rgba(0,0,0,0.38)]"
          >
            <span className="absolute inset-0 rounded-full bg-black/35 blur-sm" />
            <span className="relative flex h-full w-full items-center justify-center rounded-full bg-[#0c1018] text-[10px] font-black uppercase tracking-[0.12em] text-white">
              {smartMenuHint}
            </span>
            <span className="pointer-events-none absolute -top-1.5 -right-1.5 rounded-full bg-black/80 px-1.5 py-0.5 text-[9px] font-semibold text-[#C5FF41]">
              Panic
            </span>
          </button>
        </div>
      ) : (
        <div className="pointer-events-auto relative">
          <button
            type="button"
            onClick={() => setSmartMenuOpen((v) => !v)}
            onTouchStart={(e) => handleSwipeRestoreStart(e.touches[0]?.clientY ?? 0)}
            onTouchEnd={(e) => handleSwipeRestoreEnd(e.changedTouches[0]?.clientY ?? 0)}
            className="rounded-full border border-white/20 bg-black/65 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-xl"
          >
            Smart Menu
          </button>
          {smartMenuOpen ? (
            <div className="absolute bottom-9 right-0 w-44 rounded-xl border border-white/20 bg-black/75 p-2 shadow-xl backdrop-blur-xl">
              <button
                type="button"
                onClick={() => {
                  setDockVisible(true);
                  setModalOpen(true);
                  setSmartMenuOpen(false);
                }}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-left text-xs font-semibold text-white"
              >
                Bring Panic Switch back
              </button>
              <p className="mt-1 text-[10px] text-white/60">
                Tip: swipe up on this chip to restore fast.
              </p>
            </div>
          ) : null}
        </div>
      )}

      {modalOpen ? (
        <>
          <button
            type="button"
            aria-label="Close Panic Switch modal"
            onClick={() => setModalOpen(false)}
            className="pointer-events-auto fixed inset-0 z-[44] bg-black/45 backdrop-blur-[2px]"
          />
          <div
            className={`pointer-events-auto fixed inset-x-3 inset-sheet-above-nav z-[45] mx-auto flex max-w-md flex-col overflow-hidden rounded-2xl border bg-gradient-to-br shadow-[0_20px_45px_rgba(0,0,0,0.45)] transition-all duration-300 sm:inset-x-auto sm:left-4 sm:right-auto sm:w-[min(360px,calc(100vw-1.5rem))] sm:bottom-[calc(6.5rem+env(safe-area-inset-bottom))] sm:top-auto sm:max-h-[min(72dvh,560px)] ${scene.frameClassName}`}
          >
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/70">
                    Panic Switch
                  </p>
                  <p className="font-semibold">{scene.title}</p>
                  <p className="text-[11px] text-white/70">{scene.subtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-full border border-white/25 bg-black/30 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white"
                >
                  Close
                </button>
              </div>

              <p className="mb-2 rounded-lg border border-white/20 bg-black/35 px-2.5 py-1.5 text-[11px] text-white/80">
                Press once to arm. Then only press when the 10s siren countdown appears.
              </p>
              <p className="mb-2 rounded-lg border border-cyan-300/30 bg-cyan-500/10 px-2.5 py-1.5 text-[11px] text-cyan-100">
                {beat.chapter} · {beat.chapterHook}
              </p>
              <p className="mb-2 rounded-lg border border-white/15 bg-black/25 px-2.5 py-1.5 text-[11px] italic text-white/85">
                "{phaseQuotes[state.phase]}"
              </p>
              <p className="mb-2 rounded-lg border border-[#C5FF41]/25 bg-[#C5FF41]/10 px-2.5 py-1.5 text-[11px] text-[#eaffb8]">
                {state.phase === "active"
                  ? beat.activeBridge
                  : state.phase === "endurance" || state.phase === "completed"
                    ? beat.enduranceBridge
                    : phaseStoryBridge[state.phase]}
              </p>

              <div className="rounded-xl border border-white/20 bg-black/35 px-3 py-2 text-sm text-white">
                <div className="mb-1 flex items-center justify-between text-[11px] text-white/75">
                  <span>Phase</span>
                  <span className="font-semibold uppercase">{state.phase.replace("_", " ")}</span>
                </div>
                {state.phase === "active" ? (
                  <div className="space-y-1">
                    <p className="text-[12px] text-white/80">Cycle {activeCycleLabel}</p>
                    <p className="font-mono text-lg">
                      {derived.warningActive
                        ? `00:${derived.countdownSeconds.toString().padStart(2, "0")}`
                        : formatClock(derived.cycleRemainingMs)}
                    </p>
                    {derived.warningActive ? (
                      <p className="animate-pulse text-xs font-semibold text-rose-200">
                        Siren live. Press before zero.
                      </p>
                    ) : (
                      <p className="text-xs text-white/70">Wait for the final 10-second warning.</p>
                    )}
                  </div>
                ) : null}
                {state.phase === "endurance" ? (
                  <div className="space-y-1">
                    <p className="text-[12px] text-white/80">Endurance target</p>
                    <p className="font-mono text-lg">{formatClock(derived.enduranceRemainingMs)}</p>
                    <p className="text-xs text-white/70">
                      {tabVisible
                        ? "Tracking while this tab stays visible."
                        : "Paused. Return to this tab."}
                    </p>
                  </div>
                ) : null}
                {state.phase === "failed" ? (
                  <p className="text-xs text-rose-200">
                    Countdown was missed. Restart and hold rhythm.
                  </p>
                ) : null}
                {state.phase === "completed" ? (
                  <p className="text-xs text-lime-200">
                    Full run completed. Precision score locked at {precision}/777.
                  </p>
                ) : null}
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-white/80">
                <div className="rounded-lg border border-white/20 bg-black/30 px-2 py-1">
                  <p className="uppercase tracking-wide text-white/60">Resets</p>
                  <p className="font-semibold">{state.resetsSuccessful}</p>
                </div>
                <div className="rounded-lg border border-white/20 bg-black/30 px-2 py-1">
                  <p className="uppercase tracking-wide text-white/60">Precision</p>
                  <p className="font-semibold">{precision}/777</p>
                </div>
              </div>
              <div className="mt-2 rounded-lg border border-cyan-300/25 bg-cyan-500/5 px-2.5 py-2 text-[11px] text-cyan-100">
                <p className="font-semibold">Hidden track fragments</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {(["signal", "timing", "patience"] as PanicRiddleClue[]).map((clue) => {
                    const unlocked = derived.riddleCluesUnlocked.includes(clue);
                    return (
                      <span
                        key={clue}
                        className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                          unlocked
                            ? "border-cyan-300/55 bg-cyan-400/15 text-cyan-100"
                            : "border-white/20 bg-black/30 text-white/50"
                        }`}
                      >
                        {unlocked ? clueLabelMap[clue] : `${clue} locked`}
                      </span>
                    );
                  })}
                </div>
              </div>

              <p className="mt-2 text-[11px] text-white/80">{statusHint}</p>
              <p className="mt-1 text-[11px] italic text-white/70">{scene.quote}</p>
              <p className="mt-1 rounded-md border border-white/15 bg-black/20 px-2 py-1 text-[11px] font-medium text-white/85">
                {triggerLine(state.phase, derived.warningActive, derived.countdownSeconds, beat)}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePress}
                  disabled={actionDisabled}
                  className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold uppercase tracking-wide transition ${
                    actionDisabled
                      ? "cursor-not-allowed border border-white/20 bg-black/30 text-white/50"
                      : "animate-[pulse_1.4s_ease-in-out_infinite] bg-[#C5FF41] text-black hover:brightness-95"
                  }`}
                >
                  {actionLabel}
                </button>
                <button
                  type="button"
                  onClick={clearSession}
                  className="rounded-xl border border-white/20 bg-black/35 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white/85"
                >
                  Clear
                </button>
              </div>
              {state.phase === "endurance" || state.phase === "completed" ? (
                <div className="mt-2 rounded-xl border border-[#C5FF41]/25 bg-[#C5FF41]/10 p-2">
                  <p className="text-[11px] text-[#edffc0]">
                    After 10 rounds you can claim a daily {BCC_SYMBOL} reward with wallet
                    attestation.
                  </p>
                  <button
                    type="button"
                    onClick={() => void claimDailyBccReward()}
                    disabled={!canClaimReward || claimingReward || signing || !isConnected}
                    className={`mt-2 w-full rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wide ${
                      !canClaimReward || claimingReward || signing || !isConnected
                        ? "cursor-not-allowed border border-white/20 bg-black/35 text-white/60"
                        : "border border-[#C5FF41]/45 bg-black/55 text-[#C5FF41] hover:bg-black/70"
                    }`}
                  >
                    {!isConnected
                      ? `Connect wallet to claim ${BCC_SYMBOL}`
                      : claimingReward || signing
                        ? "Attesting..."
                        : canClaimReward
                          ? `Claim daily ${BCC_SYMBOL} reward`
                          : `Today's ${BCC_SYMBOL} reward claimed`}
                  </button>
                </div>
              ) : null}
              {showVoucherSection ? (
                <div className="mt-2 rounded-xl border border-cyan-300/35 bg-cyan-500/10 p-2">
                  <p className="text-[11px] text-cyan-100">
                    Hidden track riddle:{" "}
                    <span className="italic">"Three keys run the city at midnight."</span> Name the
                    three keys in order.
                  </p>
                  <input
                    value={riddleAnswer}
                    onChange={(e) => setRiddleAnswer(e.target.value)}
                    placeholder="your answer..."
                    className="mt-2 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-xs text-white placeholder:text-white/40 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => void claimHiddenVoucher()}
                    disabled={!canClaimVoucher}
                    className={`mt-2 w-full rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wide ${
                      canClaimVoucher
                        ? "border border-cyan-300/50 bg-black/60 text-cyan-100 hover:bg-black/80"
                        : "cursor-not-allowed border border-white/20 bg-black/35 text-white/60"
                    }`}
                  >
                    {!isConnected
                      ? "Connect wallet for hidden voucher"
                      : claimingVoucher || signing
                        ? "Attesting hidden track..."
                        : voucherClaimed || derived.riddleSolved
                          ? `Hidden voucher claimed${voucherTokenId ? ` · token #${voucherTokenId}` : ""}`
                          : derived.riddleReady
                            ? "Claim Hidden Voucher NFT"
                            : "Hidden track locked"}
                  </button>
                  {voucherTxHash ? (
                    <p className="mt-1 text-[10px] text-cyan-100/80">
                      tx: {voucherTxHash.slice(0, 18)}...
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
