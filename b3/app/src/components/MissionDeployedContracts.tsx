import { useReadContract } from "wagmi";
import type { Address } from "viem";
import { Building2, ExternalLink } from "lucide-react";
import { agentShareCampaignAbi } from "@/lib/agent-share-abi";
import { getAgentShareCampaignAddress } from "@/lib/agent-share-env";
import {
  BCD_SYMBOL,
  getBcdGenesisClaimAddress,
  getBcdSaleAddress,
  getBcdTokenAddress,
} from "@/lib/bcd-config";
import { getCampaignAddress } from "@/lib/campaign";
import { explorerAddressUrl } from "@/lib/explorer";
import { getMarketplaceContractAddress } from "@/lib/marketplace-config";
import { getPitNftContractAddress } from "@/lib/pit-nft-config";
import { raffleCampaignAbi } from "@bc/contracts-sdk";
import { getDefaultChain } from "@/lib/chains";

function AddrLink({
  chainId,
  address,
  label,
}: {
  chainId: number;
  address: Address;
  label: string;
}) {
  const href = explorerAddressUrl(chainId, address);
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/25 px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-widest text-zinc-600">{label}</p>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="mt-1 flex items-start gap-2 break-all font-mono text-[11px] text-zinc-300 hover:text-white"
      >
        <span className="min-w-0 flex-1">{address}</span>
        <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600" aria-hidden />
      </a>
    </div>
  );
}

/** Mission page: show live Base addresses from env + on-chain treasury / liquidity vault. */
export function MissionDeployedContracts() {
  /** Contracts in env are deployed on this chain (`VITE_EVM_NETWORK`). */
  const chainId = getDefaultChain().id;
  const raffle = getCampaignAddress();
  const agent = getAgentShareCampaignAddress();
  const bcd = getBcdTokenAddress();
  const genesis = getBcdGenesisClaimAddress();
  const sale = getBcdSaleAddress();
  const marketplace = getMarketplaceContractAddress();
  const pitOrPrimary = getPitNftContractAddress();
  const dailyRaw = import.meta.env.VITE_DAILY_CHECKIN_ADDRESS as string | undefined;
  const daily =
    dailyRaw && /^0x[a-fA-F0-9]{40}$/.test(dailyRaw) ? (dailyRaw as Address) : undefined;
  const thirdwebVaultId =
    typeof import.meta.env.VITE_VAULT_ID === "string" ? import.meta.env.VITE_VAULT_ID.trim() : "";

  const { data: raffleTreasury } = useReadContract({
    chainId,
    address: raffle,
    abi: raffleCampaignAbi,
    functionName: "treasury",
    query: { enabled: !!raffle },
  });

  const { data: agentTreasury } = useReadContract({
    chainId,
    address: agent,
    abi: agentShareCampaignAbi,
    functionName: "treasury",
    query: { enabled: !!agent },
  });

  const { data: liquidityVault } = useReadContract({
    chainId,
    address: agent,
    abi: agentShareCampaignAbi,
    functionName: "liquidityVault",
    query: { enabled: !!agent },
  });

  const anyConfigured =
    !!raffle ||
    !!agent ||
    !!bcd ||
    !!genesis ||
    !!sale ||
    !!marketplace ||
    !!pitOrPrimary ||
    !!daily ||
    !!thirdwebVaultId;

  return (
    <section className="rounded-3xl border border-[rgb(212_175_55/0.18)] bg-gradient-to-br from-[rgb(212_175_55/0.06)] via-black/40 to-black/80 p-6 md:p-8">
      <div className="flex items-start gap-3">
        <Building2 className="mt-0.5 h-6 w-6 shrink-0 text-[var(--vault-gold)]" aria-hidden />
        <div className="min-w-0 flex-1 space-y-3">
          <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
            Vault &amp; live contracts
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            These addresses match your production env (Base). The{" "}
            <strong className="text-zinc-200">liquidity vault</strong> is the on-chain recipient for
            the LP slice of agent-share mints — set at deploy time on{" "}
            <span className="font-mono text-zinc-500">AgentShareCampaign</span>. To deploy a fresh
            stack or point mints at a new vault, run{" "}
            <span className="font-mono text-zinc-500">forge script script/DeployAll.s.sol</span>{" "}
            with <span className="font-mono text-zinc-500">LIQUIDITY_VAULT</span> (treasury or
            multisig) before broadcast, then update{" "}
            <span className="font-mono text-zinc-500">VITE_*</span> addresses here.
          </p>
        </div>
      </div>

      {!anyConfigured ? (
        <p className="mt-6 text-sm text-amber-200/90">
          No contract env vars detected — set{" "}
          <span className="font-mono text-zinc-400">VITE_RAFFLE_CAMPAIGN_ADDRESS</span>,{" "}
          <span className="font-mono text-zinc-400">VITE_AGENT_SHARE_CAMPAIGN_ADDRESS</span>,{" "}
          <span className="font-mono text-zinc-400">VITE_BCD_*</span>, etc. in{" "}
          <span className="font-mono text-zinc-400">.env</span>.
        </p>
      ) : (
        <div className="mt-6 space-y-6">
          {raffle ? (
            <div className="space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Raffle tickets · RaffleTicketCampaign
              </p>
              <AddrLink chainId={chainId} address={raffle} label="Contract" />
              {raffleTreasury && typeof raffleTreasury === "string" ? (
                <AddrLink
                  chainId={chainId}
                  address={raffleTreasury as Address}
                  label="Treasury (native)"
                />
              ) : null}
            </div>
          ) : null}

          {agent ? (
            <div className="space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Agent shares · AgentShareCampaign
              </p>
              <AddrLink chainId={chainId} address={agent} label="Contract" />
              {agentTreasury && typeof agentTreasury === "string" ? (
                <AddrLink chainId={chainId} address={agentTreasury as Address} label="Treasury" />
              ) : null}
              {liquidityVault && typeof liquidityVault === "string" ? (
                <AddrLink
                  chainId={chainId}
                  address={liquidityVault as Address}
                  label="Liquidity vault (LP ETH recipient)"
                />
              ) : null}
            </div>
          ) : null}

          {sale ? (
            <div className="space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                BCD fixed-price sale · BCDFixedPriceSale
              </p>
              <AddrLink chainId={chainId} address={sale} label="Contract" />
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            {bcd ? (
              <AddrLink chainId={chainId} address={bcd} label={`${BCD_SYMBOL} token`} />
            ) : null}
            {genesis ? (
              <AddrLink chainId={chainId} address={genesis} label="BCD genesis claim" />
            ) : null}
            {marketplace ? (
              <AddrLink chainId={chainId} address={marketplace} label="Marketplace (thirdweb)" />
            ) : null}
            {pitOrPrimary ? (
              <AddrLink chainId={chainId} address={pitOrPrimary} label="Primary NFT collection" />
            ) : null}
            {daily ? (
              <AddrLink chainId={chainId} address={daily} label="Daily check-in (optional)" />
            ) : null}
          </div>

          {thirdwebVaultId ? (
            <div className="rounded-xl border border-white/[0.06] bg-black/25 px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-widest text-zinc-600">
                Thirdweb vault ID (treasury / ops)
              </p>
              <p className="mt-1 break-all font-mono text-[11px] text-zinc-400">
                {thirdwebVaultId}
              </p>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
