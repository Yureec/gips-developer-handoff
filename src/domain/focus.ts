/** Explicit business-date calendar: holidays and transferred working Saturdays come from the provider. */
export interface SalesPeriod {
  month: string;
  asOf: string;
  workingDates: string[];
}
export interface ProductSales { actual: number | null; plan: number | null }
export function salesProgress(sales: ProductSales, period: SalesPeriod) {
  const dates = [...new Set(period.workingDates)].filter(date => date.startsWith(`${period.month}-`));
  const elapsed = dates.filter(date => date <= period.asOf).length;
  const total = dates.length;
  const actual = sales.actual;
  const plan = sales.plan;
  const validActual = actual !== null && Number.isFinite(actual) && actual >= 0;
  const validPlan = plan !== null && Number.isFinite(plan) && plan > 0;
  const completion = validActual && validPlan ? actual / plan * 100 : null;
  const runRate = completion !== null && elapsed > 0 && total > 0 ? completion * total / elapsed : null;
  return { completion, runRate, elapsed, total };
}
export const rubles = (value: number | null) => value === null ? 'Нет данных' : `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(value)} ₽`;
export const percentage = (value: number | null) => value === null ? '—' : `${Math.round(value)}%`;
