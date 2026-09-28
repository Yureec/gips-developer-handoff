import { LevelCard } from './LevelCard';
import { InvestClassWidget } from '../learning/InvestClass';
import { ProductImage } from '../ProductImage';
import { useState } from 'react';
import { Button } from '@alfalab/core-components/button';
import { ArrowsOutSquareMIcon } from '@alfalab/icons-glyph/ArrowsOutSquareMIcon';
import { ChartLineAscMIcon } from '@alfalab/icons-glyph/ChartLineAscMIcon';
import { CheckmarkCircleMIcon } from '@alfalab/icons-glyph/CheckmarkCircleMIcon';
import { ChevronRightMIcon } from '@alfalab/icons-glyph/ChevronRightMIcon';
import { CommentWithTextMIcon } from '@alfalab/icons-glyph/CommentWithTextMIcon';
import { FlameMIcon } from '@alfalab/icons-glyph/FlameMIcon';
import { FlameSIcon } from '@alfalab/icons-glyph/FlameSIcon';
import { InformationCircleLineMIcon } from '@alfalab/icons-glyph/InformationCircleLineMIcon';
import { LightningMIcon } from '@alfalab/icons-glyph/LightningMIcon';
import { PfmCupMIcon } from '@alfalab/icons-glyph/PfmCupMIcon';
import { StarPointerMIcon } from '@alfalab/icons-glyph/StarPointerMIcon';
import { ThumbUpLineMIcon } from '@alfalab/icons-glyph/ThumbUpLineMIcon';

import { AccessibleProgressBar } from '../AccessibleProgressBar';
import { RewardChip } from '../RewardChip';
import type { DashboardData, ProductKey } from '../../data/provider';
import type { SectionId } from '../../domain/navigation';
import { CarouselPager } from './CarouselPager';
import { ContestWidget } from './ContestWidget';
import { PrototypeWidgets } from './PrototypeWidgets';
import { SalesKpiWidget } from './SalesKpiWidget';
import { WidgetHeader } from './WidgetHeader';
import { StepProgress, WidgetIconBadge } from './WidgetPrimitives';

interface DashboardWidgetsProps {
  data: DashboardData;
  onNavigate: (section: SectionId) => void;
  onFocusProduct: (product: ProductKey) => void;
}

