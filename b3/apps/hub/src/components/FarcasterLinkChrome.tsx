import { ConnectFarcasterButton } from "@bc/culture-auth/react";

/** Floating Farcaster link — same pattern as BuyBccButton. */
export function FarcasterLinkChrome() {
  return (
    <div className="fixed bottom-20 right-4 z-40 max-w-[200px]">
      <ConnectFarcasterButton label="Link Farcaster" className="shadow-lg" />
    </div>
  );
}
