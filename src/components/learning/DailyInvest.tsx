import { DailyLink, dailyReturn } from './DailyLink';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@alfalab/core-components/button';
import { AccessibleProgressBar } from '../AccessibleProgressBar';
import { WidgetHeader } from '../widgets/WidgetHeader';
import { dailyProgress, learningHref, nextDailyItem, selectDailyAssignments, type DailyAssignment, type DailyItem } from '../../domain/learning';
import { useLearning } from './LearningProvider';
import './learning.css';

export function SourceState() {
  const { read, refresh } = useLearning();
  if (read.state !== 'ready' || read.snapshot.access !== 'allowed') return null;
  const { sourceLabel, observedAt, sync } = read.snapshot;
  return <div className="daily-source">
    <small>{sourceLabel ? `Источник: ${sourceLabel}. ` : 'Источник не указан. '}
      {observedAt ? `Получено: ${observedAt}. ` : ''}
      {({ current: '', stale: 'Данные требуют обновления', pending: 'Ожидаем результат', unknown: 'Актуальность неизвестна' })[sync]}
    </small>
    <Button size={32} view="text" onClick={refresh}>Обновить результат</Button>
  </div>;
}

function DailySummary({ assignment: a, action = true }: { assignment: DailyAssignment; action?: boolean }) {
  const progress = dailyProgress(a);
  const next = nextDailyItem(a);
  return <>
    <h2><a href={learningHref('assignment', a.id)}>{a.title}</a></h2>
    {a.dueAt && a.dueTimezone && <p>Срок: {a.dueAt} · {a.dueTimezone}</p>}
    <p>{a.status === 'completed' && (a.completion?.evidenceRef && a.completion.confirmedAt) ? 'Завершение подтверждено' : a.status === 'cancelled' ? 'Назначение отменено' : a.status === 'expired' ? 'Назначение закрыто' : !a.items.length ? 'Состав трека пока недоступен' : 'Результаты назначения'}</p>
    {progress ? <div><p>Подтверждено {progress.completed} из {progress.total} обязательных элементов · {Math.round(progress.completed / progress.total * 100)}%</p><AccessibleProgressBar label={`Подтверждено ${progress.completed} из ${progress.total}`} value={progress.completed / progress.total * 100} view="link" size={4} /></div> : <p>Результат пока недоступен</p>}
    {action && <DailyLink size={40} view="secondary" href={learningHref(next ? 'item' : 'assignment', a.id, next ?? undefined)}>{next ? next.state === 'in_progress' ? 'Продолжить' : 'Начать следующий элемент' : a.status === 'completed' && (a.completion?.evidenceRef && a.completion.confirmedAt) ? 'Результаты' : 'Открыть трек'}</DailyLink>}
  </>;
}
export function DailyInvest({ dashboard = false }: { dashboard?: boolean }) {
  const { read, refresh } = useLearning();
  const list = read.state === 'ready' && read.snapshot.access === 'allowed' ? selectDailyAssignments(read.snapshot) : [];
  return <article className={`${dashboard ? 'widget widget--learning' : 'section-card'} daily-invest`} aria-label="Daily Invest">
    <WidgetHeader>Daily Invest</WidgetHeader>
    <div role="status">{read.state === 'loading' ? <p>Загружаем назначения…</p> : read.state === 'error' ? <p>Не удалось загрузить Daily Invest. Попробуйте ещё раз.</p> : read.state === 'unavailable' ? <><h2>Назначения пока недоступны</h2><p>Не удалось получить данные обучения.</p></> : read.snapshot.access === 'denied' ? <p>Нет доступа к назначениям</p> : list.length === 0 ? <p>Сейчас нет назначений</p> : list[0].access === 'denied' ? <p>Нет доступа к назначению</p> : <DailySummary assignment={list[0]} />}</div>
    {read.state === 'ready' && read.snapshot.access === 'allowed' && <small>{read.snapshot.sourceLabel ? `Источник: ${read.snapshot.sourceLabel}. ` : 'Источник не указан. '}{read.snapshot.observedAt ? `Получено: ${read.snapshot.observedAt}. ` : ''}{({ current: '', stale: 'Данные требуют обновления', pending: 'Ожидаем результат', unknown: 'Актуальность неизвестна' })[read.snapshot.sync]}</small>}
    <div className="daily-actions"><Button size={32} view="text" disabled={read.state === 'loading'} onClick={refresh}>Обновить</Button><DailyLink size={32} view="text" href={learningHref('assignments')}>Все Daily{list.length > 1 ? ` · ${list.length}` : ''}</DailyLink></div>
  </article>;
}
export function Launch({ assignment, item, attempt }: { assignment: DailyAssignment; item: DailyItem; attempt?: string }) {
  const { adapter } = useLearning();
  const [target, setTarget] = useState<{ url: string; system: string } | null>(null);
  useEffect(() => {
    let alive = true;
    setTarget(null);
    if (item.access === 'allowed' && item.publication === 'published' && item.eligible === true && ['assigned', 'in_progress'].includes(assignment.status)) {
      (attempt ? adapter.resolveAttemptLaunchTarget?.(assignment.id, attempt, item.id, item.version) ?? Promise.resolve(null) : adapter.resolveLaunchTarget(assignment.id, item.id, item.version)).then(t => {
        if (alive && t) { try { const u = new URL(t.url); if (u.protocol === 'https:' && !u.username && !u.password) setTarget(t); } catch { /* invalid target stays unavailable */ } }
      }).catch(() => {});
    }
    return () => { alive = false; };
  }, [adapter, assignment, item, attempt]);
  return target ? <><Button href={target.url} target="_blank" rel="noopener noreferrer" size={40} view="primary">Открыть в {target.system}</Button><p>Откроется новая вкладка. Результат появится после подтверждения учебной системой.</p></> : <p>Переход пока недоступен</p>;
}
export function DailyDetails() {
  const { read } = useLearning();
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => { title.current?.focus(); }, []);
  const p = new URLSearchParams(window.location.search);
  const view = p.get('view');
  const list = read.state === 'ready' && read.snapshot.access === 'allowed' ? selectDailyAssignments(read.snapshot) : [];
  const a = list.find(a => a.id === p.get('assignment'));
  const item = a?.items.find(i => i.id === p.get('item') && i.version === p.get('version'));
  const compatible = !['product', 'employee', 'scenario', 'reward', 'person', 'event', 'attempt', 'result', 'q', 'page', 'kind'].some(key => p.has(key)) && (view === 'assignments' || (!p.has('group') && !p.has('status')));
  const valid = compatible && ((view === 'assignments' && p.get('group') === 'daily' && p.get('status') === 'active' && !p.has('assignment') && !p.has('item') && !p.has('version')) || (view === 'assignment' && a && !p.has('item') && !p.has('version')) || (view === 'item' && a && item));
  const back = dailyReturn(view === 'item' && a ? learningHref('assignment', a.id) : learningHref());
  const backLabel = new URLSearchParams(back.split('?')[1]).get('view') === 'assignments' ? 'Вернуться к списку' : new URLSearchParams(back.split('?')[1]).get('section') === 'home' ? 'Вернуться на главную' : view === 'item' && a ? 'К составу Daily Invest' : 'Вернуться к обучению';
  return <div className="section-page daily-detail"><DailyLink remember={false} size={40} view="text" href={back}>{backLabel}</DailyLink><h1 ref={title} tabIndex={-1}>Daily Invest</h1>
    {valid && a?.access !== 'denied' && item?.access !== 'denied' && <SourceState />}
    {read.state !== 'ready' || read.snapshot.access === 'denied' ? <DailyInvest /> : !valid ? <p>Объект недоступен. Проверьте адрес назначения.</p> : view === 'assignments' ? <>{list.some(a => !['completed', 'cancelled', 'expired'].includes(a.status)) ? list.filter(a => !['completed', 'cancelled', 'expired'].includes(a.status)).map(a => <article className="section-card" key={a.id}>{a.access === 'denied' ? <p>Нет доступа к назначению</p> : <DailySummary assignment={a} />}</article>) : <p>Сейчас нет активных назначений</p>}</> : a?.access === 'denied' || item?.access === 'denied' ? <p>Нет доступа к назначению</p> : a && <article className="section-card daily-invest"><DailySummary assignment={a} action={false} />{view === 'item' && item ? <><h2>{item.title}</h2><p>Версия: {item.version}</p><Launch assignment={a} item={item} /></> : <ul>{a.items.map(i => <li key={`${i.id}:${i.version}`}>{i.access === 'denied' ? 'Элемент недоступен' : <a href={learningHref('item', a.id, i)}>{i.title}</a>}{!i.required ? ' · дополнительный' : ''}{i.state === 'completed' && i.result?.evidenceRef ? ' · результат подтверждён' : ''}</li>)}</ul>}</article>}
  </div>;
}
