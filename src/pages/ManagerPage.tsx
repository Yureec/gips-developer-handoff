import { useMemo, useState } from 'react';
import { Button } from '@alfalab/core-components/button';

import { AccessibleProgressBar } from '../components/AccessibleProgressBar';
import { DataTable, MetricCards, RoleHero, RoleMetricValue, RoleSection, RoleSelect, RoleTabs } from '../components/RolePrimitives';
import { EmployeeAvatar } from '../components/EmployeeAvatar';
import { StatusTag } from '../components/PagePrimitives';
import type { ManagerData, ManagerEmployee } from '../data/provider';

const massRisks = [
  ['Кирилл Волков', '31%', '−420 тыс. ₽', '12 дней', 'риск', 'Назначить обучение'],
  ['Нина Федорова', '48%', '−260 тыс. ₽', '5 дней', 'отстаёт', 'Отправить сообщение'],
  ['Павел Смирнов', '63%', '−110 тыс. ₽', '3 дня', 'близко к плану', 'Дать аргументы'],
  ['Сергей Лебедев', '57%', '−180 тыс. ₽', '6 дней', 'отстаёт', 'Отправить материал'],
  ['Дарья Ильина', '36%', '−390 тыс. ₽', '10 дней', 'риск', 'Дать сценарий'],
  ['Татьяна Громова', '54%', '−210 тыс. ₽', '7 дней', 'отстаёт', 'Отправить сообщение'],
];

const onlyEmployees = [
  ['Дмитрий Ковалев', '87%', '89%', '104%', '108%', '96%', '92%'],
  ['Виктория Орлова', '81%', '86%', '99%', '94%', '88%', '84%'],
  ['Елена Соколова', '58%', '72%', '76%', '64%', '52%', '48%'],
  ['Максим Петров', '63%', '77%', '82%', '69%', '61%', '57%'],
];

const onlyRatings = {
  office: [['Тверская', '1', '108%', '104%', '112%'], ['Арбат', '2', '103%', '101%', '106%'], ['Ленинский', '3', '99%', '97%', '102%'], ['Смоленский', '4', '96%', '94%', '98%']],
  personal: [['Алена Соколова', '1', '91%', '112%', '118%'], ['Дмитрий Ковалев', '2', '88%', '104%', '109%'], ['Виктория Орлова', '3', '86%', '98%', '102%'], ['Елена Соколова', '4', '72%', '64%', '58%']],
  country: [['Москва', '1', '108%', '104%', '112%'], ['Дальний Восток', '2', '104%', '100%', '106%'], ['Северо-Запад', '3', '103%', '101%', '105%'], ['Сибирь', '4', '101%', '97%', '101%']],
};

type ManagerTab = 'mass' | 'only';
type RatingTab = keyof typeof onlyRatings;
type SortKey = 'runScore' | 'plan' | 'name' | 'contestRank' | 'lastSaleDays' | 'productivity';

