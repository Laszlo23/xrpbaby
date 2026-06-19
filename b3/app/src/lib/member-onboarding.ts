/** First-time member checklist + post-join prompts (browser localStorage). */

export const MEMBER_CHECKLIST_KEY = "bc_member_checklist_v1";
export const POST_JOIN_PACK_DISMISSED_KEY = "bc_post_join_pack_dismissed_v1";

export type ChecklistStepId = "identity" | "first-quest" | "first-drop" | "grove";

export type MemberChecklist = Record<ChecklistStepId, boolean>;

const DEFAULT_CHECKLIST: MemberChecklist = {
  identity: false,
  "first-quest": false,
  "first-drop": false,
  grove: false,
};

export function loadMemberChecklist(): MemberChecklist {
  if (typeof window === "undefined") return { ...DEFAULT_CHECKLIST };
  try {
    const raw = localStorage.getItem(MEMBER_CHECKLIST_KEY);
    if (!raw) return { ...DEFAULT_CHECKLIST };
    const parsed = JSON.parse(raw) as Partial<MemberChecklist>;
    return { ...DEFAULT_CHECKLIST, ...parsed };
  } catch {
    return { ...DEFAULT_CHECKLIST };
  }
}

export function saveMemberChecklist(next: MemberChecklist): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MEMBER_CHECKLIST_KEY, JSON.stringify(next));
}

export function markChecklistStep(step: ChecklistStepId): MemberChecklist {
  const current = loadMemberChecklist();
  const next = { ...current, [step]: true };
  saveMemberChecklist(next);
  return next;
}

export function checklistCompleteCount(steps: MemberChecklist): number {
  return (Object.keys(steps) as ChecklistStepId[]).filter((k) => steps[k]).length;
}

export function isPostJoinPackDismissed(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(POST_JOIN_PACK_DISMISSED_KEY) === "1";
}

export function dismissPostJoinPack(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(POST_JOIN_PACK_DISMISSED_KEY, "1");
}
