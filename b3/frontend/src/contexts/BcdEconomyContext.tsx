import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type BcdEconomyContextValue = {
  getBcdOpen: boolean;
  openGetBcd: () => void;
  closeGetBcd: () => void;
};

const BcdEconomyContext = createContext<BcdEconomyContextValue | null>(null);

export function BcdEconomyProvider({ children }: { children: ReactNode }) {
  const [getBcdOpen, setGetBcdOpen] = useState(false);

  const openGetBcd = useCallback(() => setGetBcdOpen(true), []);
  const closeGetBcd = useCallback(() => setGetBcdOpen(false), []);

  const value = useMemo(
    () => ({ getBcdOpen, openGetBcd, closeGetBcd }),
    [getBcdOpen, openGetBcd, closeGetBcd],
  );

  return <BcdEconomyContext.Provider value={value}>{children}</BcdEconomyContext.Provider>;
}

export function useBcdEconomy(): BcdEconomyContextValue {
  const ctx = useContext(BcdEconomyContext);
  if (!ctx) {
    throw new Error("useBcdEconomy must be used within BcdEconomyProvider");
  }
  return ctx;
}
