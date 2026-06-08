export type PanicSwitchPhase = "idle" | "active" | "failed" | "endurance" | "completed";

export type PanicRiddleClue = "signal" | "timing" | "patience";

export type PanicSwitchConfig = {
  cycleMs: number;
  warningLeadMs: number;
  graceMs: number;
  requiredCycles: number;
  enduranceMs: number;
  precisionTargetMs: number;
  maxPrecisionDeviationMs: number;
};

export type PanicSwitchEventType =
  | "panic_switch_started"
  | "panic_switch_reset"
  | "panic_switch_early_press"
  | "panic_switch_failed"
  | "panic_switch_active_complete"
  | "panic_switch_endurance_started"
  | "panic_switch_endurance_complete"
  | "panic_switch_riddle_clue_unlocked"
  | "panic_switch_riddle_track_unlocked";

export type PanicSwitchEvent = {
  type: PanicSwitchEventType;
  payload?: Record<string, number | string | boolean | null>;
};

export type PanicSwitchState = {
  version: 2;
  phase: PanicSwitchPhase;
  sessionId: string | null;
  startedAtMs: number | null;
  cycleStartedAtMs: number | null;
  cyclesCompleted: number;
  resetsSuccessful: number;
  totalDeviationMs: number;
  sceneIndex: number;
  failReason: "missed_window" | null;
  enduranceStartedAtMs: number | null;
  enduranceElapsedVisibleMs: number;
  lastTickAtMs: number | null;
  riddleCluesUnlocked: PanicRiddleClue[];
  riddleTrackUnlockedAtMs: number | null;
  riddleSolvedAtMs: number | null;
  riddleClaimedAtMs: number | null;
  riddleAttemptCount: number;
};

export type PanicSwitchDerived = {
  phase: PanicSwitchPhase;
  warningActive: boolean;
  cycleElapsedMs: number;
  cycleRemainingMs: number;
  countdownMs: number;
  countdownSeconds: number;
  precisionScore: number;
  enduranceRemainingMs: number;
  enduranceProgress: number;
  riddleCluesUnlocked: PanicRiddleClue[];
  riddleReady: boolean;
  riddleSolved: boolean;
};

const STORAGE_KEY = "bc_panic_switch_v1";

export const defaultPanicSwitchConfig: PanicSwitchConfig = {
  cycleMs: 60_000,
  warningLeadMs: 10_000,
  graceMs: 1_500,
  requiredCycles: 10,
  enduranceMs: 77 * 60_000,
  precisionTargetMs: 57_770,
  maxPrecisionDeviationMs: 5_000,
};

export function createInitialPanicSwitchState(): PanicSwitchState {
  return {
    version: 2,
    phase: "idle",
    sessionId: null,
    startedAtMs: null,
    cycleStartedAtMs: null,
    cyclesCompleted: 0,
    resetsSuccessful: 0,
    totalDeviationMs: 0,
    sceneIndex: 0,
    failReason: null,
    enduranceStartedAtMs: null,
    enduranceElapsedVisibleMs: 0,
    lastTickAtMs: null,
    riddleCluesUnlocked: [],
    riddleTrackUnlockedAtMs: null,
    riddleSolvedAtMs: null,
    riddleClaimedAtMs: null,
    riddleAttemptCount: 0,
  };
}

const clueUnlockPriority: ReadonlyArray<PanicRiddleClue> = ["signal", "timing", "patience"];

const riddleUnlockThresholdMs = 11 * 60_000;

function hasClue(state: PanicSwitchState, clue: PanicRiddleClue): boolean {
  return state.riddleCluesUnlocked.includes(clue);
}

function deriveUnlockedClues(
  state: PanicSwitchState,
  config: PanicSwitchConfig,
): PanicRiddleClue[] {
  const next = new Set<PanicRiddleClue>(state.riddleCluesUnlocked);
  if (state.resetsSuccessful >= Math.min(3, config.requiredCycles)) next.add("signal");
  if (
    state.cyclesCompleted >= Math.min(6, config.requiredCycles) &&
    panicSwitchPrecisionScore(state, config) >= 620
  ) {
    next.add("timing");
  }
  if (
    (state.phase === "endurance" || state.phase === "completed") &&
    state.enduranceElapsedVisibleMs >= riddleUnlockThresholdMs
  ) {
    next.add("patience");
  }
  return clueUnlockPriority.filter((clue) => next.has(clue));
}

