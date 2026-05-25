/** Off-chain progression keyed by wallet (localStorage). Not synced across devices. */

import { dailyCultureChallenge } from "@/lib/daily-culture-challenge";
import { genesisVaultHolderQuestXp } from "@/lib/genesis-district-config";

export type PlayerProgress = {
  xp: number;
  questsCompleted: string[];
  lastDailyClaimAt: number | null;
  /** User opened Get BCD / economy primer (local flag). */
  bcdTutorialSeen?: boolean;
  /** Elias entry quiz — last chosen intent id (see `elias-intents.ts`). */
  eliasPrimaryIntent?: string | null;
  intentChosenAtEpoch?: number;
  /** Lightweight status labels for profile (e.g. `intent:explore`, `early_steward`). */
  bcBadges?: string[];
};

const KEY = "buildchain_player_v1";

function storageKey(address: string): string {
  return `${KEY}:${address.toLowerCase()}`;
}

function defaultProgress(): PlayerProgress {
  return { xp: 0, questsCompleted: [], lastDailyClaimAt: null, bcdTutorialSeen: false };
}

export function loadProgress(walletAddress: string): PlayerProgress {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const raw = localStorage.getItem(storageKey(walletAddress));
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw) as PlayerProgress;
    return {
      xp: typeof parsed.xp === "number" ? parsed.xp : 0,
      questsCompleted: Array.isArray(parsed.questsCompleted) ? parsed.questsCompleted : [],
      lastDailyClaimAt:
        typeof parsed.lastDailyClaimAt === "number" ? parsed.lastDailyClaimAt : null,
      bcdTutorialSeen: parsed.bcdTutorialSeen === true,
      eliasPrimaryIntent:
        typeof parsed.eliasPrimaryIntent === "string" ? parsed.eliasPrimaryIntent : undefined,
      intentChosenAtEpoch:
        typeof parsed.intentChosenAtEpoch === "number" ? parsed.intentChosenAtEpoch : undefined,
      bcBadges: Array.isArray(parsed.bcBadges)
        ? parsed.bcBadges.filter((b): b is string => typeof b === "string")
        : undefined,
    };
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(walletAddress: string, p: PlayerProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(walletAddress), JSON.stringify(p));
}

export function addXp(walletAddress: string, delta: number): PlayerProgress {
  const p = loadProgress(walletAddress);
  p.xp = Math.max(0, p.xp + delta);
  saveProgress(walletAddress, p);
  return p;
}

export function completeQuest(walletAddress: string, questId: string): PlayerProgress {
  const p = loadProgress(walletAddress);
  if (!p.questsCompleted.includes(questId)) {
    p.questsCompleted.push(questId);
  }
  saveProgress(walletAddress, p);
  return p;
}

/** Marks quest done and awards XP once. Returns false if already completed. */
export function completeQuestWithXp(
  walletAddress: string,
  questId: string,
  xpReward: number,
): boolean {
  const p = loadProgress(walletAddress);
  if (p.questsCompleted.includes(questId)) return false;
  p.questsCompleted.push(questId);
  p.xp += xpReward;
  saveProgress(walletAddress, p);
  return true;
}

/** +50 XP once per calendar day (local time). Optional Genesis Vault tier bonus. */
export function claimDaily(
  walletAddress: string,
  opts?: { genesisVaultBonusXp?: number; genesisDistrictBonusXp?: number },
): { ok: boolean; progress: PlayerProgress } {
  const p = loadProgress(walletAddress);
  const now = Date.now();
  const day = (t: number) => new Date(t).toDateString();
  if (p.lastDailyClaimAt !== null && day(p.lastDailyClaimAt) === day(now)) {
    return { ok: false, progress: p };
  }
  const raw =
    typeof opts?.genesisVaultBonusXp === "number"
      ? opts.genesisVaultBonusXp
      : typeof opts?.genesisDistrictBonusXp === "number"
        ? opts.genesisDistrictBonusXp
        : 0;
  const bonus = Math.max(0, raw);
  p.lastDailyClaimAt = now;
  p.xp += 50 + bonus;
  saveProgress(walletAddress, p);
  return { ok: true, progress: p };
}

/** Hold >=1 ticket on-chain → one-time quest bonus rules (called from UI after verify). */
export function grantFirstMintBonus(walletAddress: string): PlayerProgress {
  const q = "first_mint_verified";
  const p = loadProgress(walletAddress);
  if (p.questsCompleted.includes(q)) return p;
  p.questsCompleted.push(q);
  p.xp += 100;
  saveProgress(walletAddress, p);
  return p;
}

/** One-time XP after genesis BCD merkle claim (called from Mission UI after tx success). */
export function grantGenesisClaimQuest(walletAddress: string): PlayerProgress {
  const q = "bcd_genesis_claimed";
  const xpReward = 75;
  const p = loadProgress(walletAddress);
  if (p.questsCompleted.includes(q)) return p;
  p.questsCompleted.push(q);
  p.xp += xpReward;
  saveProgress(walletAddress, p);
  return p;
}

