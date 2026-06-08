import { blockExplorerUrl, targetChain } from "@/modules/art/lib/chains";
import { hubAddress, isHubConfigured } from "@/modules/art/lib/contracts";

export function ArtFooter() {
  const contractHref = isHubConfigured
    ? `${blockExplorerUrl}/address/${hubAddress}`
    : "https://docs.base.org";

  return (
    <footer className="hairline border-t px-6 py-12 text-xs uppercase tracking-[0.25em] text-muted-foreground md:px-16">
      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-6">
        <p>© Building Culture · Edition 01 · {targetChain.name}</p>
        <div className="flex flex-wrap gap-6 md:gap-8">
          <a
            href={contractHref}
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-foreground"
          >
            Contract
          </a>
          <a
            href="https://app.buildingcultureid.space/"
            className="transition hover:text-foreground"
          >
            Identity
          </a>
          <a href="/faq" className="transition hover:text-foreground">
            FAQ
          </a>
        </div>
      </div>
    </footer>
  );
}