function withRiddleProgress(
  state: PanicSwitchState,
  nowMs: number,
  config: PanicSwitchConfig,
): { state: PanicSwitchState; events: PanicSwitchEvent[] } {
  const unlocked = deriveUnlockedClues(state, config);
  const newClues = unlocked.filter((clue) => !hasClue(state, clue));
  const canUnlockTrack =
    unlocked.length === clueUnlockPriority.length &&
    (state.phase === "endurance" || state.phase === "completed");
  const trackAlreadyUnlocked = state.riddleTrackUnlockedAtMs !== null;
  const nextState: PanicSwitchState = {
    ...state,
    riddleCluesUnlocked: unlocked,
    riddleTrackUnlockedAtMs: canUnlockTrack
      ? trackAlreadyUnlocked
        ? state.riddleTrackUnlockedAtMs
        : nowMs
      : state.riddleTrackUnlockedAtMs,
  };
  const events: PanicSwitchEvent[] = newClues.map((clue) => ({
    type: "panic_switch_riddle_clue_unlocked",
    payload: { clue, cluesUnlocked: unlocked.length },
  }));
  if (canUnlockTrack && !trackAlreadyUnlocked) {
    events.push({
      type: "panic_switch_riddle_track_unlocked",
      payload: { unlockedAtMs: nowMs, cluesUnlocked: unlocked.length },
    });
  }
  return { state: nextState, events };
}

function windowStartMs(config: PanicSwitchConfig): number {
  return config.cycleMs - config.warningLeadMs;
}

