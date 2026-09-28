export type ContestState = 'active' | 'upcoming' | 'ended';
export type ContestUnit = '₽' | '%' | 'шт.';
export interface ContestThreshold {
  id: string; label: string; target: number; unit: ContestUnit; comparison: 'gte' | 'gt';
}
export interface ContestGroup {
  id: string; title: string; quota: number | null; participants?: number; quotaNote?: string;
  thresholds: ContestThreshold[]; reward: string; rewardSummary?: string; rankingLabel?: string; rankingUnit?: ContestUnit;
}
export interface ContestPeriod { id: string; title: string; startsOn: string; endsOn: string }
export interface Contest {
  id: string; title: string; subtitle?: string; description: string; organizer: string;
  startsOn: string; endsOn: string; periodLabel: string; products: string[];
  image: string; dashboardImage: string; pdf: string; sourceName: string;
  audience: string; personalGroupId: string | null; participationReason?: string;
  groups: ContestGroup[]; periods: ContestPeriod[]; defaultPeriodId: string;
  rankingLabel: string; rankingUnit: ContestUnit; rankingMethod: string;
  rules: string[]; prizes: Array<{ title: string; description: string }>;
  goal: string; milestones: Array<{ title: string; value: string }>;
}
export interface ContestResultRow {
  employeeId: string; name: string; office: string; score: number;
  values: Record<string, number | null>;
  // A published source position can be preserved without inventing tie-break rules.
  rank?: number;
}
export interface ContestResults {
  contestId: string; groupId: string; periodId: string; asOf: string;
  state: 'intermediate' | 'final'; rows: ContestResultRow[];
}
export const contestEmployeeId = 'alena-sokolova';
/** Reproducible portal snapshot. Advance alongside the local result observations. */
export const contestsAsOf = '2026-09-22';
export const contestStateLabels: Record<ContestState, string> = { active: 'Идёт сейчас', upcoming: 'Скоро', ended: 'Завершён' };
export function contestState(contest: Pick<Contest, 'startsOn' | 'endsOn'>, asOf = contestsAsOf): ContestState {
  return asOf < contest.startsOn ? 'upcoming' : asOf > contest.endsOn ? 'ended' : 'active';
}
export function thresholdMet(threshold: ContestThreshold, value: number | null | undefined): boolean | null {
  if (value == null || !Number.isFinite(value)) return null;
  return threshold.comparison === 'gt' ? value > threshold.target : value >= threshold.target;
}
export function qualification(group: ContestGroup, row: ContestResultRow): 'met' | 'pending' | 'unknown' {
  const results = group.thresholds.map(t => thresholdMet(t, row.values[t.id]));
  return results.includes(false) ? 'pending' : results.includes(null) ? 'unknown' : 'met';
}
export function rankedResults(rows: ContestResultRow[]) {
  const sorted = [...rows].sort((a, b) => b.score - a.score || a.employeeId.localeCompare(b.employeeId));
  return sorted.map((row, i) => ({ ...row, rank: row.rank ?? sorted.findIndex(other => other.score === row.score) + 1, order: i }));
}
export function contestHref(id?: string, filters: Record<string, string> = {}) {
  return `?${new URLSearchParams({ role: 'mass', section: 'contest', ...filters, ...(id ? { contest: id } : {}) })}`;
}
export function contestNumber(value: number, unit?: ContestUnit) {
  return `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(value)}${unit ? ` ${unit}` : ''}`;
}
