import { contests } from './contests';
import { contestResults } from './contestResults';
import { contestEmployeeId, rankedResults } from '../domain/contests';
import { massInvestmentSales } from './investmentSales';
import { focusPeriod, focusSales } from './focusCatalog';
import type { PortalMetric } from '../domain/metrics';
import type { RoleId } from '../domain/navigation';

/** Accepted home baseline is the default when the user has not selected another snapshot. */
export const massGameSnapshot = {
  employeeId: 'alena-sokolova', coins: 2850, xp: 1740, level: 7, title: 'Инвест-профи',
  levelProgress: 42, nextLevelXp: 2500, streak: 6, league: 'Gold', nextLeagueCoins: 5000,
  achievements: 14, achievementsTotal: 30, asOf: null,
} as const;
const marathon = contests.find(c => c.id === 'marathon')!;
const marathonObservation = contestResults.find(r => r.contestId === marathon.id && r.groupId === marathon.personalGroupId && r.periodId === marathon.defaultPeriodId);
export const marathonSnapshot = { id: marathon.id, title: marathon.title,
  rank: rankedResults(marathonObservation?.rows ?? []).find(r => r.employeeId === contestEmployeeId)?.rank ?? null,
  participants: marathonObservation?.rows.length ?? null,
  period: marathon.periods.find(p => p.id === marathon.defaultPeriodId)!.title };

