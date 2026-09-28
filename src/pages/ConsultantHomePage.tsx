import { consultantPercent, focusProducts, kpi, ratingData } from '../data/consultantSnapshot';
import { Button } from '@alfalab/core-components/button';
import { consultantBase, getPortalMetric } from '../data/portalSnapshot';
import { metricHref, metricValues, metricNumber } from '../domain/metrics';
import { useState } from 'react';
import { Switch } from '@alfalab/core-components/switch';

import { AccessibleProgressBar } from '../components/AccessibleProgressBar';
import { StatusTag } from '../components/PagePrimitives';
import { DataTable, MetricCards, RoleHero, RoleMetricValue, RoleSection, RoleSelect, RoleTabs } from '../components/RolePrimitives';
import { ContestWidget } from '../components/widgets/ContestWidget';
import type { ConsultantData, DashboardData } from '../data/provider';
import type { SectionId } from '../domain/navigation';

type RatingScope = keyof typeof ratingData;
type RatingMetric = keyof typeof ratingData.department;

export function ConsultantHomePage({ data, contests, onNavigate }: {
  data: ConsultantData;
  contests: DashboardData['contests'];
  onNavigate: (section: SectionId) => void;
}) {
  const [focusActive, setFocusActive] = useState(true);
  const [scope, setScope] = useState<RatingScope>('department');
  const [metric, setMetric] = useState<RatingMetric>('total');
  return (
    <div className="role-page consultant-page">
      <RoleHero image={data.employee.image} title="Алиса Орлова" subtitle="Отдел продаж инвестиционных продуктов №2 · Москва · Офис «Тверская»" tags={[{ label: 'III квартал 2026', tone: 'violet' }, { label: 'Уровень · Эксперт' }, { label: '4 ачивки', tone: 'gold' }]} metrics={[{ label: 'Общий KPI', value: metricNumber(getPortalMetric('consultant-total').actual, '%'), detail: 'Методика уточняется' }, { label: 'KPI R/R', value: '102%' }, { label: 'Место', value: '12 / 186' }]} />
      <Button size={40} view="text" href={metricHref('consultant')}>Показатели, периоды и расчёты</Button>
      <div className="role-grid role-grid--2">
        <ContestWidget columnSpan={1} contests={contests} itemLabel="Конкурс ИК" onOpen={() => onNavigate('contest')} />
        <RoleSection variant="dashboard" title="Фокусные продукты" eyebrow="РЕЗУЛЬТАТ КВАРТАЛА" action={<StatusTag tone="green">5 из 6 активировано</StatusTag>}>
          <DataTable variant="focus-products" label="Фокусные продукты" headings={['Продукт', 'План', 'Факт', '%', 'R/R', 'Активация']}>
            {focusProducts.map((row) => <tr className={row[5] ? undefined : 'is-risk'} key={String(row[0])}>{row.slice(0, 5).map((cell, index) => index === 0 ? <th scope="row" key={`${row[0]}-${index}`}>{String(cell)}</th> : <td key={`${row[0]}-${index}`}>{String(cell)}</td>)}<td><StatusTag tone={row[5] ? 'green' : 'red'}>{row[5] ? 'Активирован' : 'Не активирован'}</StatusTag></td></tr>)}
            <tr className="is-total"><th scope="row">Итого</th><td>753,8 млн ₽</td><td>503,3 млн ₽</td><td>{consultantPercent('consultant-fp')}</td><td>{getPortalMetric('consultant-fp').reportedForecast}%</td><td>—</td></tr>
          </DataTable>
        </RoleSection>
      </div>
      <RoleSection variant="content" title="Результат квартала" eyebrow="ОБНОВЛЕНО 18.08">
        <div className="freshness-row" aria-label="Свежесть данных"><StatusTag tone="green">PL · 18.08</StatusTag><StatusTag tone="green">AUM · 18.08</StatusTag><StatusTag tone="green">ФП · 18.08</StatusTag><StatusTag tone="green">NTI · 18.08</StatusTag></div>
        <DataTable label="Ключевые показатели квартала" headings={['Показатель', 'План', 'Факт', 'Выполнение', 'R/R']}>{kpi.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={`${row[0]}-${index}`}>{cell}</td>)}</tr>)}</DataTable>
      </RoleSection>
      <div className="role-grid role-grid--2-1">
        <RoleSection variant="dashboard" title="Secure" eyebrow="ВРЕМЕННЫЙ ФОКУС" action={<Switch checked={focusActive} compact controlPosition="end" label={focusActive ? 'Активен' : 'Скрыт'} size={20} onChange={(_, payload) => setFocusActive(payload.checked)} />}>
          {focusActive ? <MetricCards items={[{ label: 'План', value: '18' }, { label: 'Факт', value: '12' }, { label: 'Выполнение', value: '67%', progress: 67 }, { label: 'Осталось', value: '6 продаж' }]} /> : <p className="role-empty">Временный фокус скрыт. Включите его, чтобы увидеть текущую механику.</p>}
        </RoleSection>
        <RoleSection variant="dashboard" title="Клиентская база" eyebrow="ДОЛЯ КЛИЕНТОВ С ИНВЕСТИЦИЯМИ"><RoleMetricValue>{consultantBase.invested} / {consultantBase.total}</RoleMetricValue><AccessibleProgressBar label="Доля клиентов с инвестициями: 77,2%" value={metricValues(getPortalMetric('consultant-base')).completion ?? 0} view="positive" size={8} /><dl className="role-inline-stats"><div><dt>Всего клиентов</dt><dd>{consultantBase.total}</dd></div><div><dt>С инвестициями</dt><dd>{consultantBase.invested}</dd></div><div><dt>Без инвестиций</dt><dd>{consultantBase.total - consultantBase.invested}</dd></div></dl></RoleSection>
      </div>
      <MetricCards items={[{ label: 'Купили', value: '42', detail: 'клиента' }, { label: 'Новый iAUM', value: '58,4 млн ₽' }, { label: 'Выведено', value: '9 млн ₽' }, { label: 'Средний PL / клиент', value: '1,8 млн ₽', detail: '+9%' }, { label: 'Средний ФП / клиент', value: '1,4', detail: 'цель 1,5' }]} />
      <RoleSection variant="content" title="Рейтинг" eyebrow="ПОЗИЦИЯ В КОМАНДЕ И КОМПАНИИ" action={<div className="ik-rating-controls"><RoleTabs compact ariaLabel="Масштаб рейтинга" options={[{ id: 'department', label: 'Отдел' }, { id: 'company', label: 'Компания' }]} value={scope} onChange={(value) => setScope(value as RatingScope)} /><RoleSelect label="Метрика" value={metric} options={[{ key: 'total', content: 'Рейтинговый итог' }, { key: 'pl', content: 'PL' }, { key: 'aum', content: 'AUM' }, { key: 'products', content: 'Продукты' }, { key: 'activity', content: 'Активность' }]} onChange={(value) => setMetric(value as RatingMetric)} /></div>}>
        <DataTable label="Рейтинг инвестиционного консультанта" headings={['Место', 'Сотрудник', 'Результат']}>{ratingData[scope][metric].map((row) => <tr className={row[1] === 'Алиса Орлова' ? 'is-current' : undefined} key={`${scope}-${metric}-${row[0]}`}>{row.map((cell, index) => <td key={`${row[0]}-${index}`}>{cell}</td>)}</tr>)}</DataTable>
      </RoleSection>
      <div className="role-grid role-grid--2">
        <RoleSection variant="dashboard" title="Коммуникации и встречи" eyebrow="АВГУСТ"><MetricCards items={[{ label: 'Коммуникации · неделя', value: '18', detail: 'было 14' }, { label: 'Коммуникации · месяц', value: '54', detail: '+13%' }, { label: 'Встречи · неделя', value: '4', detail: 'было 3' }, { label: 'Встречи · месяц', value: '12', detail: '+20%' }]} /></RoleSection>
        <RoleSection variant="dashboard" title="Лиды" eyebrow="ТЕКУЩИЙ ПЕРИОД"><MetricCards items={[{ label: 'От ИК', value: '14' }, { label: 'К ИК', value: '9' }, { label: 'В работе', value: '7' }, { label: 'Успешно закрыто', value: '4' }]} /></RoleSection>
      </div>
      <RoleSection variant="content" title="Стандарты активности" eyebrow="SFA"><MetricCards items={[{ label: 'Коммуникации SFA', value: '186' }, { label: 'Встречи', value: '42' }, { label: 'Уникальные клиенты · коммуникации', value: '110' }, { label: 'Уникальные клиенты · встречи', value: '38' }, { label: 'Звонки', value: '—' }]} /></RoleSection>
    </div>
  );
}
