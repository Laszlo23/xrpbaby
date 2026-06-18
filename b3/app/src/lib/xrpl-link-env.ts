/** XRPL ↔ Culture ID link policy flags. */

export function xrplLinkRequireSignature(): boolean {
  if (process.env.XRPL_LINK_TEST_BYPASS === "1") return false;
  return (process.env.XRPL_LINK_REQUIRE_SIGNATURE ?? "1").trim() === "1";
}

export function xrplLinkTestBypassEnabled(): boolean {
  return process.env.XRPL_LINK_TEST_BYPASS === "1";
}
