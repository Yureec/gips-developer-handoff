import { useState, type FormEvent } from 'react';
import { Button } from '@alfalab/core-components/button';
import { Checkbox } from '@alfalab/core-components/checkbox';
import { Input } from '@alfalab/core-components/input';

import { AccessibleProgressBar } from '../components/AccessibleProgressBar';
import { StatusTag } from '../components/PagePrimitives';
import { DataTable, MetricCards, RoleHero, RoleSection } from '../components/RolePrimitives';
import type { PartnerData } from '../data/provider';

type Office = 'Сокол' | 'Арбат' | 'Химки' | 'Тверская';
type Task = { label: string; done: boolean };

const initialTasks: Record<Office, Task[]> = {
  Сокол: [{ label: 'Провести мини-сессию до 08.08', done: true }, { label: 'Согласовать тему следующего визита', done: false }],
  Арбат: [{ label: 'Проверить рекомендации после 31.07', done: true }, { label: 'Подтвердить повторный визит через 2 недели', done: true }],
  Химки: [{ label: 'Подтвердить список новых сотрудников', done: false }],
  Тверская: [{ label: 'Собрать вопросы по крупному чеку', done: false }],
};

const visitHistory = [
  ['31.07', 'Арбат', 'Сценарии сделки', 'Проведён', '★★★★★', 'Быстрое внедрение · повтор через 2 недели'],
  ['24.07', 'Химки', 'Активация новых сотрудников', 'Проведён', '★★★★☆', 'Добавить блок про активацию и звонки'],
  ['17.07', 'Тверская', 'Крупный чек и возражения', 'Проведён', '★★★★★', 'Сильнейшие 3 живых кейса'],
  ['10.07', 'Сокол', 'Новый сотрудник', 'Перенесён', '—', 'Повторить из-за низкой активации и новой команды'],
];

