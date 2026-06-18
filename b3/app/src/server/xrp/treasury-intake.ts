import {
  getXrplNetwork,
  getXrplRpcUrl,
  getXrplTreasuryIntakeAddress,
  isXrplExecutionAllowed,
  xrplExplorerTxUrl,
} from "@/lib/xrpl-env";

export type XrplIntakePayment = {
  hash: string;
  amountXrp: string;
  from: string;
  ledgerIndex: number;
  explorerUrl: string;
};

export type XrplIntakeStatus = {
  ok: true;
  network: ReturnType<typeof getXrplNetwork>;
  intakeAddress: string | null;
  executionAllowed: boolean;
  balanceXrp: string | null;
  recentPayments: XrplIntakePayment[];
  disclaimer: string;
};

let clientPromise: Promise<import("xrpl").Client> | null = null;

async function getXrplClient(): Promise<import("xrpl").Client> {
  if (!clientPromise) {
    clientPromise = (async () => {
      const { Client } = await import("xrpl");
      const client = new Client(getXrplRpcUrl());
      await client.connect();
      return client;
    })();
  }
  return clientPromise;
}

export async function fetchXrplAccountBalance(address: string): Promise<string | null> {
  try {
    const client = await getXrplClient();
    const response = await client.request({
      command: "account_info",
      account: address,
      ledger_index: "validated",
    });
    const drops = response.result.account_data.Balance;
    const { dropsToXrp } = await import("xrpl");
    return `${dropsToXrp(drops)} XRP`;
  } catch {
    return null;
  }
}

export async function getXrplIntakeStatus(limit = 10): Promise<XrplIntakeStatus> {
  const intakeAddress = getXrplTreasuryIntakeAddress();
  const network = getXrplNetwork();
  const executionAllowed = isXrplExecutionAllowed();

  if (!intakeAddress || !executionAllowed) {
    return {
      ok: true,
      network,
      intakeAddress,
      executionAllowed,
      balanceXrp: intakeAddress ? await fetchXrplAccountBalance(intakeAddress) : null,
      recentPayments: [],
      disclaimer:
        "XRPL testnet demo only — not an investment offer. Mainnet requires counsel and multisig policy.",
    };
  }

  const balanceXrp = await fetchXrplAccountBalance(intakeAddress);
  const recentPayments = await fetchRecentIntakePayments(intakeAddress, limit);

  return {
    ok: true,
    network,
    intakeAddress,
    executionAllowed,
    balanceXrp,
    recentPayments,
    disclaimer:
      "Testnet only — demo rail for diligence. Building Culture is not an XRP project. Not an investment offer.",
  };
}

async function fetchRecentIntakePayments(
  intakeAddress: string,
  limit: number,
): Promise<XrplIntakePayment[]> {
  try {
    const client = await getXrplClient();
    const { dropsToXrp } = await import("xrpl");
    const response = await client.request({
      command: "account_tx",
      account: intakeAddress,
      ledger_index_min: -1,
      ledger_index_max: -1,
      limit: Math.min(limit, 25),
      forward: false,
    });

    const payments: XrplIntakePayment[] = [];
    for (const row of response.result.transactions ?? []) {
      const tx = row.tx as {
        TransactionType?: string;
        Account?: string;
        Destination?: string;
        Amount?: string;
      };
      const hash = row.hash ?? "";
      if (tx.TransactionType !== "Payment") continue;
      if (tx.Destination !== intakeAddress) continue;
      if (typeof tx.Amount !== "string") continue;
      payments.push({
        hash,
        amountXrp: `${dropsToXrp(tx.Amount)} XRP`,
        from: tx.Account ?? "—",
        ledgerIndex: row.tx.ledger_index ?? 0,
        explorerUrl: hash ? xrplExplorerTxUrl(hash) : "",
      });
      if (payments.length >= limit) break;
    }
    return payments;
  } catch {
    return [];
  }
}
