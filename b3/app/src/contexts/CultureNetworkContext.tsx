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
import { getIdentityConfigForNetwork } from "@/lib/identity/config";
import {
  DEFAULT_IDENTITY_NETWORK_ID,
  isIdentityNetworkId,
  type IdentityNetworkId,
} from "@/lib/identity/networks";

const STORAGE_KEY = "culture_active_network";

type CultureNetworkContextValue = {
  activeNetworkId: IdentityNetworkId;
  setActiveNetworkId: (id: IdentityNetworkId) => void;
  identity: ReturnType<typeof getIdentityConfigForNetwork>;
  switchToActiveChain: () => Promise<void>;
};

const CultureNetworkContext = createContext<CultureNetworkContextValue | null>(null);

function readStoredNetwork(): IdentityNetworkId {
  if (typeof window === "undefined") return DEFAULT_IDENTITY_NETWORK_ID;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw && isIdentityNetworkId(raw)) return raw;
  return DEFAULT_IDENTITY_NETWORK_ID;
}

export function CultureNetworkProvider({ children }: { children: ReactNode }) {
  const [activeNetworkId, setActiveNetworkIdState] = useState<IdentityNetworkId>(readStoredNetwork);
  const { switchChainAsync } = useSwitchChain();

  const setActiveNetworkId = useCallback((id: IdentityNetworkId) => {
    setActiveNetworkIdState(id);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, id);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("network")?.toLowerCase();
    if (q && isIdentityNetworkId(q)) {
      setActiveNetworkId(q);
    }
  }, [setActiveNetworkId]);

  const identity = useMemo(() => getIdentityConfigForNetwork(activeNetworkId), [activeNetworkId]);

  const switchToActiveChain = useCallback(async () => {
    if (!switchChainAsync) return;
    await switchChainAsync({ chainId: identity.identityChainId });
  }, [switchChainAsync, identity.identityChainId]);

  const value = useMemo(
    () => ({
      activeNetworkId,
      setActiveNetworkId,
      identity,
      switchToActiveChain,
    }),
    [activeNetworkId, setActiveNetworkId, identity, switchToActiveChain],
  );

  return <CultureNetworkContext.Provider value={value}>{children}</CultureNetworkContext.Provider>;
}

export function useCultureNetwork(): CultureNetworkContextValue {
  const ctx = useContext(CultureNetworkContext);
  if (!ctx) {
    const id = DEFAULT_IDENTITY_NETWORK_ID;
    return {
      activeNetworkId: id,
      setActiveNetworkId: () => {},
      identity: getIdentityConfigForNetwork(id),
      switchToActiveChain: async () => {},
    };
  }
  return ctx;
}
