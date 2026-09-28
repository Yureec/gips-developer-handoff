import { useState, type ReactNode } from 'react';
import { Button } from '@alfalab/core-components/button';
import { ArrowsRightLeftCurvedMIcon } from '@alfalab/icons-glyph/ArrowsRightLeftCurvedMIcon';
import { BookCheckMIcon } from '@alfalab/icons-glyph/BookCheckMIcon';
import { BulbFlashMMIcon } from '@alfalab/icons-glyph/BulbFlashMMIcon';
import { CheckmarkMIcon } from '@alfalab/icons-glyph/CheckmarkMIcon';
import { FlameMIcon } from '@alfalab/icons-glyph/FlameMIcon';
import { PfmGamepadMIcon } from '@alfalab/icons-glyph/PfmGamepadMIcon';
import { StarMIcon } from '@alfalab/icons-glyph/StarMIcon';
import { UserVoiceMIcon } from '@alfalab/icons-glyph/UserVoiceMIcon';
import { UsersMIcon } from '@alfalab/icons-glyph/UsersMIcon';

import { AccessibleProgressBar } from '../components/AccessibleProgressBar';
import { AchievementGrid } from '../components/AchievementGrid';
import { PageHero, StatusTag } from '../components/PagePrimitives';
import { RewardChip } from '../components/RewardChip';
import { WidgetHeader } from '../components/widgets/WidgetHeader';
import { StepProgress, WidgetIconBadge, WidgetMeta } from '../components/widgets/WidgetPrimitives';
import type { GamesData, SurfaceTone } from '../data/provider';
import type { SectionId } from '../domain/navigation';

interface GamesPageProps {
  data: GamesData;
  onNavigate: (section: SectionId) => void;
  onOpenPublicProfile: (person: string) => void;
  onOpenScenario: (key: string) => void;
}

function OpportunityIcon({ id }: { id: string }) {
  const icons: Record<string, ReactNode> = {
    companion: <BulbFlashMMIcon />,
    marketplace: <StarMIcon />,
    mentor: <ArrowsRightLeftCurvedMIcon />,
    segments: <UsersMIcon />,
  };

  return icons[id] ?? <StarMIcon />;
}

function challengeIcon(id: string) {
  if (id === 'full-circle') return <FlameMIcon />;
  if (id === 'fund-talks') return <UserVoiceMIcon />;
  if (id === 'expert-practitioner') return <BookCheckMIcon />;
  return <CheckmarkMIcon />;
}

function badgeTone(tone: SurfaceTone) {
  return tone === 'gold' ? 'gold' : tone;
}

