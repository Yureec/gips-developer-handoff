import { useEffect, useState } from 'react';
import { Button } from '@alfalab/core-components/button';
import { CalendarMIcon } from '@alfalab/icons-glyph/CalendarMIcon';
import { ClockMIcon } from '@alfalab/icons-glyph/ClockMIcon';
import { PinLocationMIcon } from '@alfalab/icons-glyph/PinLocationMIcon';
import { PfmBookMIcon } from '@alfalab/icons-glyph/PfmBookMIcon';
import { investClassHref, investClassItems, investClassKinds, type InvestClassItem } from '../../data/investClass';
import { PageHero, StatusTag } from '../PagePrimitives';
import { Metadata } from '../Typography';
import { RewardChip } from '../RewardChip';
import { CarouselPager } from '../widgets/CarouselPager';
import { WidgetHeader } from '../widgets/WidgetHeader';
import { StepProgress, WidgetMeta } from '../widgets/WidgetPrimitives';
import { dailyReturn, DailyLink } from './DailyLink';
import './invest-class.css';

function Progress({ item }: { item: InvestClassItem }) {
  if (!item.progress) return null;
  const { completed, total } = item.progress;
  const label = `Пройдено ${completed} из ${total} траекторий`;
  return <div className="invest-class-progress"><StepProgress completed={completed} total={total} label={label} /><Metadata variant="detail">{label}</Metadata></div>;
}
// Source ranges describe editorial structure only; wording stays in the original file.
export const interviewQuestions = [[1, 2], [7, 8], [12, 13], [17, 21], [22, 23], [25, 26], [29, 30]] as const;
export function InterviewTranscript({ text }: { text: string }) {
  const lines = text.match(/[^\n]*\n|[^\n]+$/g) ?? [];
  return <div className="invest-class-transcript">
    <p className="invest-class-intro" data-source-text>{lines[0]}</p>
    {interviewQuestions.map(([start, end], index) => <section className="invest-class-qa" key={start} aria-labelledby={`interview-question-${index}`}>
      <h2 id={`interview-question-${index}`} data-source-text>{lines.slice(start, end).map((line, part) => /^\d{2}:\d{2}/.test(line) ? <span className="invest-class-source-time" key={part}>{line}</span> : line)}</h2>
      <div className="invest-class-answer">
        {lines.slice(end, interviewQuestions[index + 1]?.[0] ?? lines.length).map((line, paragraph) => <p data-source-text key={paragraph}>{line}</p>)}
      </div>
    </section>)}
  </div>;
}
export function InvestClassWidget() {
  const [index, setIndex] = useState(() => {
    try { const value = Number(sessionStorage.getItem('invest-class-slide')); return Number.isInteger(value) && value >= 0 && value < investClassItems.length ? value : 0; } catch { return 0; }
  });
  const item = investClassItems[index];
  return <article className={`widget widget--invest-class widget--invest-class-${item.kind}`} aria-label="Инвест-класс">
    <WidgetHeader>Инвест-класс</WidgetHeader>
    <div className="event-meta-row"><WidgetMeta icon={<CalendarMIcon />}>{item.date}</WidgetMeta>{item.duration && <WidgetMeta icon={<ClockMIcon />}>{item.duration}</WidgetMeta>}</div>
    <div className="invest-class-preview">
    {item.kind === 'course' && <img className="invest-class-cover" src={item.image} alt="" />}
    <h2>{item.title}</h2>
    {item.kind !== 'course' && <p>{item.description}</p>}
    </div>
    <div className="invest-class-tail">
      {item.venue && <WidgetMeta icon={<PinLocationMIcon />}>{item.venue}</WidgetMeta>}
      <Progress item={item} />
      <div className="widget-card-footer">{item.reward ? <RewardChip>+{item.reward}</RewardChip> : <span />}
        <DailyLink size={32} view="text" href={investClassHref(item.id)}>{item.kind === 'track' ? 'Пройти обучение' : item.kind === 'course' ? 'Пройти курс' : 'Подробнее'}</DailyLink>
      </div>
    </div>
    <CarouselPager activeIndex={index} count={investClassItems.length} itemLabel="Инвест-класс" onChange={next => { setIndex(next); try { sessionStorage.setItem('invest-class-slide', String(next)); } catch { /* Optional preference */ } }} />
  </article>;
}
export function InvestClassCatalog({ eventsOnly = false, full = false }: { eventsOnly?: boolean; full?: boolean }) {
  const params = new URLSearchParams(location.search);
  const format = eventsOnly ? params.get('format') : null;
  const query = eventsOnly ? params.get('q') ?? '' : '';
  const items = investClassItems.filter(item => (!eventsOnly || ['workshop', 'interview'].includes(item.kind)) && (!format || format === 'all' || (format === 'webinar' ? item.kind === 'interview' : item.kind === format)) && item.title.toLocaleLowerCase('ru').includes(query.toLocaleLowerCase('ru')));
  const title = eventsOnly ? 'Мероприятия и вебинары' : 'Инвест-класс';
  return <section className={full ? 'section-page' : 'page-section'} aria-label={title}>
    {full && <DailyLink size={40} view="text" remember={false} href="?role=mass&section=learning">Вернуться к обучению</DailyLink>}
    {full ? <h1>{title}</h1> : <div className="page-section__heading"><h2>{title}</h2></div>}
    <div className="invest-class-catalog">{items.map(item => <article key={item.id} className="section-card invest-class-card">
      <span className="widget-eyebrow">{investClassKinds[item.kind]}{item.date !== investClassKinds[item.kind] ? ` · ${item.date}` : ''}</span><h3>{item.title}</h3><p>{item.description}</p><Progress item={item} />
      <DailyLink size={40} view="text" href={investClassHref(item.id)}>Открыть материал</DailyLink>
    </article>)}</div>
    {!items.length && <div className="section-card"><p>По выбранным условиям ничего не найдено</p><DailyLink size={40} view="text" remember={false} href="?role=mass&section=learning&view=events">Все мероприятия</DailyLink></div>}
  </section>;
}
export function InvestClassPage() {
  const params = new URLSearchParams(location.search);
  const id = params.get('item');
  const valid = [...params.keys()].every(key => ['role', 'section', 'view', 'item'].includes(key) && params.getAll(key).length === 1);
  const item = valid ? investClassItems.find(row => row.id === id) : undefined;
  const back = dailyReturn('?role=mass&section=learning');
  const backParams = new URL(back, location.href).searchParams;
  const backLabel = backParams.get('section') === 'home' ? 'Вернуться на главную' : backParams.get('view') === 'events' ? 'Вернуться к афише' : backParams.get('view') === 'invest-class' ? 'Вернуться к Инвест-классу' : 'Вернуться к обучению';
  useEffect(() => { if (item) document.title = `${item.title} · ГИПС`; }, [item]);
  if (!id && valid) return <InvestClassCatalog full />;
  return <div className="section-page invest-class-page">
    <DailyLink size={40} view="text" href={back} remember={false}>{backLabel}</DailyLink>
    {!item ? <section className="section-card"><h1>Материал не найден</h1><p>Проверьте адрес или выберите материал в Инвест-классе.</p><DailyLink size={40} view="secondary" href={investClassHref()}>Открыть Инвест-класс</DailyLink></section> : <>
      <PageHero icon={<PfmBookMIcon />} tags={<StatusTag>Инвест-класс · {investClassKinds[item.kind]}</StatusTag>} title={item.title} description={item.transcript ? `${item.date} · ${item.speaker?.name}` : item.description} />
      <div className="invest-class-layout">
        <div className="invest-class-body">
          {!item.transcript && <section className="section-card invest-class-status"><h2>{item.kind === 'interview' ? 'Материалы встречи' : 'Об обучении'}</h2><p>{item.availability}</p><Progress item={item} /></section>}
          <section className="section-card invest-class-content" aria-label={item.kind === 'interview' ? 'Вопросы и ответы' : 'Подготовка'}>
            {item.transcript && <InterviewTranscript text={item.transcript} />}
            {item.sections.map((section, index) => <section id={`topic-${index + 1}`} key={section.title}><h2>{section.title}</h2><p>{section.text}</p></section>)}
          </section>
        </div>
        <aside className="invest-class-aside" aria-label="Информация и материалы">
          {item.image && <img className={`invest-class-detail-image${item.kind === 'course' ? ' is-course' : ''}`} src={item.image} alt={item.imageAlt} />}
          <section className="section-card invest-class-facts"><h2>{item.speaker ? 'Спикер' : 'О программе'}</h2>
            {item.speaker && <><strong>{item.speaker.name}</strong><p>{item.speaker.role}</p></>}
            <dl><div><dt>{item.kind === 'assessment' ? 'Срок' : 'Дата / формат'}</dt><dd>{item.date}</dd></div>{item.duration && <div><dt>Продолжительность</dt><dd>{item.duration}</dd></div>}{item.venue && <div><dt>Место</dt><dd>{item.venue}</dd></div>}</dl>
            {item.reward && <><RewardChip>+{item.reward}</RewardChip><p>Награда за обучение. Условия начисления будут опубликованы вместе с программой.</p></>}
          </section>
          {item.links.length > 0 && <section className="section-card invest-class-materials"><h2>Материалы по теме</h2>{item.links.map(link => <Button key={link.href} size={40} view="text" href={link.href} {...(link.href.startsWith('https:') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{link.title}</Button>)}</section>}
        </aside>
      </div>
    </>}
  </div>;
}
