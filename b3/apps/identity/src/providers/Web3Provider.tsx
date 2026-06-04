"use client";

import { Component, useEffect, useState, type ErrorInfo, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/config/wagmi";
import { Web3AuthContext } from "@/providers/Web3AuthContext";

function MarkPrivyActive({ onActive }: { onActive: () => void }) {
  useEffect(() => {
    onActive();
  }, [onActive]);
  return null;
}

class AuthErrorBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Web3 auth error:", error, info);
    this.props.onError();
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

/**
 * Wagmi mounts synchronously so the landing page never waits on the Privy bundle.
 * Privy upgrades the tree in the background when the culture-auth chunk loads.
 */
export function Web3Provider({ children }: { children: ReactNode }) {
  const [CultureAuthProvider, setCultureAuthProvider] = useState<
    typeof import("@bc/culture-auth/react").CultureAuthProvider | null
  >(null);
  const [tryPrivy, setTryPrivy] = useState(true);
  const [privyActive, setPrivyActive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void import("@bc/culture-auth/react")
      .then((m) => {
        if (!cancelled) setCultureAuthProvider(() => m.CultureAuthProvider);
      })
      .catch((err) => {
        console.warn("Culture auth bundle failed to load:", err);
        if (!cancelled) setTryPrivy(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const wagmiShell = (
    <WagmiProvider config={wagmiConfig} reconnectOnMount>
      {children}
    </WagmiProvider>
  );

  if (!CultureAuthProvider || !tryPrivy) {
    return (
      <Web3AuthContext.Provider value={{ privyActive: false }}>
        {wagmiShell}
      </Web3AuthContext.Provider>
    );
  }

  return (
    <Web3AuthContext.Provider value={{ privyActive }}>
      <AuthErrorBoundary
        onError={() => {
          setTryPrivy(false);
          setPrivyActive(false);
        }}
      >
        <CultureAuthProvider
          mode="privy"
          fallbackWagmiConfig={wagmiConfig}
          includeQueryClient={false}
          accentColor="#C5FF41"
        >
          <MarkPrivyActive onActive={() => setPrivyActive(true)} />
          {children}
        </CultureAuthProvider>
      </AuthErrorBoundary>
    </Web3AuthContext.Provider>
  );
}
