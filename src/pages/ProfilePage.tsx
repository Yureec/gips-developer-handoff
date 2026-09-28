import { useState } from 'react';
import { Button } from '@alfalab/core-components/button';
import { ArrowRightMIcon } from '@alfalab/icons-glyph/ArrowRightMIcon';
import { BookCheckMIcon } from '@alfalab/icons-glyph/BookCheckMIcon';
import { ChartLineAscMIcon } from '@alfalab/icons-glyph/ChartLineAscMIcon';
import { FlameMIcon } from '@alfalab/icons-glyph/FlameMIcon';
import { LightningMIcon } from '@alfalab/icons-glyph/LightningMIcon';
import { PfmCupMIcon } from '@alfalab/icons-glyph/PfmCupMIcon';
import { PfmDiamondMIcon } from '@alfalab/icons-glyph/PfmDiamondMIcon';
import { StarMIcon } from '@alfalab/icons-glyph/StarMIcon';

import { AccessibleProgressBar } from '../components/AccessibleProgressBar';
import { AchievementGrid } from '../components/AchievementGrid';
import { PageHero, StatusTag } from '../components/PagePrimitives';
import { RewardChip } from '../components/RewardChip';
import { WidgetHeader } from '../components/widgets/WidgetHeader';
import { StepProgress, WidgetIconBadge, WidgetMeta } from '../components/widgets/WidgetPrimitives';
import type { ProfileData, SurfaceTone } from '../data/provider';
import type { SectionId } from '../domain/navigation';

interface ProfilePageProps {
  data: ProfileData;
  onNavigate: (section: SectionId) => void;
}

function accrualIcon(id: string) {
  if (id === 'lesson') return <BookCheckMIcon />;
  if (id === 'sale') return <ChartLineAscMIcon />;
  return <PfmCupMIcon />;
}

function badgeTone(tone: SurfaceTone) {
  return tone === 'gold' ? 'gold' : tone;
}

export function ProfilePage({ data, onNavigate }: ProfilePageProps) {
  const [message, setMessage] = useState('');

  return (
    <div className="section-page profile-page">
      <PageHero
        icon={<img className="profile-hero-avatar" src={data.image} alt="" />}
        tags={
          <>
            <StatusTag tone="red">{data.level}</StatusTag>
            <StatusTag tone="gold">{data.league}</StatusTag>
          </>
        }
        title={data.name}
        description={data.roleLine}
      >
        <div className="profile-hero-content">
          <div className="profile-quick-stats" aria-label="Игровые показатели профиля">
            <WidgetMeta icon={<FlameMIcon />}>{data.streak}</WidgetMeta>
            <button type="button" onClick={() => onNavigate('marketplace')}>
              <RewardChip>{data.coins}</RewardChip>
              <span>Инвест-коины</span>
            </button>
            <WidgetMeta icon={<LightningMIcon />}>{data.xp} XP</WidgetMeta>
            <WidgetMeta icon={<StarMIcon />}>{data.achievementsCount} ачивок</WidgetMeta>
          </div>
          <section className="profile-level" aria-labelledby="profile-level-title">
            <div>
              <span id="profile-level-title">{data.nextLevel.label}</span>
              <strong>{data.nextLevel.remaining}</strong>
            </div>
            <AccessibleProgressBar label="Прогресс текущего уровня" value={data.nextLevel.progress ?? 0} size={8} view="link" />
            <small>{data.nextLevel.hint}</small>
          </section>
        </div>
      </PageHero>
      <Button size={40} view="text" href="?role=mass&section=metrics">Показатели, периоды и расчёты</Button>

      <div className="profile-layout">
        <div className="profile-main">
          <section className="section-card" aria-labelledby="investment-progress-title">
            <WidgetHeader>Мой инвест-прогресс</WidgetHeader>
            <h2 className="sr-only" id="investment-progress-title">Мой инвест-прогресс</h2>
            <div className="profile-metric-grid">
              {data.investmentProgress.map((metric) => (
                <div className="metric-card" key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                  {typeof metric.progress === 'number' ? <AccessibleProgressBar label={`${metric.label}: ${metric.progress}%`} value={metric.progress} view="positive" size={4} /> : null}
                  {metric.detail ? <small className={metric.detail.startsWith('↑') ? 'metric-positive' : undefined}>{metric.detail}</small> : null}
                </div>
              ))}
            </div>
          </section>

          <section className="section-card" aria-labelledby="game-status-title">
            <WidgetHeader>Игровой статус</WidgetHeader>
            <h2 className="sr-only" id="game-status-title">Игровой статус</h2>
            <div className="profile-game-grid">
              {data.gameStatus.map((metric) => {
                const content = (
                  <>
                    <span>{metric.label}</span>
                    <strong className={`metric-${metric.tone}`}>{metric.value}</strong>
                    <small>{metric.detail}</small>
                  </>
                );

                return metric.action === 'marketplace' ? (
                  <button className="metric-card metric-card--button" key={metric.label} type="button" onClick={() => onNavigate('marketplace')}>
                    {content}
                  </button>
                ) : <div className="metric-card" key={metric.label}>{content}</div>;
              })}
            </div>
          </section>

          <section className="section-card" aria-labelledby="profile-achievements-title">
            <WidgetHeader action="Все" onAction={() => onNavigate('games')}>Ачивки · 14 из 30</WidgetHeader>
            <h2 className="sr-only" id="profile-achievements-title">Ачивки профиля</h2>
            <AchievementGrid achievements={data.achievements} />
          </section>
        </div>

        <aside className="profile-side" aria-label="История и следующая цель">
          <section className="section-card" aria-labelledby="accruals-title">
            <WidgetHeader>История начислений</WidgetHeader>
            <h2 className="sr-only" id="accruals-title">История начислений</h2>
            <div className="accrual-list">
              {data.accruals.map((accrual) => (
                <div key={accrual.id}>
                  <WidgetIconBadge tone={badgeTone(accrual.tone)}>{accrualIcon(accrual.id)}</WidgetIconBadge>
                  <p><strong>{accrual.title}</strong><small>{accrual.meta}</small></p>
                  <WidgetMeta icon={<StarMIcon />}>{accrual.reward}</WidgetMeta>
                </div>
              ))}
            </div>
          </section>

          <section className="section-card section-card--dark profile-next-goal" aria-labelledby="next-goal-title">
            <WidgetHeader inverted>Следующая цель</WidgetHeader>
            <div>
              <WidgetIconBadge tone="violet"><PfmDiamondMIcon /></WidgetIconBadge>
              <p><strong id="next-goal-title">{data.nextGoal.title}</strong><span>{data.nextGoal.description}</span></p>
            </div>
            <Button
              block
              rightAddons={<ArrowRightMIcon aria-hidden="true" />}
              size={48}
              view="primary"
              onClick={() => onNavigate('contest')}
            >
              К конкурсу
            </Button>
          </section>
        </aside>
      </div>

      <p className="action-feedback page-action-feedback" role="status" aria-live="polite">{message}</p>
    </div>
  );
}
