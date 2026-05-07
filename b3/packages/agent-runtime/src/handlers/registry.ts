import type { AgentRecord, EconAgentRecord, OpsAgentRecord } from "../types.js";
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
import { runFraudWatchStubTick } from "./fraud-watch-stub.js";

export type HandlerFn = (agent: AgentRecord, dbUrl: string) => Promise<LedgerInsert | LedgerInsert[]>;

export const HANDLER_REGISTRY: Record<string, HandlerFn> = {
  newsWriter: async (a, _db) => runNewsWriterTick(a as OpsAgentRecord),
  socialScout: async (a, _db) => runSocialScoutTick(a as OpsAgentRecord),
  agsDistributor: async (a, db) => runAgsDistributorTick(a as EconAgentRecord, db),
  slackDigest: async (a, db) => runSlackDigestTick(a as OpsAgentRecord, db),
  raffleWatcher: async (a, db) => runRaffleWatcherTick(a as OpsAgentRecord, db),
  treasuryGuardian: async (a, _db) => runTreasuryGuardianTick(a as OpsAgentRecord),
  leaderboardUpdater: async (a, db) => runLeaderboardUpdaterTick(a as OpsAgentRecord, db),
  seoPublisher: async (a, _db) => runSeoPublisherTick(a as OpsAgentRecord),
  x402Monetizer: async (a, _db) => runX402MonetizerTick(a as OpsAgentRecord),
  fraudWatchStub: async (a, _db) => runFraudWatchStubTick(a as OpsAgentRecord),
};
