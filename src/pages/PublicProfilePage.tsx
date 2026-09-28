import { Button } from '@alfalab/core-components/button';

import { AchievementGrid } from '../components/AchievementGrid';
import { PageBack, PageHero, SectionEyebrow, StatusTag } from '../components/PagePrimitives';
import { RewardChip } from '../components/RewardChip';
import type { PublicProfileData, SurfaceTone } from '../data/provider';

function achievementTone(value: string): SurfaceTone {
  if (value.includes('gold')) return 'gold';
  if (value.includes('violet')) return 'violet';
  if (value.includes('green')) return 'green';
  if (value.includes('blue')) return 'blue';
  return 'neutral';
}

function achievementId(title: string) {
  if (title.includes('офиса')) return 'office-top';
  if (title.includes('фондов')) return 'fund-expert';
  if (title.includes('дней') || title.includes('Неделя')) return 'thirty-days';
  if (title.includes('курсов')) return 'five-courses';
  if (title.includes('конкурса')) return 'contest-winner';
  return title;
}

export function PublicProfilePage({ data, onBack, onOpenLearning }: {
  data: PublicProfileData;
  onBack: () => void;
  onOpenLearning: () => void;
}) {
  return (
    <div className="section-page public-profile-page">
      <PageBack label="К рейтингу" onClick={onBack} />
      <PageHero
        icon={<span className="public-profile-avatar" style={{ background: data.avatarColor }}>{data.avatar}</span>}
        tags={<><StatusTag tone="red">{data.level}</StatusTag><StatusTag tone="violet">{data.league}</StatusTag></>}
        title={data.name}
        description={data.meta}
      >
        <div className="public-profile-hero-content">
          <div className="page-tags">
            <RewardChip>{data.month} I за месяц</RewardChip>
            <StatusTag tone="violet">{data.xp}</StatusTag>
            <StatusTag tone="green">{data.streak}</StatusTag>
          </div>
          <p className="info-note">Публичный профиль показывает только игровые и агрегированные признаки. Денежные объёмы, мотивационные выплаты, клиентские данные и чувствительные KPI не раскрываются.</p>
        </div>
      </PageHero>

      <div className="public-profile-grid">
        <section className="section-card" aria-labelledby="strengths-title">
          <SectionEyebrow>Сильные стороны</SectionEyebrow>
          <h2 className="sr-only" id="strengths-title">Сильные стороны</h2>
          <dl className="public-strengths">
            {data.strengths.map(([title, description]) => <div key={title}><dt>{title}</dt><dd>{description}</dd></div>)}
          </dl>
        </section>
        <section className="section-card" aria-labelledby="public-achievements-title">
          <SectionEyebrow>Ачивки</SectionEyebrow>
          <h2 className="sr-only" id="public-achievements-title">Ачивки</h2>
          <AchievementGrid achievements={data.achievements.map(([, title, tone]) => ({ id: achievementId(title), title, tone: achievementTone(tone) }))} />
        </section>
        <section className="section-card public-repeat" aria-labelledby="repeat-title">
          <SectionEyebrow>Что можно повторить</SectionEyebrow>
          <h2 className="sr-only" id="repeat-title">Что можно повторить</h2>
          <p>{data.repeat}</p>
          <Button block size={48} view="primary" onClick={onOpenLearning}>Посмотреть похожее обучение</Button>
        </section>
      </div>
    </div>
  );
}
