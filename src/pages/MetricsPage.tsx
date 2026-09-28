import { useEffect, useRef } from 'react';
import { Button } from '@alfalab/core-components/button';
import { portalMetrics } from '../data/portalSnapshot';
import { metricHref, metricNumber, metricValues } from '../domain/metrics';
import type { RoleId } from '../domain/navigation';

export function MetricsPage({ role }: { role: RoleId }) {
  const id = new URLSearchParams(location.search).get('metric');
  const metrics = portalMetrics.filter(m => m.role === role && (!id || m.id === id));
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); document.title = 'Показатели и расчёты · ГИПС'; }, []);
  return <div className="section-page resources-page"><Button size={40} view="text" href={`?role=${role}&section=home`}>На главную</Button><h1 tabIndex={-1} ref={heading}>Показатели и расчёты</h1>
    {!metrics.length && <p>Показатель не найден или недоступен для этой роли.</p>}
    {metrics.map(metric => { const values = metricValues(metric); return <article className="section-card" key={metric.id}>
      <h2>{metric.name}</h2><p>{metric.period} · {metric.scope} · Данные на {metric.asOf ?? 'дату, которая пока не указана'}</p>
      <dl className="metric-contract"><div><dt>Факт</dt><dd>{metricNumber(values.actual, metric.unit)}</dd></div><div><dt>{metric.kind === 'activation' ? 'База сравнения' : 'Цель'}</dt><dd>{metricNumber(values.target, metric.unit)}</dd></div><div><dt>{metric.kind === 'activation' ? 'Доля' : 'Выполнение'}</dt><dd>{metricNumber(values.completion, '%')}</dd></div><div><dt>Прогноз RR</dt><dd>{metricNumber(values.runRate, '%')}</dd></div><div><dt>Отклонение от цели</dt><dd>{metric.kind === 'activation' ? 'Не применяется' : metricNumber(values.deviation, metric.unit)}</dd></div></dl>
      <p>{metric.method}</p>{metric.issue && <p><strong>Требует уточнения:</strong> {metric.issue}</p>}<p>Источник: {metric.source}</p><p>Статус: {values.status === 'achieved' ? 'цель достигнута' : values.status === 'in_progress' ? 'цель ещё не достигнута' : 'оценка не определена'}</p>
      <Button size={40} view="secondary" href={metric.action.href}>{metric.action.label}</Button>
    </article>; })}
    {id && <Button size={40} view="text" href={metricHref(role)}>Все показатели роли</Button>}
  </div>;
}
