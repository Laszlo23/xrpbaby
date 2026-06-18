export function countChecklistItems(content: string): number {
  return content
    .split("\n")
    .filter((line) => /^- \[ \]/.test(line.trim())).length;
}

export function isChecklistComplete(content: string, checked: number[]): boolean {
  const count = countChecklistItems(content);
  if (count === 0) return true;
  for (let i = 0; i < count; i++) {
    if (!checked.includes(i)) return false;
  }
  return true;
}
