import type { RoleId } from './navigation';
import { salesProgress, type SalesPeriod } from './focus';

export interface PortalMetric {
  id: string;
  role: RoleId;
  name: string;
  kind: 'sales' | 'activation' | 'score' | 'balance' | 'coefficient';
  actual: number | null;
  target: number | null;
  unit: string;
  period: string;
  scope: string;
  asOf: string | null;
  source: string;
  calendar?: SalesPeriod;
  reportedForecast?: number;
  method: string;
  issue?: string;
  action: { label: string; href: string };
}
const finite = (v: number | null): v is number => v !== null && Number.isFinite(v);
export function metricValues(metric: PortalMetric) {
  const actual = finite(metric.actual) ? metric.actual : null;
  const target = finite(metric.target) && metric.target > 0 ? metric.target : null;
  const completion = actual !== null && target !== null ? actual / target * 100 : null;
  const runRate = metric.kind === 'sales' && metric.calendar ? salesProgress({ actual, plan: target }, metric.calendar).runRate
    : metric.reportedForecast !== undefined && Number.isFinite(metric.reportedForecast) ? metric.reportedForecast : null;
  return { actual, target, completion, runRate, deviation: actual !== null && target !== null ? actual - target : null,
    status: metric.issue || completion === null ? 'unknown' : completion >= 100 ? 'achieved' : 'in_progress' } as const;
}
export const metricNumber = (n: number | null, unit = '') => n === null || !Number.isFinite(n) ? '—' : `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(n)}${unit ? ` ${unit}` : ''}`;
export function metricHref(role: RoleId, id?: string) { return `?${new URLSearchParams({ role, section: 'metrics', ...(id ? { metric: id } : {}) })}`; }
