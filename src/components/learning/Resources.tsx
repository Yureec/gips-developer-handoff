import { useEffect, useRef, useState } from 'react';
import { Button } from '@alfalab/core-components/button';
import { Input } from '@alfalab/core-components/input';
import { Segment, SegmentedControl } from '@alfalab/core-components/segmented-control';
import { portalDataProvider } from '../../data/portalDataProvider';
import { availableMaterials, readHistory, readingState, resourceHref, resourceRecommendations, safeResourceReturn, type ReadingHistory, type ResourceCollection, type ResourceMaterial } from '../../domain/resources';
import type { RoleId } from '../../domain/navigation';
import './resources.css';

const storageKey = (role: RoleId) => `gips:reading:v1:${role}`;
function currentReturn() { const p = new URLSearchParams(location.search); p.delete('return'); return `?${p}`; }
function MaterialLink({ material, role, children }: { material: ResourceMaterial; role: RoleId; children?: React.ReactNode }) {
  return <Button size={40} view="text" aria-label={children ? `${children}: ${material.title}` : material.title} href={resourceHref(material.collection, material.id, { return: currentReturn() }, role)}>{children ?? material.title}</Button>;
}
export function ResourceEntrances() {
  return <nav className="resource-entrances" aria-label="Учебные ресурсы">
    <div className="section-card"><h2>Альфа-Инвестор</h2><p>Обзоры рынка и инвестиционных тем.</p><Button size={40} view="secondary" href={resourceHref('investor', undefined, { return: '?role=mass&section=learning' })}>Открыть Альфа-Инвестор</Button></div>
    <div className="section-card"><h2>База знаний</h2><p>Условия продуктов, ограничения и ответы на вопросы.</p><Button size={40} view="secondary" href={resourceHref('knowledge', undefined, { return: '?role=mass&section=learning' })}>Открыть базу знаний</Button></div>
  </nav>;
}
export function ResourceSuggestions() {
  const history = readHistory(storageKey('mass'));
  const suggestions = resourceRecommendations(portalDataProvider.getResources(), 'mass', history);
  return <section className="page-section" aria-labelledby="resource-suggestions"><div className="page-section__heading"><h2 id="resource-suggestions">Полезно по вашим темам</h2></div>
    <nav className="resource-actions" aria-label="История чтения"><Button size={40} view="secondary" href={resourceHref('knowledge', undefined, { list: 'started', all: '1' })}>Продолжить чтение</Button><Button size={40} view="text" href={resourceHref('knowledge', undefined, { list: 'completed', all: '1' })}>История прочитанного</Button></nav>
    <div className="resource-grid">{suggestions.map(({ material, reason }) => <article className="section-card" key={material.id}><h3>{material.title}</h3><p>{reason}</p><MaterialLink material={material} role="mass">{readingState(material, history) ? 'Продолжить материал' : 'Открыть материал'}</MaterialLink></article>)}</div>
    {!suggestions.length && <p>Все доступные материалы по фокусным продуктам прочитаны. Они остаются в истории и базе знаний.</p>}
  </section>;
}
export function ResourcesPage({ role, collection }: { role: RoleId; collection: ResourceCollection }) {
  const params = new URLSearchParams(location.search);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [history, setHistory] = useState<ReadingHistory>(() => readHistory(storageKey(role)));
  const [feedback, setFeedback] = useState('');
  const [query, setQuery] = useState(params.get('q') ?? '');
  const materials = portalDataProvider.getResources();
  const id = params.get('material');
  const material = availableMaterials(materials, role).find(m => m.id === id && m.collection === collection);
  const mode = params.get('list') ?? 'all';
  const explicitBack = safeResourceReturn(params.get('return'), location.href, role);
  const originKey = `resources-origin:${role}:${collection}:${id ?? 'list'}`;
  let storedBack: string | null = null;
  try { storedBack = safeResourceReturn(sessionStorage.getItem(originKey), location.href, role); } catch { /* optional storage */ }
  const back = explicitBack ?? storedBack ?? `?role=${role}&section=learning`;
  useEffect(() => { if (explicitBack) { try { sessionStorage.setItem(originKey, explicitBack); } catch { /* optional storage */ } } }, [explicitBack, originKey]);
  useEffect(() => {
    document.title = `${material?.title ?? (collection === 'knowledge' ? 'База знаний' : 'Альфа-Инвестор')} · ГИПС`;
    titleRef.current?.focus({ preventScroll: true });
    try { const scroll = Number(sessionStorage.getItem(`resources-scroll:${location.search}`) ?? 0); if (!id && Number.isFinite(scroll)) window.scrollTo(0, scroll); } catch { /* storage is optional */ }
    const sync = () => setHistory(readHistory(storageKey(role)));
    const saveScroll = () => { try { sessionStorage.setItem(`resources-scroll:${location.search}`, String(window.scrollY)); } catch { /* reading remains available */ } };
    window.addEventListener('storage', sync); window.addEventListener('pagehide', saveScroll);
    return () => { window.removeEventListener('storage', sync); window.removeEventListener('pagehide', saveScroll); };
  }, [role, collection, id, material?.title]);
  function record(state: 'started' | 'completed', anchor?: string) {
    if (!material) return;
    const next = { ...readHistory(storageKey(role)), [material.id]: { version: material.version, state, updatedAt: new Date().toISOString(), anchor } };
    try { localStorage.setItem(storageKey(role), JSON.stringify(next)); setHistory(next); setFeedback(state === 'completed' ? 'Материал отмечен прочитанным' : 'Место чтения сохранено'); }
    catch { setFeedback('Не удалось сохранить чтение. Разрешите хранение данных в браузере и повторите.'); }
  }
  const state = material && readingState(material, history);
  const visible = availableMaterials(materials, role).filter(m => (params.get('all') === '1' || m.collection === collection)
    && (!params.get('topic') || m.product?.section === params.get('topic'))
    && (mode === 'all' || readingState(m, history)?.state === mode)
    && `${m.title} ${m.summary}`.toLocaleLowerCase('ru').includes(query.toLocaleLowerCase('ru')))
    .sort((a, b) => mode === 'all' ? 0 : (readingState(b, history)?.updatedAt ?? '').localeCompare(readingState(a, history)?.updatedAt ?? ''));
  const listHref = (list: string) => resourceHref(collection, undefined, { list, ...(query ? { q: query } : {}), ...(params.get('all') ? { all: '1' } : {}), ...(params.get('topic') ? { topic: params.get('topic')! } : {}), ...(explicitBack ? { return: explicitBack } : {}) }, role);
  return <div className="section-page resources-page">
    <Button size={40} view="text" href={back}>{new URL(back, location.href).searchParams.get('section') === 'home' ? 'Вернуться на главную' : id ? 'Вернуться к списку или источнику' : 'Вернуться к обучению'}</Button>
    <h1 ref={titleRef} tabIndex={-1}>{id ? material?.title ?? 'Материал недоступен' : collection === 'knowledge' ? 'База знаний' : 'Альфа-Инвестор'}</h1>
    {id ? !material ? <section className="section-card"><p>Материал не найден или недоступен для вашей роли.</p><Button size={40} view="secondary" href={resourceHref(collection, undefined, {}, role)}>Открыть доступные материалы</Button></section> : <>
      <div className="resource-actions"><span>{state?.state === 'completed' ? 'Прочитано' : state ? 'Чтение начато' : 'Ещё не прочитано'}</span><span>Дата обновления: {material.updatedAt ?? 'не указана'}</span>
        <Button size={40} view="secondary" onClick={() => { record('started', state?.anchor); if (state?.anchor) document.getElementById(state.anchor)?.scrollIntoView(); }}>{state ? 'Продолжить чтение' : 'Начать чтение'}</Button>
      </div>
      {material.image && <img className="resource-image" src={material.image} alt="" />}
      <article className="section-card resource-content">{material.entries.map((entry, index) => <section id={`entry-${index}`} key={entry.title}><h2>{entry.title}</h2><p>{entry.text}</p><Button size={32} view="text" onClick={() => record('started', `entry-${index}`)}>Продолжить отсюда позже</Button></section>)}
        <Button size={40} view="secondary" disabled={state?.state === 'completed'} onClick={() => record('completed')}>Отметить прочитанным</Button><p className="resource-meta">Отметка сохраняется в истории чтения. Она не заменяет результат тестирования и не начисляет награду.</p>
      </article>
      <aside className="section-card resource-related"><h2>Источник и связанные материалы</h2><p>{material.source}</p>
        {material.original && <p>В портале доступно краткое содержание публикации.</p>}
        {material.product && <Button size={40} view="secondary" href={`?role=${role}&section=focus&product=${material.product.id}&return=${encodeURIComponent(currentReturn())}#${material.product.section}`}>Открыть раздел продукта «{material.product.title}»</Button>}
        {material.product && <Button size={40} view="text" href={`?role=${role}&section=focus&product=${material.product.id}&return=${encodeURIComponent(currentReturn())}#materials`}>Открыть исходные материалы продукта</Button>}
        {availableMaterials(materials, role).filter(m => m.id !== material.id && m.product && m.product.id === material.product?.id).map(m => <MaterialLink key={m.id} material={m} role={role} />)}
      </aside>
    </> : <>
      <div className="resource-actions"><Input label="Поиск материалов" value={query} onChange={(_, { value }) => { setQuery(value); const url = new URL(location.href); value ? url.searchParams.set('q', value) : url.searchParams.delete('q'); historyReplace(url); }} block size={48} />
        <SegmentedControl className="resource-tabs" size={40} selectedId={mode} onChange={value => { location.href = listHref(String(value)); }}><Segment id="all" title="Все" /><Segment id="started" title="Начатые" /><Segment id="completed" title="Прочитанные" /></SegmentedControl>
      </div>
      <p role="status">Найдено материалов: {visible.length}</p><div className="resource-grid">{visible.map(m => <article className="section-card" key={m.id}><h2>{m.title}</h2><p>{m.summary}</p><p className="resource-meta">{readingState(m, history)?.state === 'completed' ? 'Прочитано' : readingState(m, history) ? 'Чтение начато' : 'Ещё не прочитано'}</p><MaterialLink material={m} role={role}>Открыть материал</MaterialLink></article>)}</div>
      {!visible.length && <section className="section-card"><h2>{mode === 'started' ? 'Начатых материалов пока нет' : mode === 'completed' ? 'История чтения пока пуста' : 'Материалы не найдены'}</h2><p>Выберите материал из доступного списка или сбросьте фильтры.</p><Button size={40} view="secondary" href={resourceHref(collection, undefined, {}, role)}>Показать все материалы</Button></section>}
    </>}
    <p role="status">{feedback}</p>
  </div>;
}
function historyReplace(url: URL) { window.history.replaceState(window.history.state, '', url); }
