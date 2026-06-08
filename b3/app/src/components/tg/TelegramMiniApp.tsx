import { useCallback, useEffect, useState } from "react";
import { THEME, TonConnectUIProvider } from "@tonconnect/ui-react";
import { Link } from "@tanstack/react-router";
import {
  tgAuth,
  tgCompleteTask,
  tgHome,
  tgTasks,
  type TgHomeResponse,
  type TgTasksResponse,
} from "@/lib/tg/api";
import {
  getTonConnectActionsConfiguration,
  getTonConnectManifestUrl,
  getTonConnectWalletsListConfiguration,
} from "@/lib/tg/ton-connect-config";
import {
  isTelegramWebApp,
  readTelegramStartParam,
  TELEGRAM_MINIAPP_BOT_URL,
  waitForTelegramInitData,
} from "@/lib/tg/telegram-webapp";
import { TgTabBar, type TgTab } from "@/components/tg/TgTabBar";
import { TgHomeTab } from "@/components/tg/TgHomeTab";
import { TgPlayTab } from "@/components/tg/TgPlayTab";
import { TgRankTab } from "@/components/tg/TgRankTab";
import { TgXpToast } from "@/components/tg/TgXpToast";

function TelegramMiniAppInner() {
  const [initDataRaw, setInitDataRaw] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const inTelegram = sdkReady && isTelegramWebApp();
  const startParam = readTelegramStartParam();
  const [home, setHome] = useState<TgHomeResponse | null>(null);
  const [tasksData, setTasksData] = useState<TgTasksResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TgTab>("home");
  const [playTaskId, setPlayTaskId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [xpToast, setXpToast] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const raw = await waitForTelegramInitData();
      if (cancelled) return;
      setInitDataRaw(raw);
      setSdkReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    const [homeRes, tasksRes] = await Promise.all([tgHome(initDataRaw), tgTasks(initDataRaw)]);
    if (homeRes.ok) setHome(homeRes.data);
    if (tasksRes.ok) setTasksData(tasksRes.data);
  }, [initDataRaw]);

  useEffect(() => {
    if (!sdkReady) return;
    void (async () => {
      setLoading(true);
      setError(null);
      const auth = await tgAuth(initDataRaw);
      if (!auth.ok) {
        setError(auth.error);
        setLoading(false);
        return;
      }
      await refresh();
      setLoading(false);
    })();
  }, [sdkReady, initDataRaw, refresh]);

  async function handleHomeMission() {
    if (!home?.currentMission) return;
    const mission = home.currentMission;
    if (mission.kind === "tap") {
      setBusy(true);
      const res = await tgCompleteTask(mission.id, undefined, initDataRaw);
      setBusy(false);
      if (res.ok && res.data.xpGranted > 0) setXpToast(`+${res.data.xpGranted} XP`);
      await refresh();
      return;
    }
    setPlayTaskId(mission.id);
    setTab("play");
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0c0d12] text-zinc-400">
        Loading the grove…
      </div>
    );
  }

  if (error) {
    const needsBot =
      error === "missing_init_data" || error === "telegram_not_configured" || !inTelegram;
    return (
      <div className="min-h-dvh bg-[#0c0d12] p-6 text-center text-zinc-300">
        <p className="text-lg font-semibold text-white">Telegram session unavailable</p>
        <p className="mt-2 text-sm text-red-400">{error}</p>
        {needsBot ? (
          <p className="mt-4 text-sm text-zinc-400">
            Open from the bot menu in Telegram — not Safari/Chrome directly.
          </p>
        ) : null}
        {needsBot ? (
          <a
            href={TELEGRAM_MINIAPP_BOT_URL}
            className="mt-4 inline-block rounded-xl bg-[#C5FF41] px-4 py-2 text-sm font-semibold text-black"
          >
            Open @buildingcultureappbot
          </a>
        ) : null}
        {!inTelegram && import.meta.env.DEV ? (
          <p className="mt-4 text-xs text-zinc-500">
            Local dev: set <code>VITE_TELEGRAM_DEV_USER_ID</code> and restart dev server.
          </p>
        ) : null}
        {!inTelegram ? (
          <Link to="/join" className="mt-6 block text-sm text-[#C5FF41] underline">
            Or continue in the web app
          </Link>
        ) : null}
      </div>
    );
  }

  if (!home || !tasksData) return null;

  const agentRef = startParam?.startsWith("ref_") ? startParam.slice(4) : startParam || "telegram";

  return (
    <div className="min-h-dvh bg-[#0c0d12] px-4 pb-24 pt-4 text-zinc-100">
      <TgXpToast message={xpToast} onDone={() => setXpToast(null)} />

      <header className="mb-4 space-y-1">
        <p className="text-xs uppercase tracking-widest text-[#C5FF41]">Building Culture</p>
        <h1 className="text-xl font-semibold text-white">One person. One block.</h1>
        <p className="text-xs text-zinc-500">Play daily · climb the board · grow the grove</p>
      </header>

      {tab === "home" ? (
        <TgHomeTab
          home={home}
          initDataRaw={initDataRaw}
          busy={busy}
          onMissionAction={() => void handleHomeMission()}
          onRefresh={() => void refresh()}
          onXp={setXpToast}
          agentRef={agentRef}
        />
      ) : null}

      {tab === "play" ? (
        <TgPlayTab
          tasksData={tasksData}
          initDataRaw={initDataRaw}
          initialTaskId={playTaskId}
          onClearInitialTask={() => setPlayTaskId(null)}
          onRefresh={refresh}
          onXp={setXpToast}
          onSwitchHome={() => setTab("home")}
        />
      ) : null}

      {tab === "rank" ? <TgRankTab initDataRaw={initDataRaw} /> : null}

      <TgTabBar active={tab} onChange={setTab} />
    </div>
  );
}

export function TelegramMiniApp() {
  return (
    <TonConnectUIProvider
      manifestUrl={getTonConnectManifestUrl()}
      actionsConfiguration={getTonConnectActionsConfiguration()}
      walletsListConfiguration={getTonConnectWalletsListConfiguration()}
      uiPreferences={{ theme: THEME.DARK }}
    >
      <TelegramMiniAppInner />
    </TonConnectUIProvider>
  );
}
