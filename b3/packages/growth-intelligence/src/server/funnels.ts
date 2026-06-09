export type FunnelStepDef = {
  id: string;
  label: string;
  /** Match page_view pathname prefix */
  pathname?: string;
  /** Match click/rage_click selector substring */
  selectorContains?: string;
  /** Match event kind exactly */
  eventKind?: string;
};

export type DefaultFunnelTemplate = {
  name: string;
  steps: FunnelStepDef[];
};

/** Shared onboarding funnel — works across BC ecosystem apps. */
export const DEFAULT_ECOSYSTEM_FUNNEL: DefaultFunnelTemplate = {
  name: "Core Onboarding",
  steps: [
    { id: "landing", label: "Landing", eventKind: "page_view", pathname: "/" },
    { id: "explore", label: "Explore", eventKind: "page_view", pathname: "/join" },
    { id: "wallet", label: "Wallet Connect", selectorContains: "connect" },
    { id: "identity", label: "Identity / Pass", pathname: "/pass" },
    { id: "hub", label: "Forest Hub", pathname: "/forest" },
  ],
};

export type FunnelStepResult = {
  id: string;
  label: string;
  sessions: number;
  conversionFromPrevious: number | null;
  dropoffPct: number | null;
};

export type FunnelAnalysisResult = {
  funnelName: string;
  totalSessions: number;
  steps: FunnelStepResult[];
  biggestLeak: { stepId: string; label: string; dropoffPct: number } | null;
};

type SessionEvent = {
  kind: string;
  pathname: string;
  selector: string | null;
};

function stepMatches(ev: SessionEvent, step: FunnelStepDef): boolean {
  if (step.eventKind && ev.kind !== step.eventKind) return false;
  if (step.pathname) {
    if (ev.kind !== "page_view" && !step.selectorContains) return false;
    if (!ev.pathname.startsWith(step.pathname)) return false;
  }
  if (step.selectorContains) {
    const sel = (ev.selector ?? "").toLowerCase();
    if (!sel.includes(step.selectorContains.toLowerCase())) return false;
  }
  return true;
}

/** Compute funnel conversion per step from raw session events. */
export function analyzeFunnelFromSessions(
  funnelName: string,
  steps: FunnelStepDef[],
  sessions: Map<string, SessionEvent[]>,
): FunnelAnalysisResult {
  const totalSessions = sessions.size;
  const reached = steps.map(() => 0);

  for (const events of sessions.values()) {
    let stepIdx = 0;
    for (const ev of events) {
      while (stepIdx < steps.length && stepMatches(ev, steps[stepIdx]!)) {
        reached[stepIdx]! += 1;
        stepIdx += 1;
      }
    }
  }

  const stepResults: FunnelStepResult[] = steps.map((step, i) => {
    const sessionsAtStep = reached[i]!;
    const prev = i === 0 ? totalSessions : reached[i - 1]!;
    const conversionFromPrevious =
      prev > 0 ? Math.round((sessionsAtStep / prev) * 1000) / 10 : null;
    const dropoffPct =
      conversionFromPrevious != null ? Math.round((100 - conversionFromPrevious) * 10) / 10 : null;
    return {
      id: step.id,
      label: step.label,
      sessions: sessionsAtStep,
      conversionFromPrevious,
      dropoffPct,
    };
  });

  let biggestLeak: FunnelAnalysisResult["biggestLeak"] = null;
  for (const s of stepResults) {
    if (s.dropoffPct != null && s.dropoffPct > 0) {
      if (!biggestLeak || s.dropoffPct > biggestLeak.dropoffPct) {
        biggestLeak = { stepId: s.id, label: s.label, dropoffPct: s.dropoffPct };
      }
    }
  }

  return { funnelName, totalSessions, steps: stepResults, biggestLeak };
}
