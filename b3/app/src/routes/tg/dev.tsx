import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { pageHead } from "@/lib/seo";

type ApiResult = {
  status: number;
  body: unknown;
};

export const Route = createFileRoute("/tg/dev")({
  head: () =>
    pageHead({
      title: "Telegram Dev Console",
      description: "Internal Telegram Mini App API development console.",
      path: "/tg/dev",
      noIndex: true,
    }),
  component: TelegramDevPage,
});

function TelegramDevPage() {
  const [devUserId, setDevUserId] = useState("123456789");
  const [tonWallet, setTonWallet] = useState("UQDemoTonWalletAddress");
  const [taskId, setTaskId] = useState("daily_checkin");
  const [questId, setQuestId] = useState("q_tg_connect_wallet");
  const [moduleId, setModuleId] = useState("m_xrp_liquidity_basics");
  const [gratitudeType, setGratitudeType] = useState("support");
  const [gratitudeNote, setGratitudeNote] = useState("Thank you for helping the community grow.");
  const [xrpAmount, setXrpAmount] = useState("10");
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      "x-telegram-dev-user": devUserId,
    }),
    [devUserId],
  );

  async function callApi(path: string, method: "GET" | "POST", body?: unknown) {
    setLoading(true);
    try {
      const res = await fetch(path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      const text = await res.text();
      let parsed: unknown = text;
      try {
        parsed = JSON.parse(text);
      } catch {
        // Keep raw text.
      }
      setResult({ status: res.status, body: parsed });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">Telegram Mini App Dev Console</h1>
        <p className="text-sm opacity-80">
          Local testing helper for Telegram endpoints. In non-production, API routes accept the
          <code className="mx-1 rounded bg-black/5 px-1 py-0.5">x-telegram-dev-user</code> header.
        </p>
      </section>

      <section className="rounded border p-4 space-y-3">
        <label className="block text-sm font-medium">Telegram Dev User ID</label>
        <input
          className="w-full rounded border px-3 py-2"
          value={devUserId}
          onChange={(e) => setDevUserId(e.target.value)}
          placeholder="123456789"
        />
      </section>

      <section className="rounded border p-4 space-y-3">
        <h2 className="text-lg font-semibold">Auth + Profile</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            className="rounded bg-black text-white px-3 py-2 text-sm"
            onClick={() => callApi("/api/tg/auth", "POST", {})}
            disabled={loading}
          >
            POST /api/tg/auth
          </button>
          <button
            type="button"
            className="rounded bg-black text-white px-3 py-2 text-sm"
            onClick={() => callApi("/api/tg/me", "GET")}
            disabled={loading}
          >
            GET /api/tg/me
          </button>
        </div>
      </section>

      <section className="rounded border p-4 space-y-3">
        <h2 className="text-lg font-semibold">Community Arcade (new)</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            className="rounded bg-black text-white px-3 py-2 text-sm"
            onClick={() => callApi("/api/tg/home", "GET")}
            disabled={loading}
          >
            GET /api/tg/home
          </button>
          <button
            type="button"
            className="rounded bg-black text-white px-3 py-2 text-sm"
            onClick={() => callApi("/api/tg/tasks", "GET")}
            disabled={loading}
          >
            GET /api/tg/tasks
          </button>
          <button
            type="button"
            className="rounded bg-black text-white px-3 py-2 text-sm"
            onClick={() => callApi("/api/tg/leaderboard", "GET")}
            disabled={loading}
          >
            GET /api/tg/leaderboard
          </button>
        </div>
        <input
          className="w-full rounded border px-3 py-2"
          value={taskId}
          onChange={(e) => setTaskId(e.target.value)}
          placeholder="daily_checkin"
        />
        <button
          type="button"
          className="rounded bg-black text-white px-3 py-2 text-sm"
          onClick={() => callApi("/api/tg/tasks/complete", "POST", { taskId })}
          disabled={loading}
        >
          POST /api/tg/tasks/complete
        </button>
      </section>

      <section className="rounded border p-4 space-y-3">
        <h2 className="text-lg font-semibold">TON + Quests (legacy)</h2>
        <input
          className="w-full rounded border px-3 py-2"
          value={tonWallet}
          onChange={(e) => setTonWallet(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            className="rounded bg-black text-white px-3 py-2 text-sm"
            onClick={() =>
              callApi("/api/tg/wallet/ton-connected", "POST", {
                walletAddress: tonWallet,
                walletApp: "tonkeeper",
              })
            }
            disabled={loading}
          >
            POST ton-connected
          </button>
          <button
            type="button"
            className="rounded bg-black text-white px-3 py-2 text-sm"
            onClick={() => callApi("/api/tg/quests", "GET")}
            disabled={loading}
          >
            GET /api/tg/quests
          </button>
        </div>
        <input
          className="w-full rounded border px-3 py-2"
          value={questId}
          onChange={(e) => setQuestId(e.target.value)}
        />
        <button
          type="button"
          className="rounded bg-black text-white px-3 py-2 text-sm"
          onClick={() => callApi("/api/tg/quests/claim", "POST", { questId })}
          disabled={loading}
        >
          POST /api/tg/quests/claim
        </button>
      </section>

      <section className="rounded border p-4 space-y-3">
        <h2 className="text-lg font-semibold">Learning + XRP</h2>
        <button
          type="button"
          className="rounded bg-black text-white px-3 py-2 text-sm"
          onClick={() => callApi("/api/tg/learn/modules", "GET")}
          disabled={loading}
        >
          GET /api/tg/learn/modules
        </button>
        <button
          type="button"
          className="rounded bg-black text-white px-3 py-2 text-sm"
          onClick={() =>
            callApi("/api/tg/learn/complete", "POST", {
              moduleId,
              proof: { quizScore: 85, gratitudeType, gratitudeNote },
            })
          }
          disabled={loading}
        >
          POST learn/complete
        </button>
        <button
          type="button"
          className="rounded bg-black text-white px-3 py-2 text-sm"
          onClick={() =>
            callApi(
              `/api/market/xrp-quote?base=XRP&quote=USD&amount=${encodeURIComponent(xrpAmount)}&mode=learn`,
              "GET",
            )
          }
          disabled={loading}
        >
          GET xrp-quote
        </button>
      </section>

      <pre className="rounded bg-black text-white p-3 text-xs overflow-auto">
        {JSON.stringify(result, null, 2)}
      </pre>
    </main>
  );
}
