#!/usr/bin/env node
/**
 * Create + seed BCC/WETH volatile pool on Aerodrome (Base).
 *
 * Usage:
 *   node scripts/seed-bcc-aerodrome-pool.mjs --dry-run
 *   AERODROME_ETH_AMOUNT=0.05 node scripts/seed-bcc-aerodrome-pool.mjs
 *   AERODROME_SEED_PRIVATE_KEY=0x... AERODROME_BCC_AMOUNT=1000000 node scripts/seed-bcc-aerodrome-pool.mjs
 *
 * Env (contracts/.env or deploy/.env):
 *   PRIVATE_KEY / AERODROME_SEED_PRIVATE_KEY — signer with BCC + ETH
 *   RPC_URL / BASE_RPC_URL / BASE_MAINNET_RPC_URL
 *   AERODROME_ETH_AMOUNT — ETH side for LP (default 0.0004)
 *   AERODROME_BCC_AMOUNT — skip Uniswap swap when wallet already holds BCC
 *   AERODROME_SLIPPAGE_BPS — default 300 (3%)
 */
import { config } from "dotenv";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  formatEther,
  formatUnits,
  maxUint256,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

config({ path: resolve(ROOT, "deploy/.env") });
config({ path: resolve(ROOT, "contracts/.env") });

const DRY_RUN = process.argv.includes("--dry-run");
const BCC = "0xb890a5289f789f1346032ccc1847939e855fab07";
const WETH = "0x4200000000000000000000000000000000000006";
const AERO_ROUTER = "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43";
const AERO_FACTORY = "0x420DD381b31aEf6683db6B902084cB0FFECe40Da";
/** Base mainnet SwapRouter02 — see Uniswap v3 deployments (chain 8453). */
const UNI_ROUTER = "0x2626664c2603336E57B271c5C0b26F421741e481";
const UNI_FACTORY = "0x33128a8fC17869897dcE68Ed026d694621f6FDfD";
const UNI_FEE_TIERS = [10_000, 3_000, 500, 100];

const pk =
  process.env.AERODROME_SEED_PRIVATE_KEY?.trim() ||
  process.env.PRIVATE_KEY?.trim();
const rpc =
  process.env.BASE_RPC_URL?.trim() ||
  process.env.BASE_MAINNET_RPC_URL?.trim() ||
  process.env.RPC_URL?.trim();

const ethLp = parseEther(process.env.AERODROME_ETH_AMOUNT ?? "0.0004");
const slippageBps = Number(process.env.AERODROME_SLIPPAGE_BPS ?? "300");
const explicitBcc = process.env.AERODROME_BCC_AMOUNT?.trim();

if (!pk || !/^0x[a-fA-F0-9]{64}$/.test(pk)) {
  console.error("Set AERODROME_SEED_PRIVATE_KEY or PRIVATE_KEY in contracts/.env");
  process.exit(1);
}
if (!rpc) {
  console.error("Set BASE_RPC_URL or RPC_URL");
  process.exit(1);
}

const account = privateKeyToAccount(pk);
const publicClient = createPublicClient({ chain: base, transport: http(rpc) });
const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(rpc),
});

const erc20Abi = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ type: "address" }, { type: "uint256" }],
    outputs: [{ type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "address" }, { type: "address" }],
    outputs: [{ type: "uint256" }],
  },
];

const factoryAbi = [
  {
    name: "getPool",
    type: "function",
    stateMutability: "view",
    inputs: [{ type: "address" }, { type: "address" }, { type: "bool" }],
    outputs: [{ type: "address" }],
  },
];

const routerAbi = [
  {
    name: "quoteAddLiquidity",
    type: "function",
    stateMutability: "view",
    inputs: [
      { type: "address" },
      { type: "address" },
      { type: "bool" },
      { type: "address" },
      { type: "uint256" },
      { type: "uint256" },
    ],
    outputs: [
      { type: "uint256" },
      { type: "uint256" },
      { type: "uint256" },
    ],
  },
  {
    name: "addLiquidity",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address" },
      { type: "address" },
      { type: "bool" },
      { type: "uint256" },
      { type: "uint256" },
      { type: "uint256" },
      { type: "uint256" },
      { type: "address" },
      { type: "uint256" },
    ],
    outputs: [
      { type: "uint256" },
      { type: "uint256" },
      { type: "uint256" },
    ],
  },
  {
    name: "addLiquidityETH",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { type: "address" },
      { type: "bool" },
      { type: "uint256" },
      { type: "uint256" },
      { type: "uint256" },
      { type: "address" },
      { type: "uint256" },
    ],
    outputs: [
      { type: "uint256" },
      { type: "uint256" },
      { type: "uint256" },
    ],
  },
];

