import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSwitchChain } from "wagmi";
import {
  CULTURE_ACTIVE_NETWORK_STORAGE_KEY,
  CULTURE_NETWORK_CHAIN_IDS,
  DEFAULT_CULTURE_NETWORK_ID,
  isCultureNetworkId,
  type CultureNetworkId,
} from "./networks.js";

type CultureNetworkContextValue = {
  activeNetworkId: CultureNetworkId;
  setActiveNetworkId: (id: CultureNetworkId) => void;
  activeChainId: number;
  switchToActiveChain: () => Promise<void>;
};

const CultureNetworkContext = createContext<CultureNetworkContextValue | null>(null);

function readStoredNetwork(): CultureNetworkId {
  if (typeof window === "undefined") return DEFAULT_CULTURE_NETWORK_ID;
  const raw = window.localStorage.getItem(CULTURE_ACTIVE_NETWORK_STORAGE_KEY);
  if (raw && isCultureNetworkId(raw)) return raw;
  return DEFAULT_CULTURE_NETWORK_ID;
}

export function CultureNetworkProvider({ children }: { children: ReactNode }) {
  const [activeNetworkId, setActiveNetworkIdState] = useState<CultureNetworkId>(readStoredNetwork);
  const { switchChainAsync } = useSwitchChain();

  const setActiveNetworkId = useCallback((id: CultureNetworkId) => {
    setActiveNetworkIdState(id);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CULTURE_ACTIVE_NETWORK_STORAGE_KEY, id);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("network")?.toLowerCase();
    if (q && isCultureNetworkId(q)) {
      setActiveNetworkId(q);
    }
  }, [setActiveNetworkId]);

  const activeChainId = CULTURE_NETWORK_CHAIN_IDS[activeNetworkId];

  const switchToActiveChain = useCallback(async () => {
    if (!switchChainAsync) return;
    await switchChainAsync({ chainId: activeChainId });
  }, [switchChainAsync, activeChainId]);

  const value = useMemo(
    () => ({
      activeNetworkId,
      setActiveNetworkId,
      activeChainId,
      switchToActiveChain,
    }),
    [activeNetworkId, setActiveNetworkId, activeChainId, switchToActiveChain],
  );

  return (
    <CultureNetworkContext.Provider value={value}>{children}</CultureNetworkContext.Provider>
  );
}

export function useCultureNetwork(): CultureNetworkContextValue {
  const ctx = useContext(CultureNetworkContext);
  if (!ctx) {
    const id = DEFAULT_CULTURE_NETWORK_ID;
    return {
      activeNetworkId: id,
      setActiveNetworkId: () => {},
      activeChainId: CULTURE_NETWORK_CHAIN_IDS[id],
      switchToActiveChain: async () => {},
    };
  }
  return ctx;
}
