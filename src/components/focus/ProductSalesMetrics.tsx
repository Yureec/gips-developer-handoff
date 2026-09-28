import { AccessibleProgressBar } from '../AccessibleProgressBar';
import { MetricValue } from '../Typography';
import { percentage, rubles, salesProgress, type ProductSales, type SalesPeriod } from '../../domain/focus';

export function ProductSalesMetrics({ sales, period, compact = false }: { sales: ProductSales; period: SalesPeriod; compact?: boolean }) {
  const { completion, runRate } = salesProgress(sales, period);
  return <div className={`focus-sales${compact ? ' focus-sales--compact' : ''}`}>
    <dl>
      <div><dt>Факт за месяц</dt><dd><MetricValue as="span" variant={compact ? 'inline' : 'display'}>{rubles(sales.actual)}</MetricValue></dd></div>
      <div><dt>План на месяц</dt><dd><MetricValue as="span" variant={compact ? 'inline' : 'display'}>{rubles(sales.plan)}</MetricValue></dd></div>
      <div><dt><abbr title="Прогноз выполнения плана к концу месяца по рабочим дням">RR</abbr></dt><dd className={runRate === null ? '' : runRate >= 100 ? 'focus-positive' : 'focus-negative'}><MetricValue as="span" variant={compact ? 'inline' : 'display'}>{percentage(runRate)}</MetricValue></dd></div>
    </dl>
    {completion !== null && <div className="focus-sales__progress">
      <AccessibleProgressBar label={`Фактическое выполнение плана: ${percentage(completion)}`} value={Math.min(100, Math.max(0, completion))} size={4} view="positive" />
      <span>Выполнено {percentage(completion)} плана</span>
    </div>}
  </div>;
}