export function PartnerHomePage({ data }: { data: PartnerData }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [drafts, setDrafts] = useState<Record<Office, string>>({ Сокол: '', Арбат: '', Химки: '', Тверская: '' });
  const [message, setMessage] = useState('');
  const updateTask = (office: Office, index: number) => setTasks((current) => ({ ...current, [office]: current[office].map((task, taskIndex) => taskIndex === index ? { ...task, done: !task.done } : task) }));
  const addTask = (event: FormEvent, office: Office) => {
    event.preventDefault();
    const label = drafts[office].trim();
    if (!label) return;
    setTasks((current) => ({ ...current, [office]: [...current[office], { label, done: false }] }));
    setDrafts((current) => ({ ...current, [office]: '' }));
    setMessage(`Задача по офису «${office}» добавлена.`);
  };
  return (
    <div className="role-page partner-page">
      <RoleHero image={data.employee.image} title="Юлия Волкова" subtitle="Куратор инвестиционного направления · партнёрская сеть" tags={[{ label: 'Партнёры', tone: 'violet' }, { label: '4 офиса в работе', tone: 'green' }, { label: 'Обновлено 4 августа' }]} metrics={[{ label: 'Офисы в работе', value: '4', detail: 'Тверская · Арбат · Сокол · Химки' }, { label: 'Следующий визит', value: '07.08 · Сокол', detail: '11:00' }, { label: 'Средняя активация', value: '78%', detail: 'ниже всего Сокол' }, { label: 'Средняя оценка визитов', value: '4,8 / 5' }]} />
      <div className="role-grid role-grid--2">
        <RoleSection variant="dashboard" title="Активация офисов" eyebrow="ТЕКУЩИЙ ПЕРИОД"><div className="office-progress-list">{[['Тверская', 14, 11, 84], ['Сокол', 12, 8, 67], ['Арбат', 9, 7, 78]].map(([office, total, active, progress]) => <div key={String(office)}><p><strong>{office}</strong><span>{active} из {total} · {progress}%</span></p><AccessibleProgressBar label={`Активация офиса ${office}: ${progress}%`} value={Number(progress)} view={Number(progress) < 70 ? 'negative' : 'positive'} size={8} /></div>)}</div></RoleSection>
        <RoleSection variant="dashboard" title="Ближайшие визиты" eyebrow="ПЛАН И ИСТОРИЯ"><div className="partner-visit-list"><div><time>07.08</time><p><strong>Сокол</strong><span>Запланирован · новая команда + низкая активация</span></p></div><div><time>12.08</time><p><strong>Тверская</strong><span>Запланирован · сделки + крупный чек</span></p></div><div><time>31.07</time><p><strong>Арбат</strong><span>Проведён · обратная связь зафиксирована</span></p></div><div><time>24.07</time><p><strong>Химки</strong><span>Проведён · стоп-лист</span></p></div></div></RoleSection>
      </div>
      <RoleSection variant="content" title="Развитие сотрудников" eyebrow="ПАРТНЁРСКАЯ КОМАНДА"><DataTable label="Развитие сотрудников партнёрской сети" headings={['Сотрудник', 'Сделки', 'Активации', 'Динамика', 'Прогресс']}><tr><td>Алёна Соколова</td><td>6</td><td>4</td><td>+18%</td><td>82%</td></tr><tr><td>Ирина Лебедева</td><td>4</td><td>3</td><td>+11%</td><td>74%</td></tr><tr><td>Ольга Миронова</td><td>2</td><td>2</td><td>+4%</td><td>61%</td></tr></DataTable></RoleSection>
      <RoleSection variant="content" title="Контроль задач" eyebrow="ПО ОФИСАМ">
        <div className="partner-task-grid">{(Object.entries(tasks) as Array<[Office, Task[]]>).map(([office, officeTasks]) => {
          const done = officeTasks.filter((task) => task.done).length;
          return <details open={office === 'Сокол'} key={office}><summary><span>{office}</span><small>{officeTasks.length} / {done}</small></summary><div className="partner-task-list">{officeTasks.map((task, index) => <Checkbox checked={task.done} compact key={`${office}-${index}`} label={task.label} size={20} onChange={() => updateTask(office, index)} />)}</div><form className="partner-task-form" onSubmit={(event) => addTask(event, office)}><Input block aria-label={`Новая задача по офису ${office}`} id={`task-${office}`} size={40} value={drafts[office]} placeholder="Добавить новую задачу по офису" onChange={(_, payload) => setDrafts((current) => ({ ...current, [office]: payload.value }))} /><Button size={40} type="submit">Добавить</Button></form></details>;
        })}</div>
        <p className="action-feedback" role="status" aria-live="polite">{message}</p>
      </RoleSection>
      <div className="role-grid role-grid--2">
        <RoleSection variant="dashboard" title="Запросы на визит" eyebrow="ПРИОРИТЕТЫ"><ul className="role-list"><li><span>1</span><p><strong>Сокол · новый сотрудник</strong><small>Высокий приоритет · низкая активация · ближайшая неделя</small></p></li><li><span>2</span><p><strong>Тверская · встреча с клиентом</strong><small>Крупный чек · совместный разбор VIP-кейса</small></p></li><li><span>3</span><p><strong>Арбат · низкая активация</strong><small>Следующий цикл · мотивация и вовлечение</small></p></li></ul></RoleSection>
        <RoleSection variant="dashboard" title="Карта компетенций" eyebrow="ОФИСЫ"><ul className="role-list"><li><span>Т</span><p><strong>Тверская</strong><small>Уверенные скрипты и диалоги</small></p></li><li><span>С</span><p><strong>Сокол</strong><small>Требуется усилить вовлечение</small></p></li><li><span>А</span><p><strong>Арбат</strong><small>Динамика продаж + быстрые рекомендации</small></p></li></ul></RoleSection>
      </div>
      <div className="role-grid role-grid--2-1">
        <RoleSection variant="dashboard" title="Алёна Соколова" eyebrow="ЛУЧШИЙ СОТРУДНИК"><p className="role-callout">Стабильно применяет рекомендации после визитов и быстро переводит обучение в сделки.</p><MetricCards items={[{ label: 'Продажи', value: '№ 1', detail: 'в офисе' }, { label: 'Вовлечение', value: '95%' }, { label: 'Рекомендации', value: '6 / 6' }]} /></RoleSection>
        <RoleSection variant="dashboard" title="Последние визиты" eyebrow="КРАТКО"><ul className="role-list"><li><span>31.07</span>Арбат</li><li><span>24.07</span>Химки</li><li><span>17.07</span>Тверская</li></ul></RoleSection>
      </div>
      <RoleSection variant="content" title="История визитов" eyebrow="РЕЗУЛЬТАТЫ И ОБРАТНАЯ СВЯЗЬ"><DataTable label="История визитов по офисам" headings={['Дата', 'Офис', 'Тема', 'Статус', 'Оценка', 'Итог']}>{visitHistory.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={`${row[0]}-${index}`}>{index === 3 ? <StatusTag tone={cell === 'Проведён' ? 'green' : 'gold'}>{cell}</StatusTag> : cell}</td>)}</tr>)}</DataTable></RoleSection>
    </div>
  );
}
