import { MaterialViewer } from '../components/focus/MaterialViewer';
import { ChevronDownMIcon } from '@alfalab/icons-glyph/ChevronDownMIcon';
import './focus.css';
import { useEffect, useState } from 'react';
import { Button } from '@alfalab/core-components/button';
import { Input } from '@alfalab/core-components/input';
import { Accordion } from '@alfalab/core-components/accordion';
import { PageBack, ProductMark } from '../components/PagePrimitives';
import { SalesKpiWidget } from '../components/widgets/SalesKpiWidget';
import { WidgetHeader } from '../components/widgets/WidgetHeader';
import { type FocusProduct } from '../data/focusCatalog';
import { percentage, rubles, salesProgress, type SalesPeriod } from '../domain/focus';

function jumpTo(id: string) {
  const element = document.getElementById(id);
  element?.scrollIntoView({ block: 'start' });
  element?.focus({ preventScroll: true });
}
function ProductQuestion({ title, text }: { title: string; text: string }) {
  const [expanded, setExpanded] = useState(false);
  return <Accordion header={title} expanded={expanded} onExpandedChange={setExpanded}
    control={<ChevronDownMIcon aria-hidden="true" style={{ transform: expanded ? 'rotate(180deg)' : undefined }} />}
    className="focus-question" containerClassName="focus-question__control"
    onKeyDown={event => { if (event.key === ' ' && (event.target as HTMLElement).getAttribute('role') === 'button') { event.preventDefault(); setExpanded(value => !value); } }}>
    <p aria-hidden={!expanded}>{text}</p>
  </Accordion>;
}
function ContributionExample() {
  const [amount, setAmount] = useState('200000');
  const numeric = Number(amount.replace(/\s/g, '').replace(',', '.'));
  const valid = amount.trim() !== '' && Number.isFinite(numeric) && numeric >= 30000 && numeric <= 20000000 && Number.isInteger(numeric);
  return <section className="section-card focus-study-section" id="example" tabIndex={-1} aria-labelledby="example-title">
    <WidgetHeader>Разбираем на примере</WidgetHeader><h2 id="example-title">Как работают взносы и выплата</h2>
    <p>Три одинаковых взноса. Доход начисляется на каждый, а выплачивается в конце срока вместе с накопленной суммой.</p>
    <div className="focus-example-input"><Input label="Ежегодный взнос, ₽" aria-label="Ежегодный взнос, ₽" inputMode="numeric" value={amount} onChange={(_, { value }) => setAmount(value)} size={56} block error={!valid ? 'Введите целую сумму от 30 000 до 20 000 000 ₽' : undefined} /><span>21% от каждого взноса за весь срок.<br />Не является годовой ставкой.</span></div>
    {valid ? <div aria-live="polite">
      <ol className="focus-timeline">{[1, 2, 3].map(year => <li key={year}><span>{year}-й год</span><strong>{rubles(numeric)}</strong><small>+ {rubles(numeric * .21)} дохода</small></li>)}</ol>
      <div className="focus-example-result"><div><span>Выплата в конце 3-го года</span><strong>{rubles(numeric * 3 * 1.21)}</strong><small>До вычета НДФЛ</small></div><dl><div><dt>Всего внесено</dt><dd>{rubles(numeric * 3)}</dd></div><div><dt>Доход за весь срок</dt><dd>{rubles(numeric * 3 * .21)}</dd></div></dl></div>
    </div> : <p role="status">Расчёт появится после ввода допустимой суммы.</p>}
    <p className="focus-muted">Учебный пример по предоставленным условиям. Показывает выплату при дожитии и внесении всех взносов; не рассчитывает досрочное расторжение и индивидуальный налог.</p>
  </section>;
}
export function FocusPage({ data, period, onBack }: { data: FocusProduct; period: SalesPeriod; onBack: () => void }) {
  useEffect(() => { const id = location.hash.slice(1); if (id === 'materials' || data.sections.some(s => s.id === id)) requestAnimationFrame(() => jumpTo(id)); }, [data]);
  const [material, setMaterial] = useState<{ title: string; href: string } | null>(null);
  const days = salesProgress(data.sales, period);
  const navigation = [{ id: 'about', title: 'О продукте' }, ...(data.hasExample ? [{ id: 'example', title: 'Пример расчёта' }] : []), ...data.sections.map(({ id, title }) => ({ id, title })), { id: 'materials', title: 'Исходные материалы' }];
  return <div className="section-page focus-study-page">
    {material && <MaterialViewer key={material.href} material={material} onClose={() => setMaterial(null)} />}
    <div className="focus-study-layout">
      <div className="focus-study-main">
        <section className="section-card focus-product-hero">
          <PageBack label={new URLSearchParams(location.search).has('return') ? 'Вернуться к материалу' : 'Все фокусные продукты'} onClick={onBack} />
          <div className="focus-product-hero__identity"><ProductMark image={data.logo} label={data.id === 'autofollow' ? 'АС' : 'НСЖ'} /><div><h1>{data.title}</h1><p>{data.description}</p></div></div>
          {data.facts.length > 0 && <dl className="focus-facts">{data.facts.map(fact => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>}
          {data.hasExample && <div className="focus-hero-actions"><Button size={40} view="primary" onClick={() => jumpTo('example')}>Разобрать пример</Button><Button size={40} view="secondary" onClick={() => jumpTo('conversation')}>Подготовить разговор</Button></div>}
        </section>
        <section className="section-card focus-study-section" id="about" tabIndex={-1} aria-labelledby="about-title"><WidgetHeader>Суть продукта</WidgetHeader><h2 id="about-title">Кому подойдёт</h2><p>{data.audience}</p>
          {data.benefits.length > 0 && <div className="focus-benefits">{data.benefits.map((benefit) => <div key={benefit.title}><h3>{benefit.title}</h3><p>{benefit.description}</p></div>)}</div>}
          {data.important && <div className="focus-important"><strong>{data.important.title}</strong><p>{data.important.text}</p></div>}
          {data.hasExample && <div className="focus-important"><strong>Сначала убедитесь, что у клиента есть резерв</strong><p>Деньги в программе рассчитаны на три года. При досрочном расторжении возможна потеря части или всей внесённой суммы.</p></div>}
        </section>
        {data.hasExample && <ContributionExample />}
        {data.sections.map(section => <section className="section-card focus-study-section" key={section.id} id={section.id} tabIndex={-1} aria-labelledby={`${section.id}-title`}><h2 id={`${section.id}-title`}>{section.title}</h2>
          {section.id === 'objections' ? section.entries.map(entry => <ProductQuestion key={entry.title} title={entry.title} text={entry.text} />) : <div className="focus-study-entries">{section.entries.map(entry => <div key={entry.title}><h3>{entry.title}</h3><p>{entry.text}</p>{entry.links?.map(link => <a className="focus-reference" key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.title}</a>)}</div>)}</div>}
        </section>)}
        <section className="section-card focus-source" id="materials" tabIndex={-1}><WidgetHeader>Материалы продукта</WidgetHeader><p>{data.source}</p>{data.materials && <div className="focus-materials">{data.materials.map(material => <Button key={material.href} onClick={() => setMaterial(material)} view="secondary" size={40}>{material.title}</Button>)}</div>}{data.hasExample && <p>Содержание презентации собрано в разделах выше. Перед оформлением используйте актуальный договор и приложения страховщика.</p>}</section>
      </div>
      <aside className="focus-study-side" aria-label="Навигация и мои продажи">
        <SalesKpiWidget
          className="focus-personal-sales"
          heading="Мои продажи"
          actual={rubles(data.sales.actual)}
          plan={rubles(data.sales.plan)}
          progress={days.runRate ?? 0}
          runRate={percentage(days.runRate)}
          hintTitle={days.runRate === null ? 'Показатели пока недоступны.' : days.runRate >= 100 ? 'Темп выше плана.' : 'Проверьте темп продаж.'}
          hint={days.completion === null ? 'План и факт по продукту не заданы.' : `Выполнено ${percentage(days.completion)} плана по продукту.`}
          footer={<span className="focus-summary__date">Данные на {period.asOf.split('-').reverse().join('.')} · {days.elapsed} из {days.total} рабочих дней</span>}
        />
        <nav className="section-card focus-toc" aria-label="Разделы продукта"><WidgetHeader>В этом продукте</WidgetHeader>{navigation.map((item, index) => <Button key={item.id} size={40} view="text" onClick={() => jumpTo(item.id)}><span className="focus-toc__number">{String(index + 1).padStart(2, '0')}</span>{item.title}</Button>)}</nav>
      </aside>
    </div>
  </div>;
}
