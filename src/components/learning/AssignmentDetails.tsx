import { InvestClassPage } from './InvestClass';
import { Events, EventDetails } from './Events';
import { useEffect, useRef } from 'react';
import { assignmentAttempts, assignmentResults, entityHref, isDaily, learningHref, selectAssignments, type DailyAssignment, type LearningResult } from '../../domain/learning';
import { DailyDetails, Launch, SourceState } from './DailyInvest';
import { AssignmentMeta, AssignmentQueue, LearningReadState } from './AssignmentQueue';
import { DailyLink, dailyReturn } from './DailyLink';
import { useLearning } from './LearningProvider';

const attemptLabels = { created: 'Попытка создана', in_progress: 'В процессе', submitted: 'Отправлено · ожидает проверки', evaluated: 'Проверено', invalidated: 'Попытка аннулирована' };
function ResultSummary({ result: r, assignment: a }: { result: LearningResult; assignment: DailyAssignment }) {
  if (r.access !== 'allowed') return <p>Нет доступа к результату</p>;
  const replaced = assignmentResults(a).some(other => other.supersedes === r.id);
  const confirmed = !!r.completionEvidenceRef && !!r.confirmedAt;
  return <div className="daily-invest">
    <p>{replaced ? 'Результат заменён новой оценкой' : confirmed ? ({ passed: 'Тест пройден', failed: 'Тест не пройден', completed: 'Завершение подтверждено', unknown: 'Итог пока неизвестен' })[r.outcome] : 'Результат ожидает подтверждения'}</p>
    {confirmed && !replaced && r.score !== undefined && <p>Баллы: {r.score}{r.maxScore !== undefined ? ` из ${r.maxScore}` : ''}</p>}
    {r.confirmedAt && <p>Подтверждено: {r.confirmedAt}</p>}
    <small>Источник: {r.sourceRef.system} · Обновлено: {r.updatedAt}</small>
    {!!r.reviewItems?.length && <><h2>Материалы для повторения</h2><ul>{r.reviewItems.map(ref => {
      const item = a.items.find(i => i.id === ref.item && i.version === ref.version && i.access === 'allowed' && i.publication === 'published');
      return <li key={`${ref.item}:${ref.version}`}>{item ? <DailyLink size={40} view="text" href={learningHref('item', a.id, item)}>{item.title}</DailyLink> : 'Материал недоступен'}</li>;
    })}</ul></>}

  </div>;
}
function AssignmentContent({ assignment: a }: { assignment: DailyAssignment }) {
  const attempts = assignmentAttempts(a);
  const results = assignmentResults(a);
  const latest = results.find(r => !results.some(other => other.supersedes === r.id));
  return <>
    <h2>Правила прохождения</h2>
    {a.rules?.version ? <><p>{a.rules.description}</p><small>Версия правил: {a.rules.version}</small></> : <p>Правила прохождения и попыток пока недоступны</p>}
    <h2>Последний результат</h2>
    {latest ? <><ResultSummary result={latest} assignment={a} />{latest.access === 'allowed' && <DailyLink size={40} view="secondary" href={entityHref('result', a.id, latest.id)}>Открыть результат</DailyLink>}</> : <p>{a.results ? 'Подтверждённых результатов пока нет' : 'Результаты пока недоступны'}</p>}
    <h2>Элементы назначения</h2>
    {!a.items.length ? <p>Состав назначения пока недоступен</p> : <ul>{a.items.map(i => <li key={`${i.id}:${i.version}`}>{i.access === 'allowed' ? <DailyLink size={40} view="text" href={learningHref('item', a.id, i)}>{i.title}</DailyLink> : 'Элемент недоступен'}</li>)}</ul>}
    <h2>Попытки</h2>
    {!attempts.length ? <p>{a.attempts ? 'Попыток пока нет' : 'История попыток пока недоступна'}</p> : <ul>{attempts.map(t => <li key={t.id}>{t.access === 'allowed' ? <DailyLink size={40} view="text" href={entityHref('attempt', a.id, t.id)}>{attemptLabels[t.state]} · {t.startedAt}</DailyLink> : 'Нет доступа к попытке'}</li>)}</ul>}
    {results.length > 1 && <><h2>История результатов</h2><ul>{results.map(r => <li key={r.id}>{r.access === 'allowed' ? <DailyLink size={40} view="text" href={entityHref('result', a.id, r.id)}>Результат · {r.confirmedAt ?? 'ожидает подтверждения'}</DailyLink> : 'Нет доступа к результату'}</li>)}</ul></>}
  </>;
}
function AssignmentDetails() {
  const { read } = useLearning();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  const p = new URLSearchParams(location.search);
  const view = p.get('view');
  const a = read.state === 'ready' && read.snapshot.access === 'allowed' ? selectAssignments(read.snapshot).find(a => a.id === p.get('assignment')) : undefined;
  const attempt = a && assignmentAttempts(a).find(t => t.id === p.get('attempt'));
  const result = a && assignmentResults(a).find(r => r.id === p.get('result'));
  const item = a?.items.find(i => view === 'attempt' ? i.id === attempt?.assessmentVersionRef.item && i.version === attempt.assessmentVersionRef.version : i.id === p.get('item') && i.version === p.get('version'));
  const allowed = ['role', 'section', 'view', 'assignment', ...(view === 'attempt' ? ['attempt'] : view === 'result' ? ['result'] : view === 'item' ? ['item', 'version'] : [])];
  const valid = [...p.keys()].every(k => allowed.includes(k) || (import.meta.env.DEV && k === 'case')) && [...p.keys()].every(k => p.getAll(k).length === 1) && a && (view === 'assignment' || view === 'attempt' && attempt && item || view === 'result' && result || view === 'item' && item);
  const denied = a?.access === 'denied' || attempt?.access === 'denied' || result?.access === 'denied' || item?.access === 'denied';
  const back = dailyReturn(a && view !== 'assignment' ? learningHref('assignment', a.id) : learningHref());
  const backView = new URL(back, location.href).searchParams.get('view');
  const backLabel = backView === 'attempt' ? 'Назад к попытке' : backView === 'result' ? 'Назад к результату' : backView === 'assignment' ? 'Назад к назначению' : backView === 'assignments' ? 'Вернуться к списку' : 'Вернуться к обучению';
  const linkedResult = a && attempt && assignmentResults(a).find(r => r.id === attempt.resultRef && r.attemptRef === attempt.id);
  const linkedAttempt = a && result && assignmentAttempts(a).find(t => t.id === result.attemptRef);
  return <div className="section-page daily-detail assignment-detail">
    <DailyLink size={40} view="text" href={back} remember={false}>{backLabel}</DailyLink>
    <h1 ref={heading} tabIndex={-1}>{!valid || denied ? 'Назначение' : view === 'attempt' ? 'Попытка тестирования' : view === 'result' ? 'Результат тестирования' : view === 'item' ? item!.title : a!.title}</h1>
    <LearningReadState />
    {read.state === 'ready' && read.snapshot.access === 'allowed' && (!valid ? <p>Объект недоступен. Проверьте адрес назначения.</p> : denied ? <p>Нет доступа к объекту обучения</p> : <>
      <SourceState />
      <article className="section-card daily-invest">
        {view !== 'assignment' && <h2>{a.title}</h2>}
        <AssignmentMeta assignment={a} />
        {view === 'assignment' && <AssignmentContent assignment={a} />}
        {view === 'item' && item && <><p>Версия: {item.version}</p><Launch assignment={a} item={item} /></>}
        {view === 'attempt' && attempt && item && <>
          <h2>{item.title}</h2><p>{attemptLabels[attempt.state]}</p><p>Начало: {attempt.startedAt}</p>
          {attempt.submittedAt && <p>Отправлено: {attempt.submittedAt}</p>}
          <p>Версия теста: {item.version}</p><p>{attempt.attemptPolicyRef ? `Правило попытки: ${attempt.attemptPolicyRef}` : 'Правило попытки пока неизвестно'}</p>
          {attempt.state === 'invalidated' && <p>{attempt.invalidationReason ?? 'Причина аннулирования пока недоступна'}</p>}
          {linkedResult ? linkedResult.access === 'allowed' ? <DailyLink size={40} view="secondary" href={entityHref('result', a.id, linkedResult.id)}>Открыть результат попытки</DailyLink> : <p>Нет доступа к результату</p> : <p>Результат попытки пока недоступен</p>}
          {['created', 'in_progress'].includes(attempt.state) && <Launch assignment={a} item={item} attempt={attempt.id} />}
          <small>Источник: {attempt.sourceRef.system} · Обновлено: {attempt.updatedAt}</small>
        </>}
        {view === 'result' && result && <><ResultSummary result={result} assignment={a} />{linkedAttempt && linkedAttempt.access === 'allowed' && <DailyLink size={40} view="text" href={entityHref('attempt', a.id, linkedAttempt.id)}>Открыть попытку</DailyLink>}</>}
      </article>
    </>)}
  </div>;
}
export function LearningRoutes() {
  const { read } = useLearning();
  const p = new URLSearchParams(location.search);
  const a = read.state === 'ready' ? selectAssignments(read.snapshot).find(a => a.id === p.get('assignment')) : undefined;
  if (p.get('view') === 'invest-class') return <InvestClassPage />;
  if (p.get('view') === 'events') return <Events full />;
  if (p.get('view') === 'event') return <EventDetails />;
  if (p.get('view') === 'assignments' && !p.has('group')) return <AssignmentQueue full />;
  if (p.get('view') === 'attempt' || p.get('view') === 'result' || a && !isDaily(a)) return <AssignmentDetails />;
  return <DailyDetails />;
}