export function ManagerPage({ data, onOpenEmployee, onOpenPartnerLog, onOpenScenario }: {
  data: ManagerData;
  onOpenEmployee: (employee: ManagerEmployee) => void;
  onOpenPartnerLog: () => void;
  onOpenScenario: (key: string) => void;
}) {
  const [tab, setTab] = useState<ManagerTab>('mass');
  const [period, setPeriod] = useState(30);
  const [sort, setSort] = useState<SortKey>('runScore');
  const [ratingTab, setRatingTab] = useState<RatingTab>('office');
  const [message, setMessage] = useState('');
  const sortedEmployees = useMemo(() => [...data.employees].sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name, 'ru');
    const aValue = a[sort] ?? 999;
    const bValue = b[sort] ?? 999;
    return sort === 'lastSaleDays' || sort === 'contestRank' ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
  }), [data.employees, sort]);

  const announce = (value: string) => setMessage(value);

  return (
    <div className="role-page manager-page">
      <RoleHero
        image={data.employee.image}
        metrics={[
          { label: 'Офис', value: 'Тверская' },
          { label: 'Регион', value: 'Москва, центральный' },
          { label: 'Кластер', value: 'Группа А' },
          { label: 'Команда', value: '14 Mass · 10 Only' },
        ]}
        title="Алексей Морозов"
        subtitle="Руководитель офиса / РУДО · Москва · Офис «Тверская»"
        tags={[{ label: 'Режим руководителя', tone: 'violet' }, { label: 'РУДО' }, { label: '24 сотрудника', tone: 'green' }]}
      />

      <RoleTabs
        ariaLabel="Направление команды"
        options={[{ id: 'mass', label: 'Mass' }, { id: 'only', label: 'Only' }]}
        value={tab}
        onChange={(value) => setTab(value as ManagerTab)}
      />

      {tab === 'mass' ? (
        <>
          <MetricCards items={[{ label: 'KPI Mass', value: '72%', detail: 'план 10 млн ₽ · факт 7,2 млн ₽', progress: 72 }, { label: 'КД Only', value: '50%', detail: 'план 4,8 млн ₽' }, { label: 'ЧП Only', value: '30%', detail: 'план 950 млн ₽' }]} />
          <div className="role-grid role-grid--2-1">
            <RoleSection variant="dashboard" title="План продаж инвестиционных продуктов" eyebrow="MASS · ИЮЛЬ 2026">
              <div className="manager-plan"><strong>7,2 млн ₽</strong><span>из 10 млн ₽</span><b>+2,8 млн ₽ за неделю</b></div>
              <AccessibleProgressBar label="Выполнение плана продаж: 72%" value={72} view="positive" size={8} />
              <dl className="role-inline-stats"><div><dt>До 100%</dt><dd>2,8 млн ₽</dd></div><div><dt>До 150%</dt><dd>7,8 млн ₽</dd></div><div><dt>Прирост сегодня</dt><dd>+520 тыс. ₽</dd></div></dl>
            </RoleSection>
            <RoleSection variant="dashboard" title="Дневной шаг" eyebrow="ТЕМП КОМАНДЫ">
              <RoleMetricValue>420 тыс. ₽</RoleMetricValue><p className="role-muted">9 рабочих дней · темп −12%</p>
              <RoleTabs
                compact
                ariaLabel="Период активности"
                options={[365, 90, 30].map((value) => ({ id: String(value), label: `${value} дней` }))}
                value={String(period)}
                onChange={(value) => setPeriod(Number(value))}
              />
              <div className="activity-map" aria-label={`Активность команды за ${period} дней`}>
                {Array.from({ length: Math.min(period, 90) }, (_, index) => <span title={`День ${index + 1}`} className={`level-${(index * 7 + 3) % 5}`} key={index} />)}
              </div>
            </RoleSection>
          </div>

          <MetricCards items={[{ label: 'Активация', value: '12 / 14', detail: '+2 за неделю' }, { label: 'Фокус-продукт', value: '8 / 14', detail: 'активированы' }, { label: 'Продуктивность', value: '72%', detail: 'план 1,8 · факт 1,3', progress: 72 }, { label: 'Нужна поддержка', value: '6', detail: 'сотрудников' }]} />

          <RoleSection variant="content" title="Сотрудники в зоне внимания" eyebrow="УПРАВЛЕНЧЕСКИЙ ФОКУС">
            <DataTable label="Сотрудники в зоне внимания" headings={['Сотрудник', 'План', 'Разрыв', 'Без продажи', 'Статус', 'Действие']}>
              {massRisks.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={cell}>{index === 4 ? <StatusTag tone={cell === 'риск' ? 'red' : 'gold'}>{cell}</StatusTag> : index === 5 ? <Button size={32} view="text" onClick={() => onOpenScenario(cell.includes('сообщение') ? 'manager-message' : cell.includes('аргумент') || cell.includes('материал') ? 'team-materials' : 'manager-assign')}>{cell}</Button> : cell}</td>)}</tr>)}
            </DataTable>
          </RoleSection>

          <div className="role-grid role-grid--3">
            <RoleSection variant="dashboard" title="Фонды без воды" eyebrow="ОБУЧЕНИЕ КОМАНДЫ"><RoleMetricValue>9 / 14</RoleMetricValue><p className="role-muted">В процессе 3 · не начали 2 · сегодня +2</p><AccessibleProgressBar label="Обучение команды: 64%" value={64} view="positive" size={8} /></RoleSection>
            <RoleSection variant="dashboard" title="Навигатор фондов" eyebrow="ФОКУС-ПРОДУКТ"><RoleMetricValue>65%</RoleMetricValue><p className="role-muted">Команда +18% · активированы 8 из 14</p><Button size={40} view="secondary" onClick={() => onOpenScenario('team-materials')}>Материалы и механики</Button></RoleSection>
            <RoleSection variant="dashboard" title="Летний фондовый марафон" eyebrow="КОНКУРС РУДО"><RoleMetricValue>7 / 42</RoleMetricValue><p className="role-muted">До следующего места +480 тыс. ₽ · приз +1,2 млн ₽</p><Button size={40} view="secondary" onClick={() => announce('Открыта детализация конкурса')}>Подробнее</Button></RoleSection>
          </div>

          <RoleSection variant="content"
            title="Команда Mass"
            eyebrow="14 СОТРУДНИКОВ"
            action={<RoleSelect label="Сортировка" value={sort} options={[{ key: 'runScore', content: 'По темпу' }, { key: 'plan', content: 'По плану' }, { key: 'name', content: 'По имени' }, { key: 'contestRank', content: 'По конкурсу' }, { key: 'lastSaleDays', content: 'По последней продаже' }, { key: 'productivity', content: 'По продуктивности' }]} onChange={(value) => setSort(value as SortKey)} />}
          >
            <DataTable label="Результаты команды Mass" headings={['Сотрудник', 'План', 'Run rate', 'Продуктивность', 'Последняя продажа', 'Конкурс']}>
              {sortedEmployees.map((item) => (
                <tr key={item.id}>
                  <th scope="row"><Button className="employee-link" leftAddons={<EmployeeAvatar id={item.id} initials={item.initials} color={item.color} />} size={32} view="text" onClick={() => onOpenEmployee(item)}>{item.name}</Button></th>
                  <td><strong>{item.plan}%</strong></td><td>{item.runrate}</td><td>{item.productivity}</td><td>{item.lastSaleDays === 0 ? 'сегодня' : `${item.lastSaleDays} дн.`}</td><td>{item.contestRank ? `№ ${item.contestRank}` : '—'}</td>
                </tr>
              ))}
            </DataTable>
          </RoleSection>

          <div className="role-grid role-grid--3">
            <RoleSection variant="dashboard" title="Вторичные кампании" eyebrow="АКТИВНОСТЬ"><RoleMetricValue>9 / 14</RoleMetricValue><p className="role-muted">Назначено 14 · отработали 9</p></RoleSection>
            <RoleSection variant="dashboard" title="Закрывающиеся депозиты" eyebrow="ПОТЕНЦИАЛ"><RoleMetricValue>18,4 млн ₽</RoleMetricValue><p className="role-muted">Активная модель продаж</p></RoleSection>
            <RoleSection variant="dashboard" title="Работа с партнёрами" eyebrow="СЛЕДУЮЩИЙ ВИЗИТ"><RoleMetricValue>Чт, 11:00</RoleMetricValue><p className="role-muted">Последний визит 5 дней назад</p><Button size={40} view="secondary" onClick={onOpenPartnerLog}>Открыть журнал</Button></RoleSection>
          </div>
          <div className="role-grid role-grid--3">
            <RoleSection variant="dashboard" title="Конкурс сотрудников" eyebrow="ВОВЛЕЧЕНИЕ"><RoleMetricValue>12 / 14</RoleMetricValue><p className="role-muted">Участвуют · активированы 10</p><Button size={40} view="secondary" onClick={() => announce('Открыта детализация конкурса сотрудников')}>Детализация</Button></RoleSection>
            <RoleSection variant="dashboard" title="Достижения команды" eyebrow="ПРИЗНАНИЕ"><ul className="role-list"><li><span>★</span>Лидерство в продажах</li><li><span>↑</span>Рост фокус-продукта</li><li><span>✓</span>Стабильный темп офиса</li></ul></RoleSection>
            <RoleSection variant="dashboard" title="Отчёты руководителя" eyebrow="БЫСТРЫЙ ДОСТУП"><div className="manager-report-list"><Button size={40} view="secondary" onClick={() => announce('Открыт отчёт SFA Mass')}>SFA Mass</Button><Button size={40} view="secondary" onClick={() => announce('Открыт отчёт по инвестициям и KPI')}>Инвестиции и KPI</Button><Button size={40} view="secondary" onClick={() => announce('Открыт отчёт по активным продажам')}>Активные продажи</Button></div></RoleSection>
          </div>
        </>
      ) : (
        <>
          <MetricCards items={[{ label: 'Сотрудники Only', value: '10', detail: 'в команде' }, { label: 'Клиенты', value: '5 000', detail: 'активная база' }, { label: 'Инвестиции', value: '5 млрд ₽' }, { label: 'Пассивы', value: '10 млрд ₽' }]} />
          <MetricCards items={[{ label: 'Комиссионный доход', value: '74%', detail: '4,8 млн ₽ · факт 3,55 млн ₽', progress: 74 }, { label: 'Чистое привлечение', value: '69%', detail: '950 млн ₽ · факт 655 млн ₽', progress: 69 }, { label: 'Фокус-продукты', value: '81%', detail: '260 млн ₽ · факт 210,6 млн ₽', progress: 81 }]} />
          <div className="role-grid role-grid--2-1">
            <RoleSection variant="dashboard" title="Дневной шаг" eyebrow="ТЕМП ONLY"><RoleMetricValue>235 тыс. ₽</RoleMetricValue><p className="role-muted">9 рабочих дней · темп −6%</p></RoleSection>
            <RoleSection variant="dashboard" title="Private Invest Sprint" eyebrow="КОНКУРС"><RoleMetricValue>4 / 36</RoleMetricValue><p className="role-muted">До 1-го места 1,4 млн ₽ КД</p><dl className="role-inline-stats"><div><dt>СК</dt><dd>78 / 92</dd></div><div><dt>Порог</dt><dd>85%</dd></div><div><dt>ЧП</dt><dd>78 / 87 млн ₽</dd></div></dl></RoleSection>
          </div>
          <RoleSection variant="content" title="Кому нужна поддержка" eyebrow="КОМАНДА ONLY">
            <DataTable label="Сотрудники Only в зоне внимания" headings={['Сотрудник', 'Прогноз', 'Run rate', 'Сигнал']}>
              <tr><td>Елена Соколова</td><td>КД 48%</td><td>СК 72%</td><td>9 дней без продажи</td></tr>
              <tr><td>Максим Петров</td><td>ФП 42%</td><td>ниже плана</td><td>ПДС / Finlist</td></tr>
              <tr><td>Татьяна Громова</td><td>СК 69%</td><td>ниже плана</td><td>нужен контроль</td></tr>
            </DataTable>
          </RoleSection>
          <MetricCards items={[{ label: 'СК', value: '82%', detail: 'план 85%' }, { label: 'RR СК', value: '96%', detail: 'план 100%' }, { label: 'Прогноз КД', value: '88%', detail: '4,22 из 4,8 млн ₽' }, { label: 'Активная база', value: '76%', detail: '3 040 из 4 000' }]} />
          <RoleSection variant="content" title="Метрики наблюдения ЧП по клиентам 3–12 млн ₽" eyebrow="ПРОДУКТОВЫЙ ФОКУС">
            <MetricCards items={[{ label: 'ПДС', value: '78%', detail: '93,6 из 120 млн ₽', progress: 78 }, { label: 'ОМС', value: '91%', detail: '63,7 из 70 млн ₽', progress: 91 }, { label: 'ЗПИФ Недвижимость', value: '64%', detail: '115,2 из 180 млн ₽', progress: 64 }, { label: 'Finlist', value: '84%', detail: '42 из 50 млн ₽', progress: 84 }]} />
          </RoleSection>
          <RoleSection variant="content" title="Рейтинг" eyebrow="СРАВНЕНИЕ РЕЗУЛЬТАТОВ" action={<RoleTabs compact ariaLabel="Вид рейтинга" options={[{ id: 'office', label: 'Офис' }, { id: 'personal', label: 'Личный' }, { id: 'country', label: 'Страна' }]} value={ratingTab} onChange={(value) => setRatingTab(value as RatingTab)} />}>
            <DataTable label="Рейтинг Only" headings={['Участник', 'Место', 'КД', 'ЧП', 'ФП']}>{onlyRatings[ratingTab].map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</DataTable>
          </RoleSection>
          <RoleSection variant="content" title="Команда Only" eyebrow="ДЕТАЛИЗАЦИЯ KPI"><DataTable label="Команда Only" headings={['Сотрудник', 'Итог', 'СК', 'КД', 'ЧП', 'ФП', 'База']}>{onlyEmployees.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</DataTable></RoleSection>
          <div className="role-grid role-grid--3">
            <RoleSection variant="dashboard" title="Большой чек и риск-профиль" eyebrow="ОБУЧЕНИЕ КОМАНДЫ"><RoleMetricValue>7 / 10</RoleMetricValue><p className="role-muted">В процессе 2 · не начал 1 · сегодня +3</p><AccessibleProgressBar label="Обучение команды Only: 70%" value={70} view="positive" size={8} /></RoleSection>
            <RoleSection variant="dashboard" title="Визит партнёра" eyebrow="В РАСПИСАНИИ"><RoleMetricValue>Пт, 15:00</RoleMetricValue><p className="role-muted">Тема: крупный чек</p><Button size={40} view="secondary" onClick={onOpenPartnerLog}>Открыть журнал</Button></RoleSection>
            <RoleSection variant="dashboard" title="Отчёты Only" eyebrow="БЫСТРЫЙ ДОСТУП"><div className="manager-report-list"><Button size={40} view="secondary" onClick={() => announce('Открыт отчёт ЧП')}>ЧП</Button><Button size={40} view="secondary" onClick={() => announce('Открыт отчёт ФП')}>ФП</Button><Button size={40} view="secondary" onClick={() => announce('Открыт отчёт КД')}>КД</Button><Button size={40} view="secondary" onClick={() => announce('Открыт отчёт по базе')}>База</Button></div></RoleSection>
          </div>
        </>
      )}
      <p className="action-feedback" role="status" aria-live="polite">{message}</p>
    </div>
  );
}
