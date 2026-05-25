import { keccak256, stringToBytes } from "viem";

/** OpenZeppelin AccessControl default admin role (bytes32(0)). */
export const DEFAULT_ADMIN_ROLE =
  "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

export const REGISTRAR_ROLE = keccak256(stringToBytes("REGISTRAR_ROLE")) as `0x${string}`;
export const COMPLIANCE_ADMIN_ROLE = keccak256(stringToBytes("COMPLIANCE_ADMIN_ROLE")) as `0x${string}`;