export function GamesPage({ data, onNavigate, onOpenPublicProfile, onOpenScenario }: GamesPageProps) {
  const [expandedChallenge, setExpandedChallenge] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const openMarketplace = () => onNavigate('marketplace');

  return (
    <div className="section-page games-page">
      <PageHero
        icon={<PfmGamepadMIcon />}
        tags={<StatusTag tone="gold">Игровая активность</StatusTag>}
        title={data.title}
        description={data.description}
        tone="warm"
      >
        <div className="metric-grid metric-grid--three">
          {data.metrics.map((metric) => {
            const content = (
              <>
                <span>{metric.label}</span>
                <strong className={`metric-${metric.tone}`}>{metric.value}</strong>
                {metric.detail ? <small>{metric.detail}</small> : null}
              </>
            );

            return metric.action === 'marketplace' ? (
              <button
                aria-label={`${metric.label}: ${metric.value}. Открыть маркетплейс`}
                className="metric-card metric-card--button"
                key={metric.label}
                type="button"
                onClick={openMarketplace}
              >
                {content}
              </button>
            ) : (
              <div className="metric-card" key={metric.label}>{content}</div>
            );
          })}
        </div>
      </PageHero>
      <Button size={40} view="text" href="?role=mass&section=metrics">Показатели, периоды и расчёты</Button>

      <section className="page-section" aria-labelledby="league-title">
        <div className="page-section__heading">
          <h2 id="league-title">Лига месяца</h2>
          <span>Инвест-коины</span>
        </div>
        <div className="league-grid">
          {data.leagues.map((league) => (
            <article className={`section-card league-panel${league.current ? ' is-current' : ''}`} key={league.title}>
              <div className="league-panel__heading">
                <h3>{league.title}</h3>
                {league.current ? <RewardChip>{league.range}</RewardChip> : <StatusTag>{league.range}</StatusTag>}
              </div>
              {league.progressLabel ? (
                <>
                  <div className="league-panel__progress"><span>{league.progressLabel}</span><strong>{league.progress}%</strong></div>
                  <AccessibleProgressBar label={`${league.title}: ${league.progress ?? 0}%`} value={league.progress ?? 0} view="link" size={8} />
                </>
              ) : <p>{league.description}</p>}
            </article>
          ))}
        </div>
      </section>

      <section className="page-section" aria-labelledby="challenges-title">
        <div className="page-section__heading"><h2 id="challenges-title">Активные челленджи</h2></div>
        <div className="challenge-grid">
          {data.challenges.map((challenge) => {
            const expanded = expandedChallenge === challenge.id;
            return (
              <article className={`section-card challenge-card tone-${challenge.tone}`} key={challenge.id}>
                <WidgetHeader>{challenge.id === 'full-circle' ? 'Челлендж недели' : 'Челлендж'}</WidgetHeader>
                <div className="challenge-card__heading">
                  <WidgetIconBadge tone={badgeTone(challenge.tone)}>{challengeIcon(challenge.id)}</WidgetIconBadge>
                  <div><h3>{challenge.title}</h3><p>{challenge.description}</p></div>
                  {challenge.reward.startsWith('+') ? <RewardChip>{challenge.reward}</RewardChip> : <StatusTag>{challenge.reward}</StatusTag>}
                </div>
                <div className="challenge-card__progress">
                  <span>{challenge.progressLabel}</span>
                  <strong>{Math.round((challenge.completed / challenge.total) * 100)}%</strong>
                </div>
                <StepProgress
                  completed={challenge.completed}
                  label={`${challenge.title}: ${challenge.progressLabel}`}
                  total={challenge.total}
                />
                {challenge.actionTarget === 'details' && expanded ? (
                  <div className="challenge-card__details" id={`${challenge.id}-details`}>
                    <p><strong>Подготовка.</strong> Открыть материал по БПИФ или Навигатору фондов.</p>
                    <p><strong>Диалоги.</strong> Провести 5 разговоров с клиентами, которым подходит тема инвестиций.</p>
                    <p><strong>Результат.</strong> Если появляется продажа — закрывается связка обучения и результата.</p>
                  </div>
                ) : null}
                <Button
                  block
                  aria-controls={challenge.actionTarget === 'details' ? `${challenge.id}-details` : undefined}
                  aria-expanded={challenge.actionTarget === 'details' ? expanded : undefined}
                  size={48}
                  view={challenge.id === 'full-circle' ? 'primary' : 'secondary'}
                  onClick={() => {
                    if (challenge.id === 'fund-talks') onOpenScenario('conversation-challenge');
                    else if (challenge.actionTarget === 'learning') onNavigate('learning');
                    else setExpandedChallenge(expanded ? null : challenge.id);
                  }}
                >
                  {challenge.action}
                </Button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="page-section" aria-labelledby="opportunities-title">
        <div className="page-section__heading">
          <h2 id="opportunities-title">Дополнительные возможности</h2>
          <span>развитие экосистемы</span>
        </div>
        <div className="opportunity-grid">
          {data.opportunities.map((opportunity) => (
            <button
              className="opportunity-card"
              key={opportunity.id}
              type="button"
              onClick={() => opportunity.action === 'marketplace'
                ? openMarketplace()
                : setMessage(`Открыт раздел «${opportunity.title}».`)}
            >
              <WidgetIconBadge tone={badgeTone(opportunity.tone)}><OpportunityIcon id={opportunity.id} /></WidgetIconBadge>
              <strong>{opportunity.title}</strong>
              <span>{opportunity.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="page-section" aria-labelledby="achievements-title">
        <div className="page-section__heading">
          <h2 id="achievements-title">Ваши ачивки</h2>
          <span>14 из 30</span>
        </div>
        <div className="section-card"><AchievementGrid achievements={data.achievements} /></div>
      </section>

      <div className="games-bottom-grid">
        <section className="section-card" aria-labelledby="ranking-title">
          <WidgetHeader>Рейтинг по инвест-коинам · офис</WidgetHeader>
          <h2 className="sr-only" id="ranking-title">Рейтинг по инвест-коинам в офисе</h2>
          <div className="game-ranking">
            {data.ranking.map((person) => {
              const row = (
                <>
                  <span className={`rank-mark rank-mark--${person.rank}`}>{person.rank}</span>
                  <span className={`person-mark is-${person.tone}`} aria-hidden="true">{person.initials}</span>
                  <span className="game-ranking__person"><strong>{person.name}</strong>{person.detail ? <small>{person.detail}</small> : null}</span>
                  <RewardChip>{person.value}</RewardChip>
                </>
              );

              return person.current ? (
                <div className="game-ranking__row is-current" key={person.rank}>{row}</div>
              ) : (
                <button
                  className="game-ranking__row"
                  key={person.rank}
                  type="button"
                  onClick={() => onOpenPublicProfile(person.profileId ?? 'dmitry')}
                >
                  {row}
                </button>
              );
            })}
          </div>
        </section>

        <section className="section-card" aria-labelledby="recent-title">
          <WidgetHeader>Выполнено недавно</WidgetHeader>
          <h2 className="sr-only" id="recent-title">Выполнено недавно</h2>
          <div className="recent-list">
            {data.recent.map((item) => (
              <div key={item.title}>
                <WidgetIconBadge tone="green"><CheckmarkMIcon /></WidgetIconBadge>
                <strong>{item.title}</strong>
                <WidgetMeta icon={<StarMIcon />}>{item.reward}</WidgetMeta>
              </div>
            ))}
          </div>
        </section>
      </div>

      <p className="action-feedback page-action-feedback" role="status" aria-live="polite">{message}</p>
    </div>
  );
}
