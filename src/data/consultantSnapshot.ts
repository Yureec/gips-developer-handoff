import { getPortalMetric } from './portalSnapshot';
import { metricNumber, metricValues } from '../domain/metrics';
import { percentage } from '../domain/focus';
export function consultantPercent(id: string) {
  const value = metricValues(getPortalMetric(id)).completion;
  return value === null ? '—' : `${metricNumber(Math.round(value * 10) / 10)}%`;
}
export const focusProducts = [
  ['Альфа-Капитал', '474,7 млн ₽', '420,8 млн ₽', '88,6%', '194%', true],
  ['ОТС ГИ', '5,5 млн ₽', '14 млн ₽', '253,8%', '423%', true],
  ['Персональный брокер', '101,5 млн ₽', '25,9 млн ₽', '25,5%', '58%', true],
  ['СО КИБ', '36,9 млн ₽', '22,2 млн ₽', '60%', '142%', true],
  ['Стратегия', '79,8 млн ₽', '< 0,1 млн ₽', '< 0,1%', '< 1%', false],
  ['Finlist', '55,4 млн ₽', '20,5 млн ₽', '37%', '87%', true],
];

export const kpi = ['consultant-pl', 'consultant-aum', 'consultant-fp', 'consultant-nti'].map(id => {
  const m = getPortalMetric(id), v = metricValues(m);
  return [m.name, metricNumber(v.target, m.unit), metricNumber(v.actual, m.unit), consultantPercent(id), percentage(v.runRate)];
});

export const ratingData = {
  department: {
    total: [['1', 'Алексей Воронцов', '93%'], ['2', 'Елена Соколова', '84%'], ['3', 'Алиса Орлова', '78%'], ['4', 'Игорь Мельников', '76%'], ['5', 'Анна Крылова', '72%']],
    pl: [['1', 'Елена Соколова', '91%'], ['2', 'Алексей Воронцов', '84%'], ['3', 'Игорь Мельников', '76%'], ['9', 'Алиса Орлова', '48%'], ['10', 'Анна Крылова', '46%']],
    aum: [['1', 'Игорь Мельников', '128%'], ['2', 'Алиса Орлова', '116%'], ['3', 'Алексей Воронцов', '111%'], ['4', 'Анна Крылова', '106%'], ['5', 'Елена Соколова', '101%']],
    products: [['1', 'Елена Соколова', '104%'], ['2', 'Алексей Воронцов', '91%'], ['3', 'Игорь Мельников', '83%'], ['7', 'Алиса Орлова', '66,8%'], ['8', 'Анна Крылова', '64%']],
    activity: [['1', 'Алексей Воронцов', '104%'], ['2', 'Елена Соколова', '96%'], ['3', 'Игорь Мельников', '91%'], ['5', 'Алиса Орлова', '85%'], ['6', 'Анна Крылова', '81%']],
  },
  company: {
    total: [['1', 'Александр Климов', '123%'], ['2', 'Ольга Миронова', '116%'], ['3', 'Дмитрий Нестеров', '108%'], ['12', 'Алиса Орлова', '78%'], ['13', 'Анна Крылова', '77%']],
    pl: [['1', 'Ирина Лебедева', '138%'], ['2', 'Павел Егоров', '126%'], ['3', 'Ольга Миронова', '118%'], ['74', 'Алиса Орлова', '48%'], ['75', 'Анна Крылова', '47%']],
    aum: [['1', 'Александр Климов', '152%'], ['2', 'Дмитрий Нестеров', '141%'], ['3', 'Елена Громова', '136%'], ['9', 'Алиса Орлова', '116%'], ['10', 'Алексей Воронцов', '115%']],
    products: [['1', 'Дмитрий Нестеров', '128%'], ['2', 'Елена Громова', '121%'], ['3', 'Александр Климов', '116%'], ['54', 'Алиса Орлова', '66,8%'], ['55', 'Анна Крылова', '66%']],
    activity: [['1', 'Ольга Миронова', '126%'], ['2', 'Ирина Лебедева', '118%'], ['3', 'Павел Егоров', '112%'], ['39', 'Алиса Орлова', '85%'], ['40', 'Игорь Мельников', '84%']],
  },
};

// A role's own result is identical in team/company tables and the metric details.
for (const scope of Object.values(ratingData)) {
  for (const [key, id] of [['total', 'consultant-rating'], ['pl', 'consultant-pl'], ['aum', 'consultant-aum'], ['products', 'consultant-fp']] as const) {
    const row = scope[key].find(row => row[1] === 'Алиса Орлова');
    if (row) row[2] = key === 'total' ? `${metricNumber(getPortalMetric(id).actual)}%` : consultantPercent(id);
  }
}
