import { useEffect, useRef, useState } from 'react';
import { Button } from '@alfalab/core-components/button';
import { Input } from '@alfalab/core-components/input';
import { AlfaSelect } from '../AlfaSelect';
import { WidgetHeader } from '../widgets/WidgetHeader';
import { DailyLink, dailyReturn } from './DailyLink';
import { useLearning } from './LearningProvider';
import { SourceState } from './DailyInvest';
import { isActive, isDaily, isOverdue, knownDeadline, learningHref, queueHref, selectAssignments, type DailyAssignment } from '../../domain/learning';
import './learning.css';

export const statuses = { active: 'Активные', overdue: 'Просроченные', in_progress: 'Начатые', completed: 'Завершённые', closed: 'Отменённые и закрытые', all: 'Все состояния' };
const requirements = { all: 'Любая обязательность', required: 'Обязательные', optional: 'Дополнительные' };
export const kinds = { all: 'Все форматы', assessment: 'Тестирования', course: 'Курсы', program: 'Программы' };
export function AssignmentState({ assignment: a }: { assignment: DailyAssignment }) {
  return <p>{a.status === 'completed' ? a.completion?.evidenceRef && a.completion.confirmedAt ? 'Завершение подтверждено' : 'Ожидаем подтверждение завершения' : ({ assigned: 'Назначено', in_progress: 'В процессе', cancelled: 'Отменено', expired: 'Закрыто' })[a.status]}</p>;
}
export function AssignmentMeta({ assignment: a }: { assignment: DailyAssignment }) {
  return <>
    <p>{a.required ? 'Обязательное' : 'Дополнительное'}{isDaily(a) ? ' · Daily Invest' : a.kind ? ` · ${kinds[a.kind]}` : ''}</p>
    <p>{knownDeadline(a) < Infinity ? `${isOverdue(a) ? 'Просрочено · ' : ''}Срок: ${new Intl.DateTimeFormat('ru-RU', { timeZone: a.dueTimezone, dateStyle: 'long', timeStyle: 'short' }).format(new Date(a.dueAt!))} · ${a.dueTimezone}` : 'Срок не уточнён'}</p>
    {a.rules?.version && a.rules.durationMinutes !== undefined && <p>Длительность: {a.rules.durationMinutes} мин</p>}
    <AssignmentState assignment={a} />
  </>;
}
export function LearningReadState() {
  const { read, refresh } = useLearning();
  if (read.state === 'ready' && read.snapshot.access === 'allowed') return null;
  return <div role="status"><p>{read.state === 'loading' ? 'Загружаем назначения…' : read.state === 'error' ? 'Не удалось загрузить назначения. Попробуйте ещё раз.' : read.state === 'unavailable' ? 'Назначения пока недоступны' : 'Нет доступа к назначениям'}</p><Button size={32} view="text" onClick={refresh} disabled={read.state === 'loading'}>Обновить</Button></div>;
}
function AssignmentRow({ assignment: a }: { assignment: DailyAssignment }) {
  return <li className="assignment-row">{a.access === 'denied' ? <p>Нет доступа к назначению</p> : <>
    <div><h3>{a.title}</h3><AssignmentMeta assignment={a} /></div>
    <DailyLink size={40} view="secondary" href={learningHref('assignment', a.id)}>{a.status === 'completed' ? 'Посмотреть результаты' : isDaily(a) ? 'Открыть Daily Invest' : 'Открыть назначение'}</DailyLink>
  </>}</li>;
}
export function OverdueNotice() {
  const { read } = useLearning();
  const count = read.state === 'ready' && read.snapshot.access === 'allowed' ? selectAssignments(read.snapshot).filter(a => isOverdue(a)).length : 0;
  return count ? <aside className="page-note"><DailyLink size={40} view="text" href={queueHref({ status: 'overdue' })}>Назначения с истёкшим сроком · {count}</DailyLink></aside> : null;
}
export function AssignmentQueue({ full = false }: { full?: boolean }) {
  const { read } = useLearning();
  const p = new URLSearchParams(location.search);
  const status = p.get('status') ?? 'active';
  const kind = p.get('kind') ?? 'all';
  const requirement = p.get('required') ?? 'all';
  const query = p.get('q') ?? '';
  const page = Number(p.get('page') ?? 1);
  const [search, setSearch] = useState(query);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (full) heading.current?.focus({ preventScroll: true }); }, [full]);
  useEffect(() => {
    if (!full || read.state !== 'ready') return;
    let scroll = history.state?.dailyScroll ?? 0;
    try { scroll ||= Number(sessionStorage.getItem(`learning-scroll:${location.pathname}${location.search}`)) || 0; } catch { /* history still works */ }
    let cancelled = false;
    let frame = 0;
    void document.fonts.ready.then(() => { if (!cancelled) frame = requestAnimationFrame(() => window.scrollTo(0, scroll)); });
    return () => { cancelled = true; cancelAnimationFrame(frame); };
  }, [full, read]);
  const allowed = ['role', 'section', 'view', 'status', 'kind', 'required', 'q', 'page'];
  const valid = !full || ([...p.keys()].every(k => allowed.includes(k) || (import.meta.env.DEV && k === 'case')) && [...p.keys()].every(k => p.getAll(k).length === 1) && Object.hasOwn(statuses, status) && Object.hasOwn(kinds, kind) && Object.hasOwn(requirements, requirement) && Number.isSafeInteger(page) && page > 0);
  let list = read.state === 'ready' && read.snapshot.access === 'allowed' ? selectAssignments(read.snapshot) : [];
  list = list.filter(a => full ? (status === 'all' || status === 'active' && isActive(a) || status === 'overdue' && isOverdue(a) || status === 'in_progress' && a.status === 'in_progress' || status === 'completed' && a.status === 'completed' || status === 'closed' && !isActive(a) && a.status !== 'completed') && (kind === 'all' || a.access === 'allowed' && a.kind === kind) && (requirement === 'all' || a.access === 'allowed' && a.required === (requirement === 'required')) && (!query || a.access === 'allowed' && a.title.toLocaleLowerCase('ru').includes(query.toLocaleLowerCase('ru'))) : !isDaily(a) && isActive(a));
  if (full && status === 'completed') list.sort((a, b) => (b.completion?.confirmedAt ?? '').localeCompare(a.completion?.confirmedAt ?? '') || a.id.localeCompare(b.id));
  const pages = Math.max(1, Math.ceil(list.length / 10));
  const href = (patch: Record<string, string>) => queueHref({ status, kind, required: requirement, q: query, page: '1', ...patch });
  const navigate = (patch: Record<string, string>) => location.assign(href(patch));
  const ready = read.state === 'ready' && read.snapshot.access === 'allowed';
  return <section className={full ? 'section-page assignment-queue' : 'section-card assignment-queue'} aria-label="Назначения и тестирования">
    {full ? <><DailyLink size={40} view="text" remember={false} href={dailyReturn(learningHref())}>Вернуться к обучению</DailyLink><h1 ref={heading} tabIndex={-1}>Назначения и тестирования</h1></> : <WidgetHeader>Назначения и тестирования</WidgetHeader>}
    {!valid ? <p>Объект недоступен. Проверьте адрес списка.</p> : <>
      {full && <form className="assignment-filters" onSubmit={e => { e.preventDefault(); navigate({ q: search }); }}>
        <Input label="Поиск назначений" value={search} onChange={e => setSearch(e.target.value)} size={48} />
        <AlfaSelect accessibleName="Состояние" label="Состояние" size={48} options={Object.entries(statuses).map(([key, content]) => ({ key, content }))} selected={status} onChange={({ selected }) => { if (selected) navigate({ status: selected.key }); }} />
        <AlfaSelect accessibleName="Формат" label="Формат" size={48} options={Object.entries(kinds).map(([key, content]) => ({ key, content }))} selected={kind} onChange={({ selected }) => { if (selected) navigate({ kind: selected.key }); }} />
        <AlfaSelect accessibleName="Обязательность" label="Обязательность" size={48} options={Object.entries(requirements).map(([key, content]) => ({ key, content }))} selected={requirement} onChange={({ selected }) => { if (selected) navigate({ required: selected.key }); }} />
        <Button size={40} view="secondary" type="submit">Найти</Button>
      </form>}
      <LearningReadState />
      {ready && <>
        {full && <SourceState />}
        <p role="status">{list.length ? `Назначений: ${list.length}` : full && (query || kind !== 'all' || requirement !== 'all') ? 'По выбранным условиям ничего не найдено' : 'Нет назначений в этом списке'}</p>
        {full && (!list.length || page > pages) && <DailyLink size={40} view="secondary" href={queueHref()} remember={false}>Сбросить фильтры</DailyLink>}
        {full && page > pages ? <p>Страница недоступна</p> : <ul className={full ? "section-card assignment-list" : "assignment-list"}>{(full ? list.slice((page - 1) * 10, page * 10) : list.slice(0, 3)).map(a => <AssignmentRow key={a.id} assignment={a} />)}</ul>}
        {full && pages > 1 && <nav className="daily-actions" aria-label="Страницы назначений">{page > 1 && <DailyLink size={40} view="secondary" remember={false} href={href({ page: String(page - 1) })}>Предыдущая</DailyLink>}<span>Страница {page} из {pages}</span>{page < pages && <DailyLink size={40} view="secondary" remember={false} href={href({ page: String(page + 1) })}>Следующая</DailyLink>}</nav>}
      </>}
      {!full && <DailyLink size={40} view="text" href={queueHref()}>Все назначения</DailyLink>}
    </>}
  </section>;
}
