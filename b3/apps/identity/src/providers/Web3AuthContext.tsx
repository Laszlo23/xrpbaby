"use client";

import { createContext, useContext } from "react";

type Web3AuthContextValue = {
  /** True when Privy + CultureAuthProvider mounted without error. */
  privyActive: boolean;
};

export const Web3AuthContext = createContext<Web3AuthContextValue>({
  privyActive: false,
});

export function useWeb3Auth() {
  return useContext(Web3AuthContext);
}