function windowEndMs(config: PanicSwitchConfig): number {
  return config.cycleMs + config.graceMs;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function panicSwitchPrecisionScore(
  state: PanicSwitchState,
  config: PanicSwitchConfig = defaultPanicSwitchConfig,
): number {
  if (state.resetsSuccessful <= 0) return 0;
  const avgDeviation = state.totalDeviationMs / state.resetsSuccessful;
  const normalized = 1 - avgDeviation / config.maxPrecisionDeviationMs;
  return Math.round(clamp(normalized, 0, 1) * 777);
}

export function derivePanicSwitchState(
  state: PanicSwitchState,
  nowMs: number,
  config: PanicSwitchConfig = defaultPanicSwitchConfig,
): PanicSwitchDerived {
  const cycleElapsedMs =
    state.phase === "active" && state.cycleStartedAtMs !== null
      ? Math.max(0, nowMs - state.cycleStartedAtMs)
      : 0;
  const warningActive =
    cycleElapsedMs >= windowStartMs(config) && cycleElapsedMs <= windowEndMs(config);
  const cycleRemainingMs =
    state.phase === "active" ? Math.max(0, config.cycleMs - cycleElapsedMs) : 0;
  const countdownMs = warningActive ? Math.max(0, config.cycleMs - cycleElapsedMs) : 0;
  const countdownSeconds = Math.ceil(countdownMs / 1000);
  const enduranceRemainingMs =
    state.phase === "endurance"
      ? Math.max(0, config.enduranceMs - state.enduranceElapsedVisibleMs)
      : 0;
  const enduranceProgress =
    state.phase === "endurance" || state.phase === "completed"
      ? clamp(state.enduranceElapsedVisibleMs / config.enduranceMs, 0, 1)
      : 0;

  return {
    phase: state.phase,
    warningActive,
    cycleElapsedMs,
    cycleRemainingMs,
    countdownMs,
    countdownSeconds,
    precisionScore: panicSwitchPrecisionScore(state, config),
    enduranceRemainingMs,
    enduranceProgress,
    riddleCluesUnlocked: state.riddleCluesUnlocked,
    riddleReady:
      state.riddleTrackUnlockedAtMs !== null &&
      (state.phase === "endurance" || state.phase === "completed") &&
      state.riddleSolvedAtMs === null,
    riddleSolved: state.riddleSolvedAtMs !== null,
  };
}

export function armPanicSwitch(nowMs: number): {
  state: PanicSwitchState;
  events: PanicSwitchEvent[];
} {
  const sessionId = `panic-${nowMs}`;
  return {
    state: {
      version: 2,
      phase: "active",
      sessionId,
      startedAtMs: nowMs,
      cycleStartedAtMs: nowMs,
      cyclesCompleted: 0,
      resetsSuccessful: 0,
      totalDeviationMs: 0,
      sceneIndex: 0,
      failReason: null,
      enduranceStartedAtMs: null,
      enduranceElapsedVisibleMs: 0,
      lastTickAtMs: nowMs,
      riddleCluesUnlocked: [],
      riddleTrackUnlockedAtMs: null,
      riddleSolvedAtMs: null,
      riddleClaimedAtMs: null,
      riddleAttemptCount: 0,
    },
    events: [{ type: "panic_switch_started", payload: { startedAtMs: nowMs } }],
  };
}

export function tickPanicSwitch(
  state: PanicSwitchState,
  nowMs: number,
  isVisible: boolean,
  config: PanicSwitchConfig = defaultPanicSwitchConfig,
): { state: PanicSwitchState; events: PanicSwitchEvent[] } {
  if (state.phase === "active" && state.cycleStartedAtMs !== null) {
    const elapsed = nowMs - state.cycleStartedAtMs;
    if (elapsed > windowEndMs(config)) {
      const failed: PanicSwitchState = {
        ...state,
        phase: "failed",
        failReason: "missed_window",
        lastTickAtMs: nowMs,
      };
      const failedProgress = withRiddleProgress(failed, nowMs, config);
      return {
        state: failedProgress.state,
        events: [
          {
            type: "panic_switch_failed",
            payload: {
              cycle: state.cyclesCompleted + 1,
              elapsedMs: elapsed,
              reason: "missed_window",
            },
          },
          ...failedProgress.events,
        ],
      };
    }
    const progressed = withRiddleProgress({ ...state, lastTickAtMs: nowMs }, nowMs, config);
    return progressed;
  }

  if (state.phase !== "endurance") {
    return withRiddleProgress(state, nowMs, config);
  }

  const prevTick = state.lastTickAtMs ?? nowMs;
  const delta = Math.max(0, nowMs - prevTick);
  const added = isVisible ? delta : 0;
  const nextElapsed = state.enduranceElapsedVisibleMs + added;
  const nextState: PanicSwitchState = {
    ...state,
    enduranceElapsedVisibleMs: nextElapsed,
    lastTickAtMs: nowMs,
  };

  if (nextElapsed >= config.enduranceMs) {
    const completedProgress = withRiddleProgress(
      {
        ...nextState,
        phase: "completed",
      },
      nowMs,
      config,
    );
    return {
      state: completedProgress.state,
      events: [
        {
          type: "panic_switch_endurance_complete",
          payload: { enduranceElapsedMs: nextElapsed },
        },
        ...completedProgress.events,
      ],
    };
  }

  return withRiddleProgress(nextState, nowMs, config);
}

export function pressPanicSwitch(
  state: PanicSwitchState,
  nowMs: number,
  config: PanicSwitchConfig = defaultPanicSwitchConfig,
): { state: PanicSwitchState; events: PanicSwitchEvent[] } {
  if (state.phase === "idle") {
    return armPanicSwitch(nowMs);
  }

  if (state.phase !== "active" || state.cycleStartedAtMs === null) {
    return { state, events: [] };
  }

  const elapsed = nowMs - state.cycleStartedAtMs;
  if (elapsed < windowStartMs(config)) {
    const earlyProgress = withRiddleProgress({ ...state, lastTickAtMs: nowMs }, nowMs, config);
    return {
      state: earlyProgress.state,
      events: [
        {
          type: "panic_switch_early_press",
          payload: { cycle: state.cyclesCompleted + 1, elapsedMs: elapsed },
        },
        ...earlyProgress.events,
      ],
    };
  }

  if (elapsed > windowEndMs(config)) {
    const failed: PanicSwitchState = {
      ...state,
      phase: "failed",
      failReason: "missed_window",
      lastTickAtMs: nowMs,
    };
    const failedProgress = withRiddleProgress(failed, nowMs, config);
    return {
      state: failedProgress.state,
      events: [
        {
          type: "panic_switch_failed",
          payload: {
            cycle: state.cyclesCompleted + 1,
            elapsedMs: elapsed,
            reason: "missed_window",
          },
        },
        ...failedProgress.events,
      ],
    };
  }

  const nextCycles = state.cyclesCompleted + 1;
  const deviation = Math.abs(elapsed - config.precisionTargetMs);
  const nextStateBase: PanicSwitchState = {
    ...state,
    cyclesCompleted: nextCycles,
    resetsSuccessful: state.resetsSuccessful + 1,
    totalDeviationMs: state.totalDeviationMs + deviation,
    sceneIndex: state.sceneIndex + 1,
    cycleStartedAtMs: nowMs,
    lastTickAtMs: nowMs,
  };

  const events: PanicSwitchEvent[] = [
    {
      type: "panic_switch_reset",
      payload: {
        cycle: nextCycles,
        elapsedMs: elapsed,
        deviationMs: deviation,
      },
    },
  ];

  if (nextCycles >= config.requiredCycles) {
    const enduranceState: PanicSwitchState = {
      ...nextStateBase,
      phase: "endurance",
      enduranceStartedAtMs: nowMs,
      enduranceElapsedVisibleMs: 0,
    };
    events.push(
      {
        type: "panic_switch_active_complete",
        payload: {
          cyclesCompleted: nextCycles,
          precisionScore: panicSwitchPrecisionScore(nextStateBase, config),
        },
      },
      {
        type: "panic_switch_endurance_started",
        payload: { enduranceTargetMs: config.enduranceMs },
      },
    );
    const progressed = withRiddleProgress(enduranceState, nowMs, config);
    return { state: progressed.state, events: [...events, ...progressed.events] };
  }

  const progressed = withRiddleProgress(nextStateBase, nowMs, config);
  return { state: progressed.state, events: [...events, ...progressed.events] };
}

export function restartPanicSwitch(nowMs: number): {
  state: PanicSwitchState;
  events: PanicSwitchEvent[];
} {
  return armPanicSwitch(nowMs);
}

export function recordPanicSwitchRiddleAttempt(
  state: PanicSwitchState,
  nowMs: number,
): PanicSwitchState {
  return {
    ...state,
    lastTickAtMs: nowMs,
    riddleAttemptCount: state.riddleAttemptCount + 1,
  };
}

export function markPanicSwitchRiddleClaimed(
  state: PanicSwitchState,
  nowMs: number,
): PanicSwitchState {
  return {
    ...state,
    lastTickAtMs: nowMs,
    riddleSolvedAtMs: state.riddleSolvedAtMs ?? nowMs,
    riddleClaimedAtMs: state.riddleClaimedAtMs ?? nowMs,
  };
}

export function loadPanicSwitchState(): PanicSwitchState {
  if (typeof window === "undefined") return createInitialPanicSwitchState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialPanicSwitchState();
    const parsed = JSON.parse(raw) as Partial<Omit<PanicSwitchState, "version">> & {
      version?: number;
      riddleCluesUnlocked?: unknown;
    };
    if (parsed.version !== 1 && parsed.version !== 2) return createInitialPanicSwitchState();
    const clues = Array.isArray(parsed.riddleCluesUnlocked)
      ? parsed.riddleCluesUnlocked.filter(
          (v): v is PanicRiddleClue => v === "signal" || v === "timing" || v === "patience",
        )
      : [];
    return {
      version: 2,
      phase: parsed.phase ?? "idle",
      sessionId: parsed.sessionId ?? null,
      startedAtMs: typeof parsed.startedAtMs === "number" ? parsed.startedAtMs : null,
      cycleStartedAtMs:
        typeof parsed.cycleStartedAtMs === "number" ? parsed.cycleStartedAtMs : null,
      cyclesCompleted: typeof parsed.cyclesCompleted === "number" ? parsed.cyclesCompleted : 0,
      resetsSuccessful: typeof parsed.resetsSuccessful === "number" ? parsed.resetsSuccessful : 0,
      totalDeviationMs: typeof parsed.totalDeviationMs === "number" ? parsed.totalDeviationMs : 0,
      sceneIndex: typeof parsed.sceneIndex === "number" ? parsed.sceneIndex : 0,
      failReason: parsed.failReason === "missed_window" ? "missed_window" : null,
      enduranceStartedAtMs:
        typeof parsed.enduranceStartedAtMs === "number" ? parsed.enduranceStartedAtMs : null,
      enduranceElapsedVisibleMs:
        typeof parsed.enduranceElapsedVisibleMs === "number" ? parsed.enduranceElapsedVisibleMs : 0,
      lastTickAtMs: typeof parsed.lastTickAtMs === "number" ? parsed.lastTickAtMs : null,
      riddleCluesUnlocked: clues,
      riddleTrackUnlockedAtMs:
        typeof parsed.riddleTrackUnlockedAtMs === "number" ? parsed.riddleTrackUnlockedAtMs : null,
      riddleSolvedAtMs:
        typeof parsed.riddleSolvedAtMs === "number" ? parsed.riddleSolvedAtMs : null,
      riddleClaimedAtMs:
        typeof parsed.riddleClaimedAtMs === "number" ? parsed.riddleClaimedAtMs : null,
      riddleAttemptCount:
        typeof parsed.riddleAttemptCount === "number" ? parsed.riddleAttemptCount : 0,
    };
  } catch {
    return createInitialPanicSwitchState();
  }
}

export function savePanicSwitchState(state: PanicSwitchState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearPanicSwitchState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
