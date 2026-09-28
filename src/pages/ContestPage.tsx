import { type ReactNode, useEffect, useState } from 'react';
import { Button } from '@alfalab/core-components/button';
import { CatalogFilter } from '../components/CatalogFilter';
import { CompactSearch } from '../components/CompactSearch';
import { ArrowLeftMIcon } from '@alfalab/icons-glyph/ArrowLeftMIcon';
import { PfmCupMIcon } from '@alfalab/icons-glyph/PfmCupMIcon';
import { AlfaSelect } from '../components/AlfaSelect';
import { AccessibleProgressBar } from '../components/AccessibleProgressBar';
import { StatusTag } from '../components/PagePrimitives';
import { Heading, MetricValue } from '../components/Typography';
import { contests } from '../data/contests';
import { contestResults } from '../data/contestResults';
import { contestEmployeeId, contestHref, contestNumber, contestState, contestStateLabels, contestsAsOf, qualification, rankedResults, thresholdMet, type Contest, type ContestGroup, type ContestResultRow, type ContestResults } from '../domain/contests';
import './contests.css';

function replaceParams(values: Record<string, string>) {
  const url = new URL(location.href);
  Object.entries(values).forEach(([key,value]) => value ? url.searchParams.set(key,value) : url.searchParams.delete(key));
  history.replaceState(history.state, '', url);
}
function PdfLink({ contest }: { contest: Contest }) {
  // Downloads work both over HTTP and from the inlined file:// release.
  return <Button size={40} view="secondary" href={contest.pdf} download={`${contest.title}.pdf`}>Скачать условия · PDF</Button>;
}
function Progress({ contest, group, row, total, periodControl }: { contest: Contest; group: ContestGroup; row?: ContestResultRow; total?: number; periodControl?: ReactNode }) {
  const state = contestState(contest);
  return <section className="section-card contest-personal" aria-labelledby="contest-personal-title">
    <div className="contest-section-heading"><Heading level={2} variant="card" id="contest-personal-title">Личный прогресс</Heading>{periodControl}</div>
    <div className="contest-personal-content" tabIndex={0} role="region" aria-label="Показатели и пороги конкурса">
    <p className="contest-muted">{group.title}</p>
    <dl className="contest-personal-summary metric-contract"><div><dt>{contest.rankingLabel}</dt><dd><MetricValue variant="compact">{row ? contestNumber(row.score,contest.rankingUnit) : '—'}</MetricValue></dd></div><div><dt>Место в рейтинге</dt><dd><MetricValue variant="compact">{row?.rank ? `${row.rank} из ${total}` : '—'}</MetricValue></dd></div></dl>
    {!row && <p className="contest-empty-copy">{state === 'upcoming' ? 'Прогресс появится после начала конкурса и публикации первых результатов.' : 'Личный результат за этот период пока не опубликован.'}</p>}
    <div className="contest-thresholds">{group.thresholds.map(t => {
      const value = row?.values[t.id]; const met = thresholdMet(t,value);
      return <div className="contest-threshold" key={t.id}><div><span>{t.label}</span><strong>{value == null ? '—' : contestNumber(value,t.unit)} <span className="contest-muted">/ {t.comparison === 'gt' ? '>' : '≥'} {contestNumber(t.target,t.unit)}</span></strong></div>
        {value != null && <AccessibleProgressBar value={Math.min(100,Math.max(0,value/t.target*100))} label={`${t.label}: ${contestNumber(value,t.unit)}, порог ${contestNumber(t.target,t.unit)}`} view={met ? 'positive' : 'accent'} size={8} />}
        {value != null && <span className="contest-muted">{met ? 'Порог выполнен' : value === t.target && t.comparison === 'gt' ? 'Нужно превысить порог' : `До порога ${contestNumber(Math.max(0,t.target-value),t.unit)}`}</span>}
      </div>;
    })}</div>
    <p className="contest-muted">Победителей определяют по итогам конкурса с учётом всех условий.</p>
    </div>
  </section>;
}
function ContestDetails({ contest, results }: { contest: Contest; results: ContestResults[] }) {
  const params = new URLSearchParams(location.search);
  const groupId = contest.personalGroupId ?? contest.groups[0].id;
  const [periodId,setPeriodId] = useState(contest.periods.some(p => p.id === params.get('period')) ? params.get('period')! : contest.defaultPeriodId);
  const [page,setPage] = useState(1);
  const [revealPersonal,setRevealPersonal] = useState(0);
  const group = contest.groups.find(g => g.id === groupId)!;
  const rankingLabel = group.rankingLabel ?? contest.rankingLabel;
  const rankingUnit = group.rankingUnit ?? contest.rankingUnit;
  const period = contest.periods.find(p => p.id === periodId)!;
  const snapshot = results.find(r => r.contestId === contest.id && r.groupId === contest.personalGroupId && r.periodId === periodId);
  const rows = rankedResults(snapshot?.rows ?? []);
  const personalGroup = contest.groups.find(g => g.id === contest.personalGroupId);
  const personalSnapshot = results.find(r => r.contestId === contest.id && r.groupId === contest.personalGroupId && r.periodId === periodId);
  const personalRow = rankedResults(personalSnapshot?.rows ?? []).find(r => r.employeeId === contestEmployeeId);
  const visible = rows;
  const personalIndex = rows.findIndex(r => r.employeeId === contestEmployeeId);
  useEffect(() => {
    if (revealPersonal) document.querySelector<HTMLTableRowElement>('.contest-current-row')?.focus({ preventScroll: false });
  }, [revealPersonal]);
  const pageCount = Math.max(1,Math.ceil(visible.length/10));
  const displayed = visible.slice((page-1)*10,page*10);
  const backFilters = Object.fromEntries(['q','list'].map(k => [k, params.get(k) ?? '']).filter(([,v])=>v));
  const state = contestState(contest);
  function selectPeriod(value: string) { setPeriodId(value); setPage(1); replaceParams({ period:value }); }
  return <>
    <section className="section-card contest-detail-hero">
      <div className="contest-detail-hero__body">
        <Button className="contest-back" size={32} view="text" leftAddons={<ArrowLeftMIcon aria-hidden="true" />} href={contestHref(undefined,backFilters)}>Все конкурсы</Button>
        <div className="contest-tags"><StatusTag tone={state === 'active' ? 'green' : 'neutral'}>{contestStateLabels[state]}</StatusTag><span>{contest.periodLabel}</span></div>
        <Heading level={1} variant="page">{contest.title}</Heading>
        {contest.subtitle && <p className="contest-subtitle">{contest.subtitle}</p>}
        <p>{contest.description}</p><span className="contest-muted">{contest.organizer}</span>
        <div className="contest-hero-actions"><Button size={40} view="primary" href="#contest-ranking">Посмотреть рейтинг</Button><PdfLink contest={contest} /></div>
      </div><img className="contest-detail-cover" src={contest.image} alt={`Обложка конкурса «${contest.title}»`} />
    </section>

    <div className="contest-detail-grid">
      {personalGroup ? <Progress contest={contest} group={personalGroup} row={personalRow} total={personalSnapshot?.rows.length} periodControl={contest.periods.length > 1 ? <div className="contest-sprint"><AlfaSelect accessibleName="Период конкурса" size={40} block className="role-select-control" fieldClassName="role-select-control__field" options={contest.periods.map(p=>({key:p.id,content:p.title.split(' · ')[0],description:p.title.split(' · ')[1]}))} selected={periodId} onChange={({selected})=>selected && selectPeriod(selected.key)} /></div> : undefined} /> : <section className="section-card contest-personal"><Heading level={2} variant="card">Участие в конкурсе</Heading><p>Личный результат по этому конкурсу недоступен.</p><p className="contest-muted">Условия, материалы и рейтинг участников доступны ниже.</p></section>}

      <section className="section-card contest-copy contest-about"><Heading level={2} variant="card">О конкурсе</Heading><dl className="contest-facts" tabIndex={0} aria-label="Сведения о конкурсе"><div><dt>Цель конкурса</dt><dd>{contest.goal}</dd></div>{contest.milestones.map(m=><div key={m.title}><dt>{m.title}</dt><dd>{m.value}</dd></div>)}</dl></section>
      <section className="section-card contest-copy" id="contest-materials"><Heading level={2} variant="card">Материалы</Heading><p>Презентация конкурса с условиями, призами и оформлением.</p><PdfLink contest={contest} /></section>
      <section className="section-card contest-ranking" id="contest-ranking" aria-labelledby="contest-ranking-title">
        <div className="contest-section-heading"><Heading level={2} variant="card" id="contest-ranking-title">Рейтинг участников</Heading><div className="contest-ranking-meta">{snapshot && <span className="contest-muted">Обновлено {new Date(`${snapshot.asOf}T12:00:00`).toLocaleDateString('ru-RU')}</span>}<StatusTag>{snapshot?.state === 'final' ? 'Итоговый' : snapshot ? 'Промежуточный' : 'Ожидает публикации'}</StatusTag></div></div>
        {personalIndex >= 0 && <div className="contest-ranking-summary"><Button size={32} view="text" onClick={()=>{setPage(Math.floor(personalIndex / 10) + 1);setRevealPersonal(value=>value+1);}}>Моя строка</Button></div>}
        <div className="contest-table-wrap"><table className="contest-table"><caption className="sr-only">{contest.title} · {group.title} · {period.title}</caption><thead><tr><th scope="col">Место</th><th scope="col">Участник</th><th scope="col">{rankingLabel}</th><th scope="col">Пороги</th></tr></thead><tbody>
          {displayed.map(row=><tr key={row.employeeId} tabIndex={row.employeeId===contestEmployeeId ? -1 : undefined} className={row.employeeId===contestEmployeeId?'contest-current-row':''}><td><strong>{row.rank}</strong></td><th scope="row"><span>{row.name}{row.employeeId===contestEmployeeId ? ' · Вы' : ''}</span><small>{row.office}</small></th><td>{contestNumber(row.score,rankingUnit)}</td><td>{group.thresholds.length ? {met:'Выполнены',pending:'Не все выполнены',unknown:'Уточняются'}[qualification(group,row)] : 'Не установлены'}</td></tr>)}
          {!displayed.length && <tr><td colSpan={4} className="contest-table-empty">{!snapshot ? state==='upcoming' ? 'Рейтинг появится после старта конкурса.' : 'Результаты за выбранную группу и период пока не опубликованы.' : 'Результаты участников пока не опубликованы.'}</td></tr>}
        </tbody></table></div>
        <div className="contest-pagination"><span role="status">{snapshot ? `Показано ${displayed.length} из ${visible.length}` : 'Результаты появятся после публикации'}</span>{pageCount>1 && <div><Button size={32} view="secondary" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Назад</Button><span>{page} / {pageCount}</span><Button size={32} view="secondary" disabled={page===pageCount} onClick={()=>setPage(p=>p+1)}>Далее</Button></div>}</div>
      </section>
    <aside className="contest-detail-side" aria-label="Призы и информация о конкурсе">

      <section className="section-card" id="contest-prizes"><Heading level={2} variant="card">За что соревнуемся</Heading><div className="contest-prizes-list">{contest.prizes.map(prize=><div key={prize.title}><span className="contest-prize-icon"><PfmCupMIcon aria-hidden="true" /></span><div><Heading level={3} variant="card">{prize.title}</Heading><p>{prize.description}</p></div></div>)}</div></section>
      <section className="section-card contest-copy" id="contest-rules"><Heading level={2} variant="card">Условия конкурса</Heading><ul>{contest.rules.map(rule=><li key={rule}>{rule}</li>)}</ul>
        <Heading level={3} variant="card">Группы и квоты</Heading><div className="contest-table-wrap"><table className="contest-table"><caption className="sr-only">Квоты участников конкурса</caption><thead><tr><th scope="col">Группа</th><th scope="col">Награда</th></tr></thead><tbody>{contest.groups.filter(g => !contest.personalGroupId || g.id === contest.personalGroupId).map(g=><tr key={g.id}><th scope="row">{g.title}</th><td>{g.rewardSummary ?? `${g.reward} · ${g.quota ?? 'без ограничения'}${g.quota == null ? '' : ' мест'}`}</td></tr>)}</tbody></table></div>
      </section>


    </aside></div>
  </>;
}
export function ContestPage({ catalog = contests, results = contestResults }: { catalog?: Contest[]; results?: ContestResults[] } = {}) {
  const params = new URLSearchParams(location.search);
  const id = params.get('contest');
  const contest = catalog.find(c=>c.id===id);
  const [query,setQuery] = useState(params.get('q') ?? '');
  const [filter,setFilter] = useState(['active','upcoming','ended'].includes(params.get('list')??'') ? params.get('list')! : 'all');
  useEffect(()=>{
    document.title=`${contest?.title ?? 'Конкурсы'} · ГИПС`;
    const save=()=>{try{sessionStorage.setItem(`resources-scroll:${location.search}`,String(window.scrollY));}catch{/* optional storage */}};
    window.addEventListener('pagehide',save);
    return ()=>window.removeEventListener('pagehide',save);
  },[contest]);
  const visible=catalog.filter(c=>(filter==='all'||contestState(c)===filter)&&`${c.title} ${c.subtitle??''} ${c.products.join(' ')} ${c.audience}`.toLocaleLowerCase('ru').includes(query.toLocaleLowerCase('ru')));
  return <div className="section-page contests-page">
    {id ? contest ? <ContestDetails key={id} contest={contest} results={results} /> : <section className="section-card"><Heading level={1} variant="page">Конкурс не найден</Heading><p>Выберите конкурс из каталога.</p><Button size={40} view="secondary" href={contestHref()}>Все конкурсы</Button></section> : <>
      <h1 className="sr-only">Конкурсы</h1>
      <div className="contest-catalog-filters"><CatalogFilter label="Статус конкурса" value={filter} onChange={value=>{setFilter(value);replaceParams({list:value});}} options={(['all','active','upcoming','ended'] as const).map(state=>({id:state,title:state==='all'?'Все':contestStateLabels[state]}))} /><CompactSearch direction="right" label="Поиск конкурсов" placeholder="Название или ключевое слово" size={32} value={query} onChange={value=>{setQuery(value);replaceParams({q:value});}} /><span className="contest-muted contest-data-date">Данные на {new Date(`${contestsAsOf}T12:00:00`).toLocaleDateString('ru-RU')}</span></div>
      <p className="sr-only" role="status">Найдено конкурсов: {visible.length}</p>
      <div className="contest-catalog-grid">{visible.map(c=>{
        const state=contestState(c);const href=contestHref(c.id,{...(query?{q:query}:{}),...(filter!=='all'?{list:filter}:{})});
        return <article className="contest-catalog-card" key={c.id}><a className="contest-card-cover" href={href} aria-label={`Открыть конкурс «${c.title}»`}><img src={c.image} alt="" /></a><div className="contest-card-body"><div className="contest-tags"><StatusTag tone={state==='active'?'green':'neutral'}>{contestStateLabels[state]}</StatusTag><span>{c.products.join(' · ')}</span></div><Heading level={2} variant="card"><a href={href}>{c.title}</a></Heading><span className="contest-card-period">{c.periodLabel}</span><p>{c.description}</p><div className="contest-card-footer"><Button size={40} view="secondary" href={href}>Условия и результаты</Button></div></div></article>;
      })}</div>
      {!visible.length && <section className="section-card"><Heading level={2} variant="card">Конкурсы не найдены</Heading><p>Измените запрос или сбросьте фильтры.</p><Button size={40} view="secondary" onClick={()=>{setQuery('');setFilter('all');replaceParams({q:'',list:''});}}>Сбросить фильтры</Button></section>}
    </>}
  </div>;
}
