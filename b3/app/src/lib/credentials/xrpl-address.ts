const XRPL_ADDRESS_RE = /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/;

export function isValidXrplAddress(address: string): boolean {
  return XRPL_ADDRESS_RE.test(address);
}
