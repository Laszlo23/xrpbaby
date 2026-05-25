import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type AiCoachContextValue = {
  coachOpen: boolean;
  openCoach: () => void;
  closeCoach: () => void;
  toggleCoach: () => void;
};

const AiCoachContext = createContext<AiCoachContextValue | null>(null);

export function AiCoachProvider({ children }: { children: ReactNode }) {
  const [coachOpen, setCoachOpen] = useState(false);
  const openCoach = useCallback(() => setCoachOpen(true), []);
  const closeCoach = useCallback(() => setCoachOpen(false), []);
  const toggleCoach = useCallback(() => setCoachOpen((o) => !o), []);

  const value = useMemo(
    () => ({ coachOpen, openCoach, closeCoach, toggleCoach }),
    [coachOpen, openCoach, closeCoach, toggleCoach],
  );

  return <AiCoachContext.Provider value={value}>{children}</AiCoachContext.Provider>;
}

export function useAiCoach(): AiCoachContextValue {
  const ctx = useContext(AiCoachContext);
  if (!ctx) {
    throw new Error("useAiCoach must be used within AiCoachProvider");
  }
  return ctx;
}
