import type { Address } from "viem";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { cultureChronicles1155Abi } from "@bc/contracts-sdk";
import { CHRONICLE_EDITION_COUNT } from "@/content/culture-chronicles";

function parseAddress(raw: string | undefined): Address | undefined {
  const v = raw?.trim() ?? "";
  if (!/^0x[a-fA-F0-9]{40}$/.test(v)) return undefined;
  return v as Address;
}

function resolveChroniclesAddress(): Address | undefined {
  return (
    parseAddress(process.env.VITE_CULTURE_CHRONICLES_ADDRESS) ||
    parseAddress(process.env.CULTURE_CHRONICLES_ADDRESS)
  );
}

function chronicleClient() {
  const rpc =
    process.env.BCC_TREASURY_RPC_URL?.trim() ||
    process.env.BASE_RPC_URL?.trim() ||
    "https://mainnet.base.org";
  return createPublicClient({ chain: base, transport: http(rpc) });
}

export async function walletOwnsChronicleEdition(
  address: Address,
  editionId: number,
): Promise<{ ok: boolean; error?: string; balance?: bigint }> {
  const contract = resolveChroniclesAddress();
  if (!contract) {
    return { ok: false, error: "chronicles_not_configured" };
  }
  if (editionId < 1 || editionId > CHRONICLE_EDITION_COUNT) {
    return { ok: false, error: "invalid_edition" };
  }
  try {
    const balance = await chronicleClient().readContract({
      address: contract,
      abi: cultureChronicles1155Abi,
      functionName: "balanceOf",
      args: [address, BigInt(editionId)],
    });
    if (balance === 0n) {
      return { ok: false, error: "chronicle_not_owned" };
    }
    return { ok: true, balance };
  } catch {
    return { ok: false, error: "chronicle_read_failed" };
  }
}

export async function walletChronicleOwnedCount(address: Address): Promise<{
  ok: boolean;
  error?: string;
  count?: number;
}> {
  const contract = resolveChroniclesAddress();
  if (!contract) {
    return { ok: false, error: "chronicles_not_configured" };
  }
  let count = 0;
  try {
    const client = chronicleClient();
    for (let editionId = 1; editionId <= CHRONICLE_EDITION_COUNT; editionId++) {
      const balance = await client.readContract({
        address: contract,
        abi: cultureChronicles1155Abi,
        functionName: "balanceOf",
        args: [address, BigInt(editionId)],
      });
      if (balance > 0n) count += 1;
    }
    return { ok: true, count };
  } catch {
    return { ok: false, error: "chronicle_read_failed" };
  }
}

const EDITION_TASK_RE = /^chronicle-mint-edition-(\d+)$/;

export function parseChronicleEditionTaskSlug(taskSlug: string): number | undefined {
  const m = EDITION_TASK_RE.exec(taskSlug);
  if (!m) return undefined;
  const n = Number(m[1]);
  if (!Number.isInteger(n) || n < 1 || n > CHRONICLE_EDITION_COUNT) return undefined;
  return n;
}
