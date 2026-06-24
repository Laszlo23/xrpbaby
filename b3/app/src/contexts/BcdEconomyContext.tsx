import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type GetBcdMode = "default" | "presale";

type BcdEconomyContextValue = {
  getBcdOpen: boolean;
  getBcdMode: GetBcdMode;
  openGetBcd: () => void;
  openGetBcdPresale: () => void;
  closeGetBcd: () => void;
};

const BcdEconomyContext = createContext<BcdEconomyContextValue | null>(null);

export function BcdEconomyProvider({ children }: { children: ReactNode }) {
  const [getBcdOpen, setGetBcdOpen] = useState(false);
  const [getBcdMode, setGetBcdMode] = useState<GetBcdMode>("default");

  const openGetBcd = useCallback(() => {
    setGetBcdMode("default");
    setGetBcdOpen(true);
  }, []);

  const openGetBcdPresale = useCallback(() => {
    setGetBcdMode("presale");
    setGetBcdOpen(true);
  }, []);

  const closeGetBcd = useCallback(() => {
    setGetBcdOpen(false);
    setGetBcdMode("default");
  }, []);

  const value = useMemo(
    () => ({ getBcdOpen, getBcdMode, openGetBcd, openGetBcdPresale, closeGetBcd }),
    [getBcdOpen, getBcdMode, openGetBcd, openGetBcdPresale, closeGetBcd],
  );

  return <BcdEconomyContext.Provider value={value}>{children}</BcdEconomyContext.Provider>;
}

export function useBcdEconomy(): BcdEconomyContextValue {
  const ctx = useContext(BcdEconomyContext);
  if (!ctx) {
    return {
      getBcdOpen: false,
      getBcdMode: "default",
      openGetBcd: () => {},
      openGetBcdPresale: () => {},
      closeGetBcd: () => {},
    };
  }
  return ctx;
}