export const consultantBase = { total: 500, invested: 386, unresolvedTarget: 400 } as const;
const action = (role: RoleId, section = 'home') => ({ label: 'Вернуться к показателям', href: `?role=${role}&section=${section}` });
function metric(id: string, role: RoleId, name: string, actual: number | null, target: number | null, unit: string, extra: Partial<PortalMetric> = {}): PortalMetric {
  return { id, role, name, actual, target, unit, kind: 'sales', period: 'Период не указан', scope: 'Личные показатели', asOf: null,
    source: 'Показатели портала', method: 'Выполнение = факт / цель × 100%. Прогноз без методики не рассчитывается.', action: action(role), ...extra };
}
export const portalMetrics: PortalMetric[] = [
  metric('mass-kpi', 'mass', 'КПЭ Продажа Инвестиций', massInvestmentSales.actual, massInvestmentSales.plan, '₽', { period: 'Сентябрь 2026', asOf: focusPeriod.asOf, issue: '78% — выполнение плана, а не прогноз RR.' }),
  ...Object.entries(focusSales).map(([id, sale]) => metric(`focus-${id}`, 'mass', `Продажи · ${{ nsj: 'НСЖ «Максимум»', oms: 'ОМС «Золото»', pds: 'ПДС «Оптимальный»', 'nsj-plus': 'Максимум плюс', autofollow: 'Стратегии' }[id]}`,
    sale.actual, sale.plan, '₽', { period: 'Сентябрь 2026', asOf: focusPeriod.asOf, calendar: focusPeriod,
      source: 'Сводка продаж фокусных продуктов', method: 'Выполнение = факт / план. RR = выполнение × рабочие дни месяца / закрытые рабочие дни. Прогноз не является гарантией.',
      action: { label: 'Открыть продукт', href: `?role=mass&section=focus&product=${id}` } })),
  metric('coins', 'mass', 'Баланс инвест-коинов', massGameSnapshot.coins, null, 'I', { kind: 'balance', period: 'Текущий баланс', method: 'Доступный баланс для наград; не равен заработанному за месяц.', action: { label: 'Открыть награды', href: '?role=mass&section=marketplace' } }),
  metric('xp', 'mass', 'Опыт', massGameSnapshot.xp, massGameSnapshot.nextLevelXp, 'XP', { kind: 'score', period: 'Накопительно', method: 'Цель — накопительный порог следующего уровня. Процент внутри текущего уровня передан отдельно; нижний порог не задан.' }),
  metric('mass-coefficients', 'mass', 'Коэффициенты продуктов', null, null, '×', { kind: 'coefficient', period: 'Сентябрь 2026', source: 'Согласованная таблица коэффициентов главной Mass', issue: 'Для ПИФ — 3; ПДС — 0,75. Для НСЖ — 1,5; НСЖ «Фиксированный доход» — 1,5; стратегий — 1; ОМС — 0,75. Область применения коэффициентов требует уточнения.', method: 'Коэффициенты не участвуют в расчёте факта, прогноза или наград, пока не определены правила.' }),
  metric('mass-marathon', 'mass', 'Марафон желаний · место', marathonSnapshot.rank, null, 'место', { kind: 'score', period: marathonSnapshot.period, scope: marathonSnapshot.participants ? `${marathonSnapshot.participants} участников` : 'Стандартная сеть', method: 'Позиция в рейтинге выбранного спринта и сети. Результаты публикуются после периода охлаждения.', action: { label: 'Открыть конкурсы', href: '?role=mass&section=contest' } }),
  metric('only-driver-coefficients', 'only', 'Показатели рядом с драйверами', null, null, '', { kind: 'coefficient', period: 'III квартал 2026', asOf: '2026-07-21', issue: 'В исходных строках переданы 4 / 7, 3 / 5, 2 / 4 и 1 / 2. Название, единицы и правило расчёта не заданы. Эти дроби не интерпретируются как коэффициент, продажи или выполнение.', method: 'На карточках отображается отсутствие определённой оценки; исходные дроби сохранены в данных для уточнения.' }),
  ...[
    ['only-kd', 'КД инвест', 3800000, 4600000], ['only-fp', 'Фокусные продукты', 18600000, 25800000], ['only-cp', 'Чистое привлечение', 67100000, 110000000],
    ['observation-pds', 'Наблюдение ЧП · ПДС', 8900000, 12000000], ['observation-oms', 'Наблюдение ЧП · ОМС', 6000000, 7000000],
    ['observation-realestate', 'Наблюдение ЧП · Недвижимость', 11000000, 18000000], ['observation-finlist', 'Наблюдение ЧП · Finlist', 4600000, 5000000],
  ].map(([id, name, actual, target]) => metric(String(id), 'only', String(name), Number(actual), Number(target), '₽', {
    period: 'III квартал 2026', asOf: '2026-07-21', scope: String(id).startsWith('observation') ? 'Клиенты с капиталом 3–12 млн ₽' : 'Личные показатели Only',
    issue: id === 'only-fp' ? 'В исходном описании встречаются месяц и квартал. До уточнения используется квартальный контекст сводки; месячное сравнение не рассчитывается.' : undefined,
  })),
  metric('only-influence', 'only', 'Метрика влияния', 78, null, '%', { kind: 'score', period: 'III квартал 2026', asOf: '2026-07-21', issue: 'Состав и веса четырёх контрольных показателей не заданы. Значение сохранено без пересчёта.' }),
  metric('consultant-base', 'consultant', 'Клиенты с инвестициями', consultantBase.invested, consultantBase.total, 'клиентов', { kind: 'activation', period: 'III квартал 2026', asOf: '2026-08-18', scope: 'Клиентская база ИК', method: 'Доля клиентов с инвестициями = 386 / 500 = 77,2%. Без инвестиций: 500 − 386 = 114.', issue: 'Цель активации не определена. Значение 400 требует уточнения; доля рассчитывается от всей базы из 500 клиентов.' }),
  metric('consultant-total', 'consultant', 'Общий KPI', 35, null, '%', { kind: 'score', period: 'III квартал 2026', asOf: '2026-08-18', reportedForecast: 102, issue: 'Формула общего KPI и связь с рейтинговым итогом 78% не заданы. Это отдельные исходные показатели; общий KPI не пересчитывается из рейтинга.', method: '35% и прогноз 102% переданы в сводке. Расчёт и веса пока не определены.' }),
  metric('consultant-rating', 'consultant', 'Рейтинговый итог', 78, null, '%', { kind: 'score', period: 'III квартал 2026', asOf: '2026-08-18', issue: 'Методика рейтингового итога не задана; не используется как общий KPI.' }),
  ...[['pl', 'PL', 15700000, 32700000, 90], ['aum', 'AUM', 9000000000, 7800000000, null], ['fp', 'Фокусные продукты', 503300000, 753800000, 146], ['nti', 'NTI', 92, 100, 101]].map(([id, name, actual, target, rr]) => metric(`consultant-${id}`, 'consultant', String(name), Number(actual), Number(target), id === 'nti' ? 'ед.' : '₽', { period: 'III квартал 2026', asOf: '2026-08-18', reportedForecast: rr === null ? undefined : Number(rr), method: 'Выполнение рассчитывается из факта и плана. RR передан в квартальной сводке; календарь расчёта не задан.' })),
];
export function getPortalMetric(id: string) { const value = portalMetrics.find(m => m.id === id); if (!value) throw new Error(`Unknown metric ${id}`); return value; }
