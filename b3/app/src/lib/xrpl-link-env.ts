/** XRPL ↔ Culture ID link policy flags. */

function isProductionRuntime(): boolean {
  return (process.env.NODE_ENV ?? "").trim() === "production";
}

export function xrplLinkRequireSignature(): boolean {
  if (xrplLinkTestBypassEnabled()) return false;
  return (process.env.XRPL_LINK_REQUIRE_SIGNATURE ?? "1").trim() === "1";
}

export function xrplLinkTestBypassEnabled(): boolean {
  if (isProductionRuntime()) return false;
  return process.env.XRPL_LINK_TEST_BYPASS === "1";
}
