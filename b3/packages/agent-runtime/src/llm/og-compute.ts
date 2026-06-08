import type { LlmMessage } from "./run.js";

/** 0G Compute Router — OpenAI-compatible, billed in 0G tokens from wallet-funded on-chain balance. */
export type OgRouterConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
  network: "mainnet" | "testnet";
  mode: "router" | "direct";
};

export function resolveOgRouterConfig(): OgRouterConfig | null {
  const routerKey =
    process.env.OG_COMPUTE_ROUTER_API_KEY?.trim() ||
    process.env.ZERO_G_ROUTER_API_KEY?.trim() ||
    process.env.OG_ROUTER_API_KEY?.trim();

  const directKey = process.env.OG_COMPUTE_DIRECT_API_KEY?.trim();
  const directUrl = process.env.OG_COMPUTE_DIRECT_URL?.trim();

  const network =
    process.env.OG_COMPUTE_NETWORK?.trim().toLowerCase() === "testnet" ? "testnet" : "mainnet";

  const model =
    process.env.OG_COMPUTE_MODEL?.trim() ||
    process.env.AGENT_LLM_MODEL?.trim() ||
    "zai-org/GLM-5-FP8";

  if (routerKey) {
    const baseUrl =
      process.env.OG_COMPUTE_ROUTER_URL?.trim() ||
      (network === "testnet"
        ? "https://router-api-testnet.integratenetwork.work/v1"
        : "https://router-api.0g.ai/v1");
    return {
      baseUrl: baseUrl.replace(/\/$/, ""),
      apiKey: routerKey,
      model,
      network,
      mode: "router",
    };
  }

  if (directKey && directUrl) {
    return {
      baseUrl: directUrl.replace(/\/chat\/completions\/?$/, "").replace(/\/$/, ""),
      apiKey: directKey,
      model,
      network,
      mode: "direct",
    };
  }

  return null;
}

/** Rough USD estimate for budget caps (0G is ~10x cheaper than centralized APIs). */
export function estimateOgCostUsd(totalTokens: number): number {
  const ratePer1k = Number(process.env.OG_COMPUTE_USD_PER_1K_TOKENS ?? "0.0003");
  return (totalTokens / 1000) * ratePer1k;
}

export type OgChatResult = {
  ok: boolean;
  text: string;
  totalTokens: number;
  error?: string;
};

export async function ogRouterChatCompletions(
  config: OgRouterConfig,
  messages: LlmMessage[],
): Promise<OgChatResult> {
  const url = config.baseUrl.endsWith("/chat/completions")
    ? config.baseUrl
    : `${config.baseUrl}/chat/completions`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: 0.4,
        max_tokens: 1200,
      }),
      signal: AbortSignal.timeout(120_000),
    });

    if (!res.ok) {
      const errText = await res.text();
      if (res.status === 402) {
        return {
          ok: false,
          text: "",
          totalTokens: 0,
          error:
            config.mode === "direct"
              ? "0g_insufficient_balance:0g-compute-cli_deposit"
              : "0g_insufficient_balance:deposit_0g_at_pc.0g.ai",
        };
      }
      return {
        ok: false,
        text: "",
        totalTokens: 0,
        error: `0g_${config.mode}_${res.status}:${errText.slice(0, 200)}`,
      };
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
      usage?: { total_tokens?: number };
    };

    return {
      ok: true,
      text: json.choices?.[0]?.message?.content?.trim() ?? "",
      totalTokens: json.usage?.total_tokens ?? 500,
    };
  } catch (e) {
    return {
      ok: false,
      text: "",
      totalTokens: 0,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export function ogInferenceConfigured(): boolean {
  return resolveOgRouterConfig() != null;
}