/** Credits holder quest when wallet already has BCD (e.g. return visit). Idempotent XP. */
export function grantBcdHolderQuest(walletAddress: string): PlayerProgress {
  const q = "bcd_holder";
  const xpReward = 25;
  const p = loadProgress(walletAddress);
  if (p.questsCompleted.includes(q)) return p;
  p.questsCompleted.push(q);
  p.xp += xpReward;
  saveProgress(walletAddress, p);
  return p;
}

export type GenesisVaultHolderTier = "phase0" | "phase1" | "phase2";

/** One-time XP per vault pass tier held (on-chain balance ≥ 1 on that tier's contract). */
export function grantGenesisVaultPassHolderQuest(
  walletAddress: string,
  tier: GenesisVaultHolderTier,
): PlayerProgress {
  const q = `genesis_vault_holder_${tier}`;
  const xpReward = genesisVaultHolderQuestXp(tier);
  const p = loadProgress(walletAddress);
  if (p.questsCompleted.includes(q)) return p;
  p.questsCompleted.push(q);
  p.xp += xpReward;
  saveProgress(walletAddress, p);
  return p;
}

/**
 * Legacy quest id `genesis_district_holder` (+40 XP). Kept idempotent so existing profiles keep credit.
 */
export function grantGenesisDistrictHolderQuest(walletAddress: string): PlayerProgress {
  const q = "genesis_district_holder";
  const xpReward = 40;
  const p = loadProgress(walletAddress);
  if (p.questsCompleted.includes(q)) return p;
  p.questsCompleted.push(q);
  p.xp += xpReward;
  saveProgress(walletAddress, p);
  return p;
}

/** Marks that the wallet has engaged with the BCD economy UX (Get BCD modal). Idempotent. */
export function markBcdTutorialSeen(walletAddress: string): PlayerProgress {
  const p = loadProgress(walletAddress);
  if (p.bcdTutorialSeen) return p;
  p.bcdTutorialSeen = true;
  saveProgress(walletAddress, p);
  return p;
}

const GUEST_INTENT_KEY = "bc_elias_guest_intent_v1";

export function getGuestEntryIntent(): string | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(GUEST_INTENT_KEY);
  return v?.trim() ? v.trim() : null;
}

export function setGuestEntryIntent(intentId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_INTENT_KEY, intentId);
}

export type PersistEntryIntentResult = {
  progress: PlayerProgress | null;
  /** False when wallet quest was already credited or wallet missing */
  localXpGranted: boolean;
};

/**
 * Persist entry intent (+ optional XP once). Mirrors guest intent into wallet profile on connect.
 */
export function persistEntryIntent(
  walletAddress: string | undefined,
  intentId: string,
  opts?: { xpReward?: number },
): PersistEntryIntentResult {
  const trimmed = intentId.trim();
  if (!trimmed) return { progress: null, localXpGranted: false };

  setGuestEntryIntent(trimmed);
  if (!walletAddress)
    return {
      progress: null,
      localXpGranted: false,
    };

  const w = walletAddress.toLowerCase();
  const xpReward = typeof opts?.xpReward === "number" ? opts.xpReward : 25;
  const questId = `elias_intent_${trimmed}`;
  const localXpGranted = completeQuestWithXp(w, questId, xpReward);

  const p = loadProgress(walletAddress);
  const badges = [...(p.bcBadges ?? [])];
  const tag = `intent:${trimmed}`;
  if (!badges.includes(tag)) badges.push(tag);

  const next: PlayerProgress = {
    ...p,
    eliasPrimaryIntent: trimmed,
    intentChosenAtEpoch: Date.now(),
    bcBadges: badges.length ? badges : undefined,
  };
  saveProgress(walletAddress, next);
  return { progress: next, localXpGranted };
}

/** After wallet connect — pull guest-only intent selection into keyed progress once. */
export function mergeGuestIntentIntoWallet(walletAddress: string): PlayerProgress | null {
  const guest = getGuestEntryIntent();
  if (!guest) return null;
  const p = loadProgress(walletAddress);
  if (p.eliasPrimaryIntent) return null;
  const { progress } = persistEntryIntent(walletAddress, guest, { xpReward: 25 });
  return progress;
}

/** One local XP reward per UTC day key for culture prompts (orb/profile). */
export function tryCompleteDailyCultureChallenge(walletAddress: string): boolean {
  const w = walletAddress.toLowerCase();
  const ch = dailyCultureChallenge();
  const ok = completeQuestWithXp(w, ch.questId, ch.xpReward);
  if (!ok) return false;
  const p = loadProgress(w);
  const badges = [...(p.bcBadges ?? [])];
  const tag = "culture_daily_explorer";
  if (!badges.includes(tag)) badges.push(tag);
  saveProgress(w, { ...p, bcBadges: badges });
  return true;
}
