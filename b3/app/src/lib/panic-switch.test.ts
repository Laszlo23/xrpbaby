import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createInitialPanicSwitchState,
  defaultPanicSwitchConfig,
  derivePanicSwitchState,
  pressPanicSwitch,
  tickPanicSwitch,
} from "./panic-switch.ts";

const testConfig = {
  ...defaultPanicSwitchConfig,
  cycleMs: 1_000,
  warningLeadMs: 200,
  graceMs: 100,
  requiredCycles: 2,
  enduranceMs: 2_000,
  precisionTargetMs: 770,
  maxPrecisionDeviationMs: 1_000,
};

function activeState(nowMs = 1_000) {
  const state = createInitialPanicSwitchState();
  state.phase = "active";
  state.sessionId = "panic-test";
  state.startedAtMs = nowMs;
  state.cycleStartedAtMs = nowMs;
  state.lastTickAtMs = nowMs;
  return state;
}

describe("panic switch state machine", () => {
  it("accepts reset in warning window and advances cycle", () => {
    const start = activeState();
    const { state, events } = pressPanicSwitch(start, 1_850, testConfig);
    assert.equal(state.phase, "active");
    assert.equal(state.cyclesCompleted, 1);
    assert.equal(state.resetsSuccessful, 1);
    assert.equal(state.sceneIndex, 1);
    assert.equal(events[0]?.type, "panic_switch_reset");
  });

  it("fails when warning window is missed", () => {
    const start = activeState();
    const { state, events } = tickPanicSwitch(start, 2_500, true, testConfig);
    assert.equal(state.phase, "failed");
    assert.equal(state.failReason, "missed_window");
    assert.equal(events[0]?.type, "panic_switch_failed");
  });

  it("moves to endurance after required cycles", () => {
    const first = pressPanicSwitch(activeState(), 1_850, testConfig).state;
    const second = pressPanicSwitch(first, 2_700, testConfig);
    assert.equal(second.state.phase, "endurance");
    assert.equal(second.state.cyclesCompleted, 2);
    assert.ok(second.events.some((e) => e.type === "panic_switch_active_complete"));
    assert.ok(second.events.some((e) => e.type === "panic_switch_endurance_started"));
  });

  it("completes endurance only while visible", () => {
    const enduranceState = activeState(1_000);
    enduranceState.phase = "endurance";
    enduranceState.cycleStartedAtMs = null;
    enduranceState.cyclesCompleted = 2;
    enduranceState.resetsSuccessful = 2;
    enduranceState.enduranceStartedAtMs = 2_000;
    enduranceState.lastTickAtMs = 2_000;
    const hiddenTick = tickPanicSwitch(enduranceState, 2_900, false, testConfig).state;
    assert.equal(hiddenTick.enduranceElapsedVisibleMs, 0);
    const visibleTick = tickPanicSwitch(hiddenTick, 4_200, true, testConfig).state;
    assert.equal(visibleTick.phase, "endurance");
    const complete = tickPanicSwitch(visibleTick, 6_300, true, testConfig);
    assert.equal(complete.state.phase, "completed");
    assert.equal(complete.events[0]?.type, "panic_switch_endurance_complete");
  });

  it("reports warning and countdown in derived view", () => {
    const state = activeState();
    const derived = derivePanicSwitchState(state, 1_900, testConfig);
    assert.equal(derived.warningActive, true);
    assert.equal(derived.countdownSeconds, 1);
  });

  it("unlocks riddle clues progressively and sets riddle ready", () => {
    const state = activeState();
    const first = pressPanicSwitch(state, 1_850, testConfig).state;
    const second = pressPanicSwitch(first, 2_700, testConfig).state;
    assert.equal(second.phase, "endurance");
    assert.ok(second.riddleCluesUnlocked.includes("signal"));
    assert.ok(second.riddleCluesUnlocked.includes("timing"));
    assert.equal(second.riddleTrackUnlockedAtMs, null);

    const afterEndurance = tickPanicSwitch(second, 14 * 60_000, true, {
      ...testConfig,
      enduranceMs: 20 * 60_000,
    }).state;
    assert.ok(afterEndurance.riddleCluesUnlocked.includes("patience"));
    assert.notEqual(afterEndurance.riddleTrackUnlockedAtMs, null);
    const derived = derivePanicSwitchState(afterEndurance, 14 * 60_000, {
      ...testConfig,
      enduranceMs: 20 * 60_000,
    });
    assert.equal(derived.riddleReady, true);
  });
});
