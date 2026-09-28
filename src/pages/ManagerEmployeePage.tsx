import { useState } from 'react';
import { Button } from '@alfalab/core-components/button';

import { AccessibleProgressBar } from '../components/AccessibleProgressBar';
import { PageBack, StatusTag } from '../components/PagePrimitives';
import { EmployeeAvatar } from '../components/EmployeeAvatar';
import { MetricCards, RoleHero, RoleMetricValue, RoleSection } from '../components/RolePrimitives';
import type { ManagerEmployee } from '../data/provider';

const money = (value: number) => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';

export function ManagerEmployeePage({ employee, onBack, onOpenScenario }: { employee: ManagerEmployee; onBack: () => void; onOpenScenario: (key: string) => void }) {
  const bonusDelta = employee.bonus - employee.bonusPrev;
  const [message, setMessage] = useState('');
  return (
    <div className="role-page employee-profile-page">
      <PageBack label="К сводной руководителя" onClick={onBack} />
      <RoleHero
        avatar={<EmployeeAvatar className="employee-avatar--hero" id={employee.id} initials={employee.initials} color={employee.color} />}
        title={employee.name}
        subtitle={`${employee.role} · ${employee.office}`}
        tags={[{ label: 'Профиль сотрудника', tone: 'violet' }, { label: employee.office }, { label: employee.runrate, tone: employee.runScore < 2 ? 'red' : 'green' }]}
        metrics={[{ label: 'План', value: `${employee.plan}%` }, { label: 'Run rate', value: employee.runrate }, { label: 'Продуктивность', value: String(employee.productivity) }, { label: 'Конкурс', value: employee.contestRank ? `№ ${employee.contestRank}` : '—' }]}
      />
      <div className="role-grid role-grid--2-1">
        <RoleSection variant="dashboard" title="Результаты прошлых периодов" eyebrow="ДИНАМИКА">
          <div className="employee-periods">{employee.periods.map(([month, plan, sales]) => <div key={month}><strong>{month}</strong><span>{plan}</span><small>{sales}</small></div>)}</div>
        </RoleSection>
        <RoleSection variant="dashboard" title="Управленческий фокус" eyebrow="СЕЙЧАС"><p className="role-callout">{employee.focus}</p><p className="role-muted">Последняя продажа: {employee.lastSaleDays === 0 ? 'сегодня' : `${employee.lastSaleDays} дней назад`}</p></RoleSection>
      </div>
      <div className="role-grid role-grid--3">
        <RoleSection variant="dashboard" title="Обучение" eyebrow="ПРОГРЕСС"><RoleMetricValue>{employee.learning}%</RoleMetricValue><AccessibleProgressBar label={`Обучение сотрудника: ${employee.learning}%`} value={employee.learning} view={employee.learning < 60 ? 'negative' : 'positive'} size={8} /><p className="role-muted">Курсы {employee.courses} · {employee.lastCourse}</p></RoleSection>
        <RoleSection variant="dashboard" title="Оклад" eyebrow="КОМПЕНСАЦИЯ"><RoleMetricValue>{money(employee.salary)}</RoleMetricValue><p className="role-muted">Текущий фиксированный доход</p></RoleSection>
        <RoleSection variant="dashboard" title="Премия" eyebrow="ТЕКУЩИЙ ПЕРИОД"><RoleMetricValue>{money(employee.bonus)}</RoleMetricValue><p className="role-muted">Прошлый период {money(employee.bonusPrev)} · {bonusDelta >= 0 ? '+' : ''}{money(bonusDelta)}</p></RoleSection>
      </div>
      <div className="role-grid role-grid--2">
        <RoleSection variant="dashboard" title="Сигналы для руководителя" eyebrow="НА ЧТО ОБРАТИТЬ ВНИМАНИЕ"><ul className="role-list">{employee.signals.map((signal, index) => <li key={signal}><span>{index + 1}</span>{signal}</li>)}</ul></RoleSection>
        <RoleSection variant="dashboard" title="Следующий шаг" eyebrow="РЕКОМЕНДОВАННОЕ ДЕЙСТВИЕ"><p className="role-callout">{employee.nextStep}</p><div className="role-action-row"><Button size={40} view="primary" onClick={() => setMessage(`Задача для ${employee.name} создана.`)}>Поставить задачу</Button><Button size={40} view="secondary" onClick={() => onOpenScenario('team-materials')}>Отправить материал</Button></div><p className="action-feedback" role="status" aria-live="polite">{message}</p></RoleSection>
      </div>
      <MetricCards items={[{ label: 'Выполнение плана', value: `${employee.plan}%`, progress: employee.plan }, { label: 'Курсы', value: employee.courses, detail: employee.lastCourse }, { label: 'Продажи', value: String(employee.productivity), detail: 'за текущий период' }]} />
    </div>
  );
}
