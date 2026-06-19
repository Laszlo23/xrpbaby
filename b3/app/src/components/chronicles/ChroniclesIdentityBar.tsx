import { WalletIdentityBar } from "@/components/identity/WalletIdentityBar";

/** Sticky identity bar for chronicles routes. */
export function ChroniclesIdentityBar() {
  return (
    <div className="sticky top-0 z-40 border-b border-white/[0.06] bg-black/80 px-4 py-2 backdrop-blur-md md:px-10">
      <WalletIdentityBar className="!justify-start" />
    </div>
  );
}
