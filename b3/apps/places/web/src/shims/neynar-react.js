/** Stub for optional @neynar/react peer when NEYNAR is not configured. */
function NeynarContextProvider({ children }) {
  return children ?? null;
}

function NeynarAuthButton() {
  return null;
}

module.exports = { NeynarContextProvider, NeynarAuthButton };
