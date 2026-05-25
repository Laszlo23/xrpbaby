"use client";

import { useMemo } from "react";
import { getProtocolAddresses, type ProtocolAddresses } from "@/lib/protocol-addresses";

/** Listings use Base mainnet env (`NEXT_PUBLIC_BASE_*`) via `getProtocolAddresses`. */
export function useListingsProtocolAddresses(): ProtocolAddresses {
  return useMemo(() => getProtocolAddresses(), []);
}
