import type { AgentRecord, EconAgentRecord, OpsAgentRecord, ProductAgentRecord } from "../types.js";
import type { LedgerInsert } from "../ledger-pg.js";
import { runNewsWriterTick } from "./news-writer.js";
import { runSocialScoutTick } from "./social-scout.js";
import { runAgsDistributorTick } from "./ags-distributor.js";
import { runSlackDigestTick } from "./slack-digest.js";
import { runRaffleWatcherTick } from "./raffle-watcher.js";
import { runTreasuryGuardianTick } from "./treasury-guardian.js";
import { runLeaderboardUpdaterTick } from "./leaderboard-updater.js";
import { runSeoPublisherTick } from "./seo-publisher.js";
import { runX402MonetizerTick } from "./x402-monetizer.js";
import { runFraudWatchTick, runEliasConciergeTick } from "./fraud-watch-stub.js";
import { runTradingSugarTick } from "./trading-sugar.js";
import { runTradingArbitrageTick } from "./trading-arbitrage.js";
import { runGroveMarketingTick } from "./grove-marketing.js";
import { runCeoOrchestratorTick } from "./ceo-orchestrator.js";

export type HandlerFn = (agent: AgentRecord, dbUrl: string) => Promise<LedgerInsert | LedgerInsert[]>;

export const HANDLER_REGISTRY: Record<string, HandlerFn> = {
  ceoOrchestrator: async (a, db) => runCeoOrchestratorTick(a as OpsAgentRecord, db),
  newsWriter: async (a, _db) => runNewsWriterTick(a as OpsAgentRecord),
  socialScout: async (a, db) => runSocialScoutTick(a as OpsAgentRecord, db),
  groveMarketing: async (a, _db) => runGroveMarketingTick(a as OpsAgentRecord),
  agsDistributor: async (a, db) => runAgsDistributorTick(a as EconAgentRecord, db),
  slackDigest: async (a, db) => runSlackDigestTick(a as OpsAgentRecord, db),
  raffleWatcher: async (a, db) => runRaffleWatcherTick(a as OpsAgentRecord, db),
  treasuryGuardian: async (a, _db) => runTreasuryGuardianTick(a as OpsAgentRecord),
  leaderboardUpdater: async (a, db) => runLeaderboardUpdaterTick(a as OpsAgentRecord, db),
  seoPublisher: async (a, db) => runSeoPublisherTick(a as OpsAgentRecord, db),
  x402Monetizer: async (a, db) => runX402MonetizerTick(a as OpsAgentRecord, db),
  fraudWatchStub: async (a, db) => runFraudWatchTick(a as OpsAgentRecord, db),
  eliasConcierge: async (a, db) => runEliasConciergeTick(a as ProductAgentRecord, db),
  tradingSugar: async (a, _db) => runTradingSugarTick(a as OpsAgentRecord),
  tradingArbitrage: async (a, _db) => runTradingArbitrageTick(a as OpsAgentRecord),
};
