import { useState, type CSSProperties } from 'react';
import { Button } from '@alfalab/core-components/button';
import { ClockMIcon } from '@alfalab/icons-glyph/ClockMIcon';
import { InformationCircleLineMIcon } from '@alfalab/icons-glyph/InformationCircleLineMIcon';

import { RewardChip } from '../RewardChip';
import { CarouselPager } from './CarouselPager';
import { WidgetHeader } from './WidgetHeader';
import { WidgetMeta } from './WidgetPrimitives';

export interface ContestWidgetItem {
  id?: string;
  eyebrow?: string;
  period: string;
  title: string;
  description: string;
  image: string;
  rank?: string;
  reward?: string;
}

export function ContestWidget({ contests, itemLabel = 'Конкурс', onOpen, columnSpan = 2 }: {
  contests: ContestWidgetItem[];
  itemLabel?: string;
  onOpen: (contest?: ContestWidgetItem) => void;
  columnSpan?: 1 | 2;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const contest = contests[activeIndex];

  return (
    <article
      className={`widget widget--contest widget--span-${columnSpan}`}
      style={{ '--contest-image': `url(${contest.image})` } as CSSProperties}
    >
      <WidgetHeader inverted action="Все конкурсы" onAction={() => onOpen()}>
        {contest.eyebrow ?? 'КОНКУРС'}
      </WidgetHeader>
      <div className="contest-content" aria-live="polite">
        <WidgetMeta icon={<ClockMIcon />}>{contest.period}</WidgetMeta>
        <h2>{contest.title}</h2>
        <p>{contest.description}</p>
      </div>
      <div className="contest-footer">
        <Button colors="inverted" size={40} view="secondary" onClick={() => onOpen(contest)}>Подробнее</Button>
        {contest.rank || contest.reward ? (
          <dl>
            {contest.rank ? <div><dt>Место в рейтинге</dt><dd>{contest.rank}</dd></div> : null}
            {contest.reward ? (
              <div>
                <dt>Будет зачислено баллов</dt>
                <dd className="contest-reward">
                  <RewardChip>{contest.reward}</RewardChip>
                  <InformationCircleLineMIcon aria-label="Баллы будут начислены после завершения конкурса" />
                </dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </div>
      <CarouselPager
        activeIndex={activeIndex}
        count={contests.length}
        inverted
        itemLabel={itemLabel}
        onChange={setActiveIndex}
      />
    </article>
  );
}
