export type ProfileBadge = {
  id: string;
  label: string;
  tone: "lime" | "cyan" | "amber" | "purple" | "emerald";
};

export type ProfileGamification = {
  level: number;
  xp: number;
  xpInLevel: number;
  xpToNextLevel: number;
  progressPercent: number;
  badges: ProfileBadge[];
};

function badge(id: string, label: string, tone: ProfileBadge["tone"]): ProfileBadge {
  return { id, label, tone };
}

export function computeProfileGamification(input: {
  culturePoints?: number;
  cultureScore?: number;
  bcidBuilder?: number;
  bcidTrust?: number;
  bcidContribution?: number;
  bcidVerification?: number;
  credentialCount?: number;
  bcidCredentialCount?: number;
  isFounding?: boolean;
  hasBcid?: boolean;
  humanVerified?: boolean;
  platformCount?: number;
  questCount?: number;
}): ProfileGamification {
  const culturePoints = input.culturePoints ?? 0;
  const cultureScore = input.cultureScore ?? 0;
  const builder = input.bcidBuilder ?? Math.round(cultureScore * 10);
  const trust = input.bcidTrust ?? 0;
  const contribution = input.bcidContribution ?? 0;
  const verification = input.bcidVerification ?? 0;

  const xp =
    culturePoints +
    builder * 12 +
    trust * 4 +
    contribution * 6 +
    verification * 8 +
    (input.credentialCount ?? 0) * 25 +
    (input.bcidCredentialCount ?? 0) * 40 +
    (input.platformCount ?? 0) * 15 +
    (input.questCount ?? 0) * 10;

  const level = Math.max(1, Math.floor(Math.sqrt(xp / 40)));
  const levelFloor = (level - 1) * (level - 1) * 40;
  const levelCeil = level * level * 40;
  const xpInLevel = xp - levelFloor;
  const xpToNextLevel = Math.max(1, levelCeil - levelFloor);
  const progressPercent = Math.min(100, Math.round((xpInLevel / xpToNextLevel) * 100));

  const badges: ProfileBadge[] = [];
  badges.push(badge("level", `Level ${level}`, "lime"));

  if (input.isFounding) badges.push(badge("founding", "Founding", "amber"));
  if (input.hasBcid) badges.push(badge("bcid", "BCID", "cyan"));
  if (input.humanVerified) badges.push(badge("human", "Verified Human", "emerald"));
  if ((input.credentialCount ?? 0) >= 2) badges.push(badge("creds", "Credentialed", "purple"));
  if (builder >= 50) badges.push(badge("builder", "Top Builder", "lime"));
  if ((input.platformCount ?? 0) >= 3) badges.push(badge("graph", "Multi-chain", "cyan"));

  return {
    level,
    xp,
    xpInLevel,
    xpToNextLevel,
    progressPercent,
    badges,
  };
}