export function DashboardWidgets({ data, onNavigate, onFocusProduct }: DashboardWidgetsProps) {
  const [focusIndex, setFocusIndex] = useState(0);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const focusProduct = data.focusProducts[focusIndex];
  const challenge = data.challenges[challengeIndex];
  const challengeProgress = Math.round((challenge.completed / challenge.total) * 100);
  const challengeIcon = challenge.id === 'fund-talks'
    ? <CommentWithTextMIcon />
    : challenge.id === 'expert-practitioner'
      ? <CheckmarkCircleMIcon />
      : challenge.id === 'clean-week'
        ? <ThumbUpLineMIcon />
        : <FlameMIcon />;

  return (
    <div className="home-page">
      <h1 className="sr-only">Главная инвестиционного пространства</h1>
      <div className="dashboard-layout">
      <div className="dashboard-main">
        <ContestWidget contests={data.contests} onOpen={contest => { location.href = `?role=mass&section=contest${contest?.id ? `&contest=${contest.id}` : ''}`; }} />

        <InvestClassWidget />

        <article className="widget widget--focus">
          <WidgetHeader action="Все продукты" onAction={() => onNavigate('focus')}>
            ФОКУСНЫЙ ПРОДУКТ
          </WidgetHeader>
          <div className="product-heading">
            <span className="product-logo" aria-hidden="true">
              <ProductImage src={focusProduct.logo} />
            </span>
            <div>
              <h2>{focusProduct.title}</h2>
              <span className={`run-rate run-rate--${focusProduct.runRateTone}`}>{focusProduct.runRate}</span>
            </div>
            <Button
              aria-label={`Открыть ${focusProduct.title}`}
              className="product-open"
              size={32}
              view="transparent"
              onClick={() => onFocusProduct(focusProduct.key)}
            >
              <ArrowsOutSquareMIcon aria-hidden="true" />
            </Button>
          </div>
          <p aria-live="polite">{focusProduct.description}</p>
          <div className="focus-result">
            <span>Выполнено за месяц</span>
            <div>
              <strong>{focusProduct.actual}</strong>
              <small>{focusProduct.target}</small>
            </div>
          </div>
          <div className="widget-card-footer">
            <span className="focus-reward">
              <RewardChip title="За целевую продажу продукта">{focusProduct.reward}</RewardChip>
              <InformationCircleLineMIcon aria-label="Награда начисляется за целевую продажу" />
            </span>
          </div>
          <CarouselPager
            activeIndex={focusIndex}
            count={data.focusProducts.length}
            itemLabel="Фокус-продукт"
            onChange={setFocusIndex}
          />
        </article>

        <SalesKpiWidget
          actual={data.kpi.actual}
          footer={<RewardChip>{data.kpi.reward}</RewardChip>}
          heading="КПЭ Продажа Инвестиций"
          variant="dashboard"
          hint={<>За неделю добавили <span className="kpi-weekly-delta">{data.kpi.weeklyDelta}.</span></>}
          hintTitle="Темп медленный."
          metricLabel=""
          metricAriaLabel="Выполнение плана"
          plan={data.kpi.plan}
          progress={data.kpi.progress}
          runRate={data.kpi.completion}
        />

        <article className="widget widget--coefficients">
          <WidgetHeader>КОЭФФИЦИЕНТЫ • СЕНТЯБРЬ</WidgetHeader>
          <dl className="coefficient-list">
            {data.coefficients.map((item, index) => (
              <div key={`${item.label}-${index}`}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </article>

        <article className="widget widget--challenge">
          <WidgetHeader action="Все активности" onAction={() => onNavigate('games')}>
            ЧЕЛЛЕНЖ
          </WidgetHeader>
          <div className="challenge-title">
            <WidgetIconBadge tone={challenge.tone}>{challengeIcon}</WidgetIconBadge>
            <div>
              <h2>{challenge.title}</h2>
              <small>{challenge.category}</small>
            </div>
          </div>
          <p aria-live="polite">{challenge.description}</p>
          <div className="dashboard-progress-slot">
            <StepProgress
              completed={challenge.completed}
              label={challenge.status}
              total={challenge.total}
            />
            <div className="challenge-progress">
              <span>{challenge.status}</span>
              <strong>{challengeProgress}%</strong>
            </div>
          </div>
          <div className="widget-card-footer">
            <span>{challenge.reward ? <RewardChip>{challenge.reward}</RewardChip> : null}</span>
            <Button size={32} view="text" onClick={() => onNavigate(challenge.actionTarget)}>
              {challenge.action}
            </Button>
          </div>
          <CarouselPager
            activeIndex={challengeIndex}
            count={data.challenges.length}
            itemLabel="Челлендж"
            onChange={setChallengeIndex}
          />
        </article>

        <PrototypeWidgets data={data} />
      </div>

      <aside className="dashboard-side" aria-label="Игровые показатели">
        <LevelCard level={data.level} />

        <article className="widget ratings-card ratings-card--compact">
          <WidgetHeader>РЕЙТИНГИ</WidgetHeader>
          <p className="ratings-card__intro">Позиции в ключевых активностях</p>
          <div className="rating-list">
            {data.ratings.map((item) => (
              <div className="rating-row" key={item.label}>
                <WidgetIconBadge tone={item.label === 'Конкурс' ? 'orange' : 'blue'}>
                  {item.label === 'Продажи' ? <ChartLineAscMIcon /> : null}
                  {item.label === 'Фокус-продукт' ? <StarPointerMIcon /> : null}
                  {item.label === 'Конкурс' ? <PfmCupMIcon /> : null}
                </WidgetIconBadge>
                <p>
                  <strong>{item.label}</strong>
                  <small>{item.detail}</small>
                </p>
                <b>{item.position}</b>
              </div>
            ))}
          </div>
          <Button block size={40} view="secondary" onClick={() => onNavigate('games')}>
            Открыть рейтинги
          </Button>
        </article>

        <article className="widget achievements-widget" aria-labelledby="home-achievements-title">
          <div className="home-widget-heading">
            <h2 className="home-widget-eyebrow" id="home-achievements-title">Ачивки</h2>
          </div>
          <ul className="achievements-widget__list">
            {data.achievements.map((achievement) => (
              <li key={achievement.id}>
                <a href={achievement.href} target="_blank" rel="noopener noreferrer">
                  <span className={`achievement-art is-${achievement.tone}`} aria-hidden="true">
                    {achievement.image ? <img src={achievement.image} alt="" /> : null}
                  </span>
                  <strong>{achievement.title}</strong>
                  <ChevronRightMIcon aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <Button block size={40} view="secondary" onClick={() => onNavigate('games')}>
            Все ачивки
          </Button>
        </article>
      </aside>
      </div>
    </div>
  );
}
