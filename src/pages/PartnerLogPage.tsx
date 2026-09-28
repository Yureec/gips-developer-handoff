import { useState } from 'react';
import { Button } from '@alfalab/core-components/button';
import { Radio } from '@alfalab/core-components/radio';
import { Textarea } from '@alfalab/core-components/textarea';

import { PageBack, StatusTag } from '../components/PagePrimitives';
import { DataTable, MetricCards, RoleHero, RoleSection } from '../components/RolePrimitives';
import { Heading } from '../components/Typography';
import type { ManagerData } from '../data/provider';

const visits = [
  ['09.07.2026', 'Юлия Волкова', 'Навигатор: возражения', 'Проведён', '★★★★★', 'Команда забрала скрипт и клиентский вид'],
  ['25.06.2026', 'Андрей Лебедев', 'БПИФ: подача для вкладчиков', 'Проведён', '★★★★☆', 'Повторить для новых сотрудников'],
  ['11.06.2026', 'Светлана Соколова', 'ПДС: цели клиента', 'Проведён', '★★★★☆', 'Отработан блок вопросов'],
  ['28.05.2026', 'Павел Орлов', 'Практики сделок', 'Не состоялся', '—', 'Визит перенесён'],
];

export function PartnerLogPage({ data, onBack }: { data: ManagerData; onBack: () => void }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('Команда забрала скрипт и клиентский вид. На следующем визите проверить применение в реальных диалогах.');
  const [message, setMessage] = useState('');
  return (
    <div className="role-page partner-log-page">
      <PageBack label="К сводной руководителя" onClick={onBack} />
      <RoleHero image={data.employee.image} title="Журнал работы с партнёрами" subtitle="История визитов, обратная связь, регулярность и план ближайших встреч · Офис «Тверская»" tags={[{ label: 'Работа с партнёрами', tone: 'violet' }, { label: 'Коучи и партнёры' }]} />
      <MetricCards items={[{ label: 'Следующий визит', value: '16 июля · 11:00', detail: 'Юлия Волкова' }, { label: 'Тема', value: 'Навигатор', detail: 'возражения и клиентский вид' }, { label: 'Регулярность', value: '92%', progress: 92 }, { label: 'Средняя оценка', value: '4,6 / 5' }]} />
      <RoleSection variant="content" title="История визитов" eyebrow="ОФИС «ТВЕРСКАЯ»">
        <DataTable label="История визитов партнёров" headings={['Дата', 'Партнёр', 'Тема', 'Статус', 'Оценка', 'Результат']}>
          {visits.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={`${row[0]}-${index}`}>{index === 3 ? <StatusTag tone={cell === 'Проведён' ? 'green' : 'gold'}>{cell}</StatusTag> : cell}</td>)}</tr>)}
        </DataTable>
      </RoleSection>
      <div className="role-grid role-grid--2-1">
        <RoleSection variant="dashboard" title="Следующий визит" eyebrow="16 ИЮЛЯ · 11:00–13:00"><Heading level={3} variant="card">Юлия Волкова</Heading><p className="role-callout">Навигатор: возражения и клиентский вид</p><p className="role-muted">Офис + разборы · Mass · 12 участников · подтверждено</p></RoleSection>
        <RoleSection variant="dashboard" title="Регулярность" eyebrow="ТЕКУЩИЙ ПЕРИОД"><MetricCards items={[{ label: 'Запланировано', value: '6' }, { label: 'Состоялось', value: '5' }, { label: 'Перенесено', value: '1' }]} /><p className="role-muted">График сохраняется: один визит перенесён и уже включён в новый цикл.</p></RoleSection>
      </div>
      <RoleSection variant="content" title="Расписание" eyebrow="БЛИЖАЙШИЕ ВИЗИТЫ">
        <DataTable label="Расписание визитов" headings={['Дата', 'Партнёр', 'Тема', 'Направление']}>
          <tr><td>16.07</td><td>Юлия Волкова</td><td>Навигатор</td><td>Mass</td></tr><tr><td>23.07</td><td>Алексей Романов</td><td>Большой чек</td><td>Only</td></tr><tr><td>30.07</td><td>Юлия Волкова</td><td>Практики коллег</td><td>Mass</td></tr>
        </DataTable>
      </RoleSection>
      <RoleSection variant="content" title="Оценить визит" eyebrow="ЮЛИЯ ВОЛКОВА · 09.07">
        <fieldset className="rating-fieldset"><legend>Оценка визита</legend><div>{[1, 2, 3, 4, 5].map((value) => <Radio checked={rating === value} key={value} label={`${value} ★`} name="visit-rating" size={20} value={value} onChange={() => setRating(value)} />)}</div></fieldset>
        <label className="role-textarea-label" htmlFor="visit-comment">Комментарий<Textarea block id="visit-comment" minRows={3} value={comment} onChange={(_, payload) => setComment(payload.value)} /></label>
        <Button size={40} view="primary" onClick={() => setMessage('Оценка визита сохранена.')}>Сохранить оценку</Button>
        <p className="action-feedback" role="status" aria-live="polite">{message}</p>
      </RoleSection>
    </div>
  );
}
