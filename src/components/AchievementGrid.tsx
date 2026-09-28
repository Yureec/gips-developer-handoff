import { BookCheckMIcon } from '@alfalab/icons-glyph/BookCheckMIcon';
import { CheckmarkMIcon } from '@alfalab/icons-glyph/CheckmarkMIcon';
import { FlameMIcon } from '@alfalab/icons-glyph/FlameMIcon';
import { LightningMIcon } from '@alfalab/icons-glyph/LightningMIcon';
import { PfmCupMIcon } from '@alfalab/icons-glyph/PfmCupMIcon';
import { PfmDiamondMIcon } from '@alfalab/icons-glyph/PfmDiamondMIcon';
import { PfmStarMIcon } from '@alfalab/icons-glyph/PfmStarMIcon';

import type { AchievementData } from '../data/provider';
import { WidgetIconBadge } from './widgets/WidgetPrimitives';

interface AchievementGridProps {
  achievements: AchievementData[];
}

function AchievementIcon({ id }: { id: string }) {
  if (id.includes('course') || id.includes('fund')) return <BookCheckMIcon />;
  if (id.includes('day') || id === 'clean-week') return <FlameMIcon />;
  if (id.includes('contest') || id.includes('prize')) return <PfmCupMIcon />;
  if (id.includes('office')) return <PfmDiamondMIcon />;
  if (id.includes('master')) return <PfmStarMIcon />;
  if (id.includes('plan')) return <LightningMIcon />;
  return <CheckmarkMIcon />;
}

export function AchievementGrid({ achievements }: AchievementGridProps) {
  return (
    <ul className="achievement-grid" aria-label="Ачивки">
      {achievements.map((achievement) => (
        <li className={achievement.locked ? 'is-locked' : undefined} key={achievement.id}>
          {achievement.href ? (
            <a href={achievement.href} target="_blank" rel="noopener noreferrer">
              {achievement.image ? <img src={achievement.image} alt="" /> : <WidgetIconBadge tone={achievement.tone}><AchievementIcon id={achievement.id} /></WidgetIconBadge>}
              <span>{achievement.title}</span>
              {achievement.locked ? <small>Не получено</small> : <small className="sr-only">Получено</small>}
            </a>
          ) : (
            <>
              {achievement.image ? <img src={achievement.image} alt="" /> : <WidgetIconBadge tone={achievement.tone}><AchievementIcon id={achievement.id} /></WidgetIconBadge>}
              <span>{achievement.title}</span>
              {achievement.locked ? <small>Не получено</small> : <small className="sr-only">Получено</small>}
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
