import { InvestClassCatalog } from '../components/learning/InvestClass';
import { ResourceEntrances, ResourceSuggestions } from '../components/learning/Resources';
import { eventHref } from '../domain/events';
import { AssignmentQueue, OverdueNotice } from '../components/learning/AssignmentQueue';
import { DailyLink } from '../components/learning/DailyLink';
import { queueHref } from '../domain/learning';
import { DailyInvest } from '../components/learning/DailyInvest';
import { useState, type ReactNode } from 'react';
import { Button } from '@alfalab/core-components/button';
import { ArrowsForkMIcon } from '@alfalab/icons-glyph/ArrowsForkMIcon';
import { BookOpenCheckmarkMIcon } from '@alfalab/icons-glyph/BookOpenCheckmarkMIcon';
import { CategoryDocumentMIcon } from '@alfalab/icons-glyph/CategoryDocumentMIcon';
import { DocumentCheckmarkMIcon } from '@alfalab/icons-glyph/DocumentCheckmarkMIcon';
import { InformationCircleMIcon } from '@alfalab/icons-glyph/InformationCircleMIcon';
import { LightningMIcon } from '@alfalab/icons-glyph/LightningMIcon';
import { PfmBookMIcon } from '@alfalab/icons-glyph/PfmBookMIcon';
import { StatsChartMIcon } from '@alfalab/icons-glyph/StatsChartMIcon';
import { UserVoiceMIcon } from '@alfalab/icons-glyph/UserVoiceMIcon';
import { VideoCameraMIcon } from '@alfalab/icons-glyph/VideoCameraMIcon';

import { AccessibleProgressBar } from '../components/AccessibleProgressBar';
import { PageHero, StatusTag } from '../components/PagePrimitives';
import { WidgetIconBadge } from '../components/widgets/WidgetPrimitives';
import type { LearningData, SurfaceTone } from '../data/provider';
import type { SectionId } from '../domain/navigation';

interface LearningPageProps {
  data: LearningData;
  onNavigate: (section: SectionId) => void;
  onOpenScenario: (key: string) => void;
}

function toneForBadge(tone: SurfaceTone) {
  return tone === 'gold' ? 'gold' : tone;
}

function ModuleIcon({ id }: { id: string }) {
  const icons: Record<string, ReactNode> = {
    'daily-invest': <LightningMIcon />,
    'pro-investments': <StatsChartMIcon />,
    webinars: <VideoCameraMIcon />,
    tests: <DocumentCheckmarkMIcon />,
    workshops: <UserVoiceMIcon />,
    tracks: <ArrowsForkMIcon />,
    courses: <BookOpenCheckmarkMIcon />,
    'all-modules': <CategoryDocumentMIcon />,
  };

  return icons[id] ?? <PfmBookMIcon />;
}

export function LearningPage({ data, onNavigate, onOpenScenario }: LearningPageProps) {
  const [message, setMessage] = useState('');

  const openItem = (title: string) => setMessage(`Материалы программы «${title}» пока не добавлены.`);

  return (
    <div className="section-page learning-page">
      <PageHero
        icon={<PfmBookMIcon />}
        tags={
          <>
            <StatusTag tone="violet">{data.tags[0]}</StatusTag>
            <StatusTag tone="gold">{data.tags[1]}</StatusTag>
            <StatusTag tone="green">{data.tags[2]}</StatusTag>
          </>
        }
        title={data.title}
        description={data.description}
        tone="violet"
      >
        <div className="metric-grid metric-grid--three">
          <div className="metric-card">
            <span>До следующего уровня</span>
            <strong>{data.metrics.nextLevel.value} <small>{data.metrics.nextLevel.unit}</small></strong>
            <AccessibleProgressBar label={`Прогресс до следующего уровня: ${data.metrics.nextLevel.progress}%`} value={data.metrics.nextLevel.progress} view="link" size={4} />
          </div>
          <div className="metric-card">
            <span>Заработано на обучении · период уточняется</span>
            <strong className="metric-gold">{data.metrics.earned.value} <small>{data.metrics.earned.unit}</small></strong>
          </div>
          <div className="metric-card">
            <span>Активность недели</span>
            <strong>{data.metrics.weekly.value}</strong>
            <small>{data.metrics.weekly.detail}</small>
          </div>
        </div>
      </PageHero>

      <OverdueNotice />
      <ResourceEntrances />
      <section className="page-section" aria-labelledby="learning-now-title">
        <div className="page-section__heading">
          <h2 id="learning-now-title">Что пройти сейчас</h2>
        </div>
        <div className="learning-now-grid learning-work-grid">
          <DailyInvest />
          <AssignmentQueue />
        </div>
        <InvestClassCatalog />
      </section>

      <aside className="page-note" aria-label="Правило начисления инвест-коинов">
        <InformationCircleMIcon aria-hidden="true" />
        <p><strong>Правило:</strong> {data.rule}</p>
      </aside>

      <section className="page-section" aria-labelledby="learning-main-title">
        <div className="page-section__heading">
          <h2 id="learning-main-title">Основное обучение</h2>
          <span>обязательные форматы и назначенные треки</span>
        </div>
        <div className="learning-module-grid">
          {data.modules.filter(module => module.id !== 'daily-invest').map((module) => module.id === 'tests' ? (
            <article className="section-card daily-invest" key={module.id}><WidgetIconBadge tone={toneForBadge(module.tone)}><ModuleIcon id={module.id} /></WidgetIconBadge><h3>{module.title}</h3><p>Назначенные тестирования и результаты</p><DailyLink size={40} view="secondary" href={queueHref({ kind: 'assessment' })}>Открыть тестирования</DailyLink></article>
          ) : ['webinars', 'workshops'].includes(module.id) ? (
            <article className="section-card daily-invest" key={module.id}><WidgetIconBadge tone={toneForBadge(module.tone)}><ModuleIcon id={module.id} /></WidgetIconBadge><h3>{module.title}</h3><p>{module.description}</p><DailyLink size={40} view="secondary" href={eventHref(undefined, { format: module.id === 'webinars' ? 'webinar' : 'workshop' })}>Открыть афишу</DailyLink></article>
          ) : (
            <button
              className={`learning-module-card${module.id === 'all-modules' ? ' is-catalog' : ''}`}
              key={module.id}
              type="button"
              onClick={() => module.id === 'all-modules' ? onOpenScenario('learning-catalog') : openItem(module.title)}
            >
              <WidgetIconBadge tone={toneForBadge(module.tone)}><ModuleIcon id={module.id} /></WidgetIconBadge>
              <strong>{module.title}</strong>
              <span>{module.description}</span>
              {typeof module.progress === 'number' ? (
                <AccessibleProgressBar label={`${module.title}: ${module.progress}%`} value={module.progress} view="link" size={4} />
              ) : null}
              {module.meta ? <small>{module.meta}</small> : null}
            </button>
          ))}
        </div>
      </section>

      <ResourceSuggestions />
      <nav className="resource-actions" aria-label="Другие учебные материалы"><Button size={40} view="text" onClick={() => onOpenScenario('client-view')}>Клиентский вид</Button><Button size={40} view="text" onClick={() => onOpenScenario('learning-catalog')}>Каталог программ</Button></nav>
      <p className="action-feedback page-action-feedback" role="status" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
