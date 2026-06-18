export function computeBuilderScore(xp: number, achievementCount: number, streak: number): number {
  return Math.round(xp * 0.5 + achievementCount * 100 + streak * 10);
}
