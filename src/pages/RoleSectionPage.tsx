import { PageHero, StatusTag } from '../components/PagePrimitives';
import type { RoleId, SectionId } from '../domain/navigation';

const copy: Record<'consultant' | 'partner', Record<'learning' | 'reporting' | 'motivation' | 'news', { title: string; description: string }>> = {
  consultant: {
    learning: { title: 'Обучение и развитие ИК', description: 'Раздел подключён к навигации. Курсы, обязательные темы, прогресс и индивидуальные рекомендации будут проработаны на следующем этапе.' },
    reporting: { title: 'Отчетность ИК', description: 'Раздел подготовлен для будущих рейтинговых отчётов, детализации показателей и выгрузок по инвестиционным консультантам.' },
    motivation: { title: 'Мотивация ИК', description: 'Здесь будут размещены конкурсы, премиальные механики, рейтинги и персональный прогноз вознаграждения инвестиционного консультанта.' },
    news: { title: 'Новости ИК', description: 'Раздел зарезервирован под продуктовые обновления, аналитику рынка, записи эфиров и важные сообщения для инвестиционных консультантов.' },
  },
  partner: {
    learning: { title: 'Обучение и развитие', description: 'Раздел подключён к навигации. Здесь будут размещены учебные материалы, рекомендации и треки развития для партнёрского направления.' },
    reporting: { title: 'Отчетность', description: 'Раздел подготовлен для будущих отчётов, сводок по визитам, активности офисов и детализации ключевых показателей партнёрского блока.' },
    motivation: { title: 'Мотивация', description: 'Здесь будут размещены конкурсы, механики вовлечения, рейтинги и персональные мотивационные сценарии для партнёрского направления.' },
    news: { title: 'Новости', description: 'Раздел зарезервирован под новости, обновления материалов, организационные сообщения и полезные публикации для партнёров.' },
  },
};

const icons: Record<string, string> = { learning: '↗', reporting: '∑', motivation: '★', news: '◉' };

export function RoleSectionPage({ role, section }: { role: Extract<RoleId, 'consultant' | 'partner'>; section: Extract<SectionId, 'learning' | 'reporting' | 'motivation' | 'news'> }) {
  const item = copy[role][section];
  return (
    <div className="role-page role-placeholder-page">
      <PageHero icon={icons[section]} tags={<><StatusTag tone="violet">{role === 'consultant' ? 'Инвестиционный консультант' : 'Партнёрское направление'}</StatusTag><StatusTag>Раздел подключён</StatusTag></>} title={item.title} description={item.description} tone="violet" />
    </div>
  );
}