const uniRouterAbi = [
  {
    name: "exactInputSingle",
    type: "function",
    stateMutability: "payable",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "recipient", type: "address" },
          { name: "amountIn", type: "uint256" },
          { name: "amountOutMinimum", type: "uint256" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
      },
    ],
    outputs: [{ type: "uint256" }],
  },
];

const wethAbi = [
  {
    name: "deposit",
    type: "function",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
];

function minOut(amount, bps) {
  return (amount * BigInt(10_000 - bps)) / 10_000n;
}

async function readBalances(addr) {
  const [eth, bcc, weth, dec] = await Promise.all([
    publicClient.getBalance({ address: addr }),
    publicClient.readContract({
      address: BCC,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [addr],
    }),
    publicClient.readContract({
      address: WETH,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [addr],
    }),
    publicClient.readContract({
      address: BCC,
      abi: erc20Abi,
      functionName: "decimals",
    }),
  ]);
  return { eth, bcc, weth, dec };
}

async function resolveUniFee() {
  const factoryAbi = [
    {
      name: "getPool",
      type: "function",
      stateMutability: "view",
      inputs: [{ type: "address" }, { type: "address" }, { type: "uint24" }],
      outputs: [{ type: "address" }],
    },
  ];
  for (const fee of UNI_FEE_TIERS) {
    const pool = await publicClient.readContract({
      address: UNI_FACTORY,
      abi: factoryAbi,
      functionName: "getPool",
      args: [WETH, BCC, fee],
    });
    if (pool && pool !== "0x0000000000000000000000000000000000000000") {
      console.log(`Uniswap V3 pool fee tier ${fee}: ${pool}`);
      return fee;
    }
  }
  return 10_000;
}

async function swapEthForBcc(amountIn) {
  const fee = await resolveUniFee();
  const tiers = [fee, ...UNI_FEE_TIERS.filter((f) => f !== fee)];
  for (const tier of tiers) {
    try {
      const quoted = await publicClient.simulateContract({
        address: UNI_ROUTER,
        abi: uniRouterAbi,
        functionName: "exactInputSingle",
        args: [
          {
            tokenIn: WETH,
            tokenOut: BCC,
            fee: tier,
            recipient: account.address,
            amountIn,
            amountOutMinimum: 0n,
            sqrtPriceLimitX96: 0n,
          },
        ],
        value: amountIn,
        account,
      });
      if (DRY_RUN) {
        console.log(`[dry-run] would swap ${formatEther(amountIn)} ETH → BCC (fee ${tier})`);
        return amountIn;
      }
      const hash = await walletClient.writeContract({
        ...quoted.request,
        chain: base,
      });
      console.log("Uniswap swap tx", hash);
      await publicClient.waitForTransactionReceipt({ hash });
      return amountIn;
    } catch {
      /* try next fee tier */
    }
  }
  throw new Error("Uniswap swap simulation failed for all fee tiers");
}

async function ensureBccForLp(targetBcc) {
  const bal = await publicClient.readContract({
    address: BCC,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [account.address],
  });
  if (bal >= targetBcc) return bal;

  const shortfall = targetBcc - bal;
  const swapEth = parseEther(process.env.AERODROME_SWAP_ETH ?? "0.00035");
  console.log(
    `Need ~${formatUnits(shortfall, 18)} more BCC — swapping ${formatEther(swapEth)} ETH on Uniswap`,
  );
  await swapEthForBcc(swapEth);
  return publicClient.readContract({
    address: BCC,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [account.address],
  });
}

async function approveIfNeeded(token, spender, amount) {
  const allowance = await publicClient.readContract({
    address: token,
    abi: erc20Abi,
    functionName: "allowance",
    args: [account.address, spender],
  });
  if (allowance >= amount) return;
  if (DRY_RUN) {
    console.log(`[dry-run] approve ${token} → ${spender}`);
    return;
  }
  const hash = await walletClient.writeContract({
    address: token,
    abi: erc20Abi,
    functionName: "approve",
    args: [spender, maxUint256],
    chain: base,
  });
  console.log("approve tx", hash);
  await publicClient.waitForTransactionReceipt({ hash });
}

function updateDeployment(pool, lpToken) {
  const path = resolve(ROOT, "contracts/deployments/bcc-8453.json");
  if (!existsSync(path)) return;
  const j = JSON.parse(readFileSync(path, "utf8"));
  j.aerodrome = {
    ...j.aerodrome,
    enabled: true,
    pool,
    lpToken: lpToken || pool,
    gauge: j.aerodrome?.gauge || "",
    seededAt: new Date().toISOString(),
    note: "Seeded via scripts/seed-bcc-aerodrome-pool.mjs",
  };
  writeFileSync(path, `${JSON.stringify(j, null, 2)}\n`);
  console.log("Updated", path);
}

async function main() {
  const existing = await publicClient.readContract({
    address: AERO_FACTORY,
    abi: factoryAbi,
    functionName: "getPool",
    args: [WETH, BCC, false],
  });
  if (existing && existing !== "0x0000000000000000000000000000000000000000") {
    console.log("Pool already exists:", existing);
    if (!DRY_RUN) {
      updateDeployment(existing, existing);
    }
    process.exit(0);
  }

  const start = await readBalances(account.address);
  console.log("Signer", account.address);
  console.log("ETH", formatEther(start.eth));
  console.log("BCC", formatUnits(start.bcc, start.dec));
  console.log("WETH", formatEther(start.weth));

  const gasReserve = parseEther(process.env.AERODROME_GAS_RESERVE ?? "0.00025");
  if (start.eth < ethLp + gasReserve) {
    console.error(
      `Insufficient ETH: need ≥${formatEther(ethLp + gasReserve)} (LP ${formatEther(ethLp)} + gas reserve ${formatEther(gasReserve)})`,
    );
    console.error(
      "Fund the signer or set AERODROME_SEED_PRIVATE_KEY to treasury wallet with BCC + ETH.",
    );
    console.error("Treasury (31M BCC): 0x502ce9FB1814cb03843967EC5E0D8F6AA3A3C2e1 — needs ~0.01+ ETH for WETH side.",
    );
    process.exit(1);
  }

  let bccDesired = explicitBcc ? parseEther(explicitBcc) : 0n;
  if (bccDesired === 0n) {
    let quoted = false;
    try {
      const [qA, qB] = await publicClient.readContract({
        address: AERO_ROUTER,
        abi: routerAbi,
        functionName: "quoteAddLiquidity",
        args: [WETH, BCC, false, AERO_FACTORY, ethLp, 0n],
      });
      if (qB > 0n) {
        console.log(`Router quote: ${formatEther(qA)} WETH + ${formatUnits(qB, 18)} BCC`);
        bccDesired = qB;
        quoted = true;
      }
    } catch {
      console.log("No existing pool — pricing BCC from Uniswap DexScreener");
    }
    if (!quoted) {
      const priceRes = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${BCC}`,
      ).then((r) => r.json());
      const uni = priceRes.pairs?.find((p) =>
        (p.dexId ?? "").toLowerCase().includes("uniswap"),
      );
      const price = Number(uni?.priceUsd ?? 0);
      const ethUsd = Number(process.env.ETH_USD ?? "3200");
      if (price > 0) {
        const ethSide = Number(formatEther(ethLp));
        const bccUsd = ethSide * ethUsd;
        const bccAmt = bccUsd / price;
        bccDesired = parseEther(bccAmt.toFixed(6));
        console.log(`Quoted BCC from Uniswap price (~$${price}): ${formatUnits(bccDesired, 18)}`);
      } else {
        bccDesired = parseEther("5000000");
        console.log("Using default 5M BCC for initial pool ratio");
      }
    }
  }

  const bccBal = DRY_RUN ? 0n : await ensureBccForLp(bccDesired);
  const bccUse = DRY_RUN ? bccDesired : bccBal < bccDesired ? bccBal : bccDesired;
  const bccMin = minOut(bccUse, slippageBps);
  const ethMin = minOut(ethLp, slippageBps);

  console.log(`Depositing ${formatUnits(bccUse, 18)} BCC + ${formatEther(ethLp)} ETH`);

  await approveIfNeeded(BCC, AERO_ROUTER, bccUse);

  if (DRY_RUN) {
    console.log("[dry-run] addLiquidityETH — would create volatile BCC/WETH pool");
    return;
  }

  const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);
  const hash = await walletClient.writeContract({
    address: AERO_ROUTER,
    abi: routerAbi,
    functionName: "addLiquidityETH",
    args: [BCC, false, bccUse, bccMin, ethMin, account.address, deadline],
    value: ethLp,
    chain: base,
  });
  console.log("addLiquidityETH tx", hash);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("status", receipt.status);

  const pool = await publicClient.readContract({
    address: AERO_FACTORY,
    abi: factoryAbi,
    functionName: "getPool",
    args: [WETH, BCC, false],
  });
  console.log("New pool:", pool);
  updateDeployment(pool, pool);

  console.log("\nNext:");
  console.log("  npm run aerodrome:resolve -- --write");
  console.log("  npm run sync:vite-env");
  console.log("  Set VITE_BCC_AERODROME_GAUGE after creating gauge on Aerodrome UI");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
