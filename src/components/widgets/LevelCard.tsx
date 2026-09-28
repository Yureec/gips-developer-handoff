import type { DashboardData } from '../../data/provider';
import { AccessibleProgressBar } from '../AccessibleProgressBar';
import { WidgetIconBadge } from './WidgetPrimitives';
import { LightningMIcon } from '@alfalab/icons-glyph/LightningMIcon';
import { FlameSIcon } from '@alfalab/icons-glyph/FlameSIcon';

export function LevelCard({ level }: { level: DashboardData["level"] }) {
  return (
    <article className={"level-card"} aria-label={"Общий игровой профиль"}>
      <div className={"level-card__labels"}>
        <span>{level.level}</span>
        <span>{level.title}</span>
      </div>
      <AccessibleProgressBar
        label={`Прогресс уровня: ${level.progress}%`}
        value={level.progress}
        view={"link"}
        size={8}
      />
      <div className={"level-card__stats"}>
        <span title={"Опыт"}>
          <WidgetIconBadge tone={"blue"}>
            <LightningMIcon />
          </WidgetIconBadge>
          {level.xp}
        </span>
        <span title={"Инвест-коины"}>
          <WidgetIconBadge tone={"orange"}>
            <b>{"I"}</b>
          </WidgetIconBadge>
          {level.coins}
        </span>
        <span title={"Серия активности"}>
          <WidgetIconBadge tone={"red"}>
            <FlameSIcon />
          </WidgetIconBadge>
          {level.streak}
        </span>
      </div>
    </article>
  );
}

