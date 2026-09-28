import { useEffect, useRef, useState } from 'react';
import { Button } from '@alfalab/core-components/button';
import { Input } from '@alfalab/core-components/input';
import { AlfaSelect } from '../AlfaSelect';
import { WidgetHeader } from '../widgets/WidgetHeader';
import { DailyLink, dailyReturn } from './DailyLink';
import { useLearning } from './LearningProvider';
import { canOpenEvent, canRegister, eventFormats, eventCalendar, eventHref, eventInstant, eventTime, latestEntities, participationFor, selectEvents, type EventAction, type EventAsset, type LearningEvent } from '../../domain/events';
import './learning.css';

const states = { scheduled: 'Запланировано', live: 'Идёт эфир', ended: 'Завершено', cancelled: 'Отменено' };
const registrations = { not_registered: 'Вы не записаны', pending: 'Ожидаем подтверждение регистрации', registered: 'Регистрация подтверждена', waitlisted: 'Вы в листе ожидания', rejected: 'Регистрация отклонена', cancelled: 'Регистрация отменена' };
function EventReadState() {
  const { read, refresh } = useLearning();
  const text = read.state === 'loading' ? 'Загружаем мероприятия…' : read.state === 'error' ? 'Не удалось загрузить мероприятия. Попробуйте ещё раз.' : read.state === 'unavailable' ? 'Мероприятия пока недоступны' : read.snapshot.access === 'denied' ? 'Нет доступа к мероприятиям' : read.snapshot.events === undefined ? 'Мероприятия пока недоступны' : null;
  return text ? <div role="status"><p>{text}</p><Button size={32} view="text" disabled={read.state === 'loading'} onClick={refresh}>Обновить</Button></div> : null;
}
function EventSource({ event }: { event?: LearningEvent }) {
  const { read, refresh } = useLearning();
  if (read.state !== 'ready' || read.snapshot.access !== 'allowed') return null;
  return <div className="daily-source"><small>{event ? `Источник: ${event.sourceRef.system} · Обновлено: ${event.updatedAt} · Получено: ${event.observedAt}` : `${read.snapshot.sourceLabel ?? 'Источник не указан'} · Получено: ${read.snapshot.observedAt ?? 'неизвестно'}`}{(event?.sync ?? read.snapshot.sync) !== 'current' || read.snapshot.sync !== 'current' ? ' · Данные требуют обновления' : ''}</small><Button size={32} view="text" onClick={refresh}>Обновить</Button></div>;
}
function ParticipationState({ event }: { event: LearningEvent }) {
  const p = participationFor(event);
  return <p>{!p ? 'Статус участия пока недоступен' : p.registrationState === 'registered' && !(p.evidence?.registration && p.evidence.confirmedAt) ? 'Ожидаем подтверждение регистрации' : registrations[p.registrationState]}</p>;
}
function EventMeta({ event: e }: { event: LearningEvent }) {
  return <><p>{eventFormats[e.format]} · {states[e.state]}</p><p>{eventTime(e.startsAt, e.timezone)}</p>{e.previousSchedule && <p>Событие перенесено. Ранее: {eventTime(e.previousSchedule.startsAt, e.previousSchedule.timezone)}</p>}<ParticipationState event={e} /></>;
}
function validParams(detail: boolean) {
  const p = new URLSearchParams(location.search);
  const allowed = ['role', 'section', 'view', ...(detail ? ['event'] : ['status', 'format', 'topic', 'q', 'page'])];
  return p.get('role') === 'mass' && p.get('section') === 'learning' && p.get('view') === (detail ? 'event' : 'events') && [...p.keys()].every(k => (allowed.includes(k) || import.meta.env.DEV && k === 'case') && p.getAll(k).length === 1) && (!detail || !!p.get('event'));
}
function backLabel(back: string) {
  const p = new URL(back, location.href).searchParams;
  return p.get('section') === 'home' ? 'Вернуться на главную' : p.get('view') === 'events' ? 'Вернуться к афише' : 'Вернуться к обучению';
}
export function Events({ full = false, dashboard = false }: { full?: boolean; dashboard?: boolean }) {
  const { read } = useLearning();
  const p = new URLSearchParams(location.search);
  const status = full ? p.get('status') ?? 'upcoming' : 'upcoming';
  const format = full ? p.get('format') ?? 'all' : 'all';
  const topic = full ? p.get('topic') ?? 'all' : 'all';
  const query = full ? p.get('q') ?? '' : '';
  const page = full ? Number(p.get('page') ?? 1) : 1;
  const [search, setSearch] = useState(query);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (full) heading.current?.focus({ preventScroll: true }); }, [full]);
  useEffect(() => {
    if (!full || read.state !== 'ready') return;
    let scroll = history.state?.dailyScroll ?? 0;
    try { scroll ||= Number(sessionStorage.getItem(`learning-scroll:${location.pathname}${location.search}`)) || 0; } catch { /* optional storage */ }
    const frame = requestAnimationFrame(() => window.scrollTo(0, scroll));
    return () => cancelAnimationFrame(frame);
  }, [full, read]);
  const ready = read.state === 'ready' && read.snapshot.access === 'allowed' && read.snapshot.events !== undefined;
  const events = read.state === 'ready' ? selectEvents(read.snapshot).filter(e => e.access === 'allowed') : [];
  const topics = [...new Map(events.flatMap(e => e.topics).map(t => [t.id, t.title])).entries()];
  const valid = !full || validParams(false) && ['upcoming', 'recordings'].includes(status) && Object.hasOwn(eventFormats, format) && Number.isSafeInteger(page) && page > 0;
  let list = events.filter(e => (status === 'recordings' ? e.state === 'ended' : e.state !== 'ended') && (format === 'all' || e.format === format) && (topic === 'all' || e.topics.some(t => t.id === topic)) && (!query || e.title.toLocaleLowerCase('ru').includes(query.toLocaleLowerCase('ru'))));
  if (status === 'recordings') list = list.reverse();
  const pages = Math.max(1, Math.ceil(list.length / 10));
  const href = (patch: Record<string, string>) => eventHref(undefined, { status, format, topic, q: query, page: '1', ...patch });
  const navigate = (patch: Record<string, string>) => location.assign(href(patch));
  const back = dailyReturn('?role=mass&section=learning');
  return <section className={`${full ? 'section-page' : dashboard ? 'widget widget--event' : 'section-card'} event-board assignment-queue`} aria-label="Мероприятия и вебинары">
    {full ? <><DailyLink size={40} view="text" remember={false} href={back}>{backLabel(back)}</DailyLink><h1 ref={heading} tabIndex={-1}>Мероприятия и вебинары</h1></> : <><WidgetHeader>Мероприятия и вебинары</WidgetHeader><h2>Ближайшие мероприятия</h2></>}
    {!valid ? <p>Объект недоступен. Проверьте адрес афиши.</p> : <>
      {full && <form className="assignment-filters" onSubmit={e => { e.preventDefault(); navigate({ q: search }); }}>
        <AlfaSelect accessibleName="Представление" label="Представление" selected={status} options={[{ key: 'upcoming', content: 'Предстоящие' }, { key: 'recordings', content: 'Записи' }]} onChange={({ selected }) => { if (selected) navigate({ status: selected.key }); }} />
        <AlfaSelect accessibleName="Формат" label="Формат" selected={format} options={Object.entries(eventFormats).map(([key, content]) => ({ key, content }))} onChange={({ selected }) => { if (selected) navigate({ format: selected.key }); }} />
        <AlfaSelect accessibleName="Тема" label="Тема" selected={topic} options={[{ key: 'all', content: 'Все темы' }, ...topics.map(([key, content]) => ({ key, content })), ...(topic !== 'all' && !topics.some(([key]) => key === topic) ? [{ key: topic, content: 'Тема недоступна' }] : [])]} onChange={({ selected }) => { if (selected) navigate({ topic: selected.key }); }} />
        <Input label="Поиск мероприятий" value={search} onChange={e => setSearch(e.target.value)} size={48} /><Button size={40} view="secondary" type="submit">Найти</Button>
      </form>}
      <EventReadState />
      {ready && <>{full && <EventSource />}<p role="status">{list.length ? `Мероприятий: ${list.length}` : query || format !== 'all' || topic !== 'all' ? 'По выбранным условиям ничего не найдено' : 'В этом списке пока нет мероприятий'}</p>
        {page > pages ? <p>Страница недоступна</p> : <ul className={`${full ? 'section-card ' : ''}assignment-list`}>{(full ? list.slice((page - 1) * 10, page * 10) : list.slice(0, 3)).map(e => <li className="assignment-row" key={e.id}><div><h3>{e.title}</h3><EventMeta event={e} /></div><DailyLink size={40} view="secondary" href={eventHref(e.id)}>Открыть событие</DailyLink></li>)}</ul>}
        {full && (!list.length || page > pages) && <DailyLink size={40} view="secondary" remember={false} href={eventHref()}>Сбросить фильтры</DailyLink>}
        {full && pages > 1 && <nav className="daily-actions" aria-label="Страницы афиши">{page > 1 && <DailyLink size={40} view="secondary" remember={false} href={href({ page: String(page - 1) })}>Предыдущая</DailyLink>}<span>Страница {page} из {pages}</span>{page < pages && <DailyLink size={40} view="secondary" remember={false} href={href({ page: String(page + 1) })}>Следующая</DailyLink>}</nav>}
      </>}
      {!full && <DailyLink size={40} view="text" href={eventHref()}>Все мероприятия</DailyLink>}
    </>}
  </section>;
}
function EventLaunch({ event, action, asset }: { event: LearningEvent; action: EventAction; asset?: EventAsset }) {
  const { read, adapter } = useLearning();
  const [resolved, setResolved] = useState<{ target: { url: string; system: string }; event: LearningEvent; asset?: EventAsset; action: EventAction } | null>(null);
  const target = resolved?.event === event && resolved?.asset === asset && resolved?.action === action ? resolved.target : null;
  const allowed = read.state === 'ready' && canOpenEvent(event, read.snapshot, action, asset);
  useEffect(() => {
    let alive = true;
    setResolved(null);
    if (allowed) adapter.resolveEventTarget?.(event.id, event.revision, action, asset && { id: asset.id, version: asset.version }).then(t => {
      if (!alive || !t) return;
      try { const u = new URL(t.url); if (u.protocol === 'https:' && !u.username && !u.password && t.system.trim()) setResolved({ target: t, event, asset, action }); } catch { /* invalid target */ }
    }).catch(() => {});
    return () => { alive = false; };
  }, [adapter, event, action, asset, allowed]);
  return allowed && target ? <div><Button size={40} view="secondary" href={target.url} target="_blank" rel="noopener noreferrer">{action === 'join' ? 'Подключиться' : action === 'recording' ? 'Смотреть запись' : 'Открыть материал'} · {target.system}</Button><p>Откроется новая вкладка.</p></div> : <p>{action === 'join' ? event.join.reason ?? 'Подключение пока недоступно' : 'Переход пока недоступен'}</p>;
}
function EventCalendar({ event }: { event: LearningEvent }) {
  const { read } = useLearning();
  const calendar = read.state === 'ready' && read.snapshot.sync === 'current' ? eventCalendar(event) : null;
  const [href, setHref] = useState<string>();
  useEffect(() => {
    if (!calendar) { setHref(undefined); return; }
    const url = URL.createObjectURL(new Blob([calendar], { type: 'text/calendar;charset=utf-8' }));
    setHref(url);
    return () => URL.revokeObjectURL(url);
  }, [calendar]);
  return calendar && href ? <div><Button size={32} view="text" href={href} download="event.ics">Добавить в календарь</Button><p>Сохранение в календарь не регистрирует на событие.</p></div> : null;
}
function Registration({ event }: { event: LearningEvent }) {
  const { read, adapter, refresh } = useLearning();
  const [state, setState] = useState<'idle' | 'sending' | 'accepted' | 'error' | 'rejected'>('idle');
  const [message, setMessage] = useState('');
  const lock = useRef(false);
  const request = useRef<string>();
  const allowed = read.state === 'ready' && canRegister(event, read.snapshot) && !!adapter.registerEvent;
  async function register() {
    if (!allowed || lock.current || !adapter.registerEvent || read.state !== 'ready') return;
    lock.current = true; setState('sending');
    // Persist only an opaque request key, scoped to the authenticated subject, event and policy.
    const key = `event-request:${read.snapshot.subjectRef}:${event.id}:${event.registration.policyRef}`;
    try { request.current ||= sessionStorage.getItem(key) ?? undefined; } catch { /* in-memory retry remains safe */ }
    request.current ||= crypto.randomUUID();
    try { sessionStorage.setItem(key, request.current); } catch { /* server also checks existing participation */ }
    try {
      const result = await adapter.registerEvent(event.id, event.revision, request.current);
      setState(result.state); setMessage(result.reason ?? '');
      if (result.state === 'accepted') refresh();
    } catch { setState('error'); } finally { lock.current = false; }
  }
  return <><h2>Регистрация</h2><ParticipationState event={event} />{event.registration.description && <p>{event.registration.description}</p>}
    {allowed && !['accepted', 'rejected'].includes(state) ? <Button size={40} view="primary" disabled={state === 'sending'} onClick={register}>{state === 'sending' ? 'Отправляем заявку…' : state === 'error' ? 'Повторить регистрацию' : 'Записаться'}</Button> : <p>{event.state === 'cancelled' ? 'Регистрация недоступна: событие отменено' : event.state === 'ended' ? 'Регистрация завершена' : event.registration.reason ?? ({ open: 'Новая регистрация сейчас недоступна', closed: 'Регистрация закрыта', full: 'Свободных мест нет', unknown: 'Условия регистрации уточняются' })[event.registration.state]}</p>}
    <p role="status">{state === 'accepted' ? 'Заявка отправлена. Статус участия обновится после подтверждения источником.' : state === 'error' ? 'Не удалось получить ответ. Повторите запрос или обновите статус участия.' : state === 'rejected' ? message || 'Заявка не принята. Обновите условия регистрации.' : ''}</p></>;
}
export function EventDetails() {
  const { read } = useLearning();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);
  const p = new URLSearchParams(location.search);
  const valid = validParams(true);
  const e = valid && read.state === 'ready' ? selectEvents(read.snapshot).find(e => e.id === p.get('event')) : undefined;
  const visible = e?.access === 'allowed';
  const back = dailyReturn(eventHref());
  const participation = e && participationFor(e);
  const start = e && eventInstant(e.startsAt, e.timezone);
  const end = e && eventInstant(e.endsAt, e.timezone);
  return <div className="section-page assignment-detail event-detail"><DailyLink size={40} view="text" remember={false} href={back}>{backLabel(back)}</DailyLink><h1 ref={heading} tabIndex={-1}>{visible ? e.title : 'Событие'}</h1>
    {!valid ? <p>Объект недоступен. Проверьте адрес события.</p> : <><EventReadState />{read.state === 'ready' && read.snapshot.access === 'allowed' && read.snapshot.events !== undefined && (!e ? <p>Событие не найдено</p> : !visible ? <p>Нет доступа к событию</p> : <><EventSource event={e} /><article className="section-card daily-invest"><EventMeta event={e} /><p>{e.description}</p><p>Площадка: {e.venue ?? 'уточняется'}</p><p>{start != null && end != null && end > start ? `Длительность: ${(end - start) / 60000} мин · Окончание: ${eventTime(e.endsAt, e.timezone)}` : 'Длительность уточняется'}</p>
      {e.state === 'cancelled' && <p>{e.cancellationReason ?? 'Причина отмены пока недоступна'}</p>}
      <EventCalendar event={e} /><Registration key={`${read.snapshot.subjectRef}:${e.id}:${e.registration.policyRef}`} event={e} />
      {e.state !== 'cancelled' && e.state !== 'ended' && <><h2>Подключение</h2><EventLaunch event={e} action="join" /></>}
      <h2>Посещение и просмотр</h2><p>{participation?.attendanceState === 'attended' && participation.evidence?.attendance && participation.evidence.confirmedAt ? 'Посещение подтверждено' : participation?.attendanceState === 'absent' ? 'Источник не подтвердил посещение' : 'Посещение пока не подтверждено'}</p><p>{participation?.recordingViewState === 'viewed' && participation.evidence?.recording && participation.evidence.confirmedAt ? 'Просмотр записи подтверждён' : 'Просмотр записи пока не подтверждён'}</p>{participation?.reason && <p>{participation.reason}</p>}
      {e.state === 'ended' && <>{(['recordings', 'materials'] as const).map(kind => <section key={kind}><h2>{kind === 'recordings' ? 'Записи эфира' : 'Материалы события'}</h2>{e[kind] === undefined ? <p>{kind === 'recordings' ? 'Информация о записи пока недоступна' : 'Информация о материалах пока недоступна'}</p> : !latestEntities(e[kind]).some(a => a.access === 'allowed' && a.publication === 'published') ? <p>{kind === 'recordings' ? 'Запись пока не опубликована' : 'Материалы пока не опубликованы'}</p> : latestEntities(e[kind]).filter(a => a.access === 'allowed' && a.publication === 'published').map(a => <div key={a.id}><h3>{a.title}</h3><EventLaunch event={e} action={kind === 'recordings' ? 'recording' : 'material'} asset={a} /></div>)}</section>)}</>}
    </article></>)}</>}
  </div>;
}
