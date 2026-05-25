"use client";

import { useMemo } from "react";
import { getProtocolAddresses, type ProtocolAddresses } from "@/lib/protocol-addresses";

export type { ProtocolAddresses };

/** Base deployment addresses from env (`NEXT_PUBLIC_BASE_*`). */
export function useProtocolAddresses(): ProtocolAddresses {
  return useMemo(() => getProtocolAddresses(), []);
}
