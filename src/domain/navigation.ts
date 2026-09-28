export type RoleId = 'mass' | 'only' | 'manager' | 'consultant' | 'partner';

export type SectionId =
  | 'home'
  | 'focus'
  | 'learning'
  | 'profile'
  | 'products'
  | 'contest'
  | 'games'
  | 'investor'
  | 'knowledge'
  | 'metrics'
  | 'reporting'
  | 'motivation'
  | 'news'
  | 'employee-profile'
  | 'partner-log'
  | 'scenario'
  | 'marketplace'
  | 'marketplace-order'
  | 'marketplace-success'
  | 'public-profile';

export interface RoleDefinition {
  id: RoleId;
  label: string;
  shortLabel: string;
  homeTitle: string;
}

export const roles: RoleDefinition[] = [
  { id: 'mass', label: 'Массовый сотрудник', shortLabel: 'Mass', homeTitle: 'Главная сотрудника Mass' },
  { id: 'only', label: 'Сотрудник Only', shortLabel: 'Only', homeTitle: 'Главная сотрудника Only' },
  { id: 'manager', label: 'Руководитель', shortLabel: 'Руководитель', homeTitle: 'Сводная руководителя' },
  {
    id: 'consultant',
    label: 'Инвестиционный консультант',
    shortLabel: 'ИК',
    homeTitle: 'Главная инвестиционного консультанта',
  },
  {
    id: 'partner',
    label: 'Партнёрское направление',
    shortLabel: 'Партнёр',
    homeTitle: 'Главная партнёрского направления',
  },
];

export const sections: Array<{ id: SectionId; label: string }> = [
  { id: 'home', label: 'Главная' },
  { id: 'focus', label: 'Фокусные продукты' },
  { id: 'learning', label: 'Обучение' },
  { id: 'profile', label: 'Профиль' },
];

export const sectionsByRole: Record<RoleId, Array<{ id: SectionId; label: string }>> = {
  mass: [sections[0], { id: 'contest', label: 'Конкурсы' }, ...sections.slice(1)],
  only: sections.map(section => section.id === 'focus' ? { ...section, label: 'Фокус-продукт' } : section),
  manager: [{ id: 'home', label: 'Сводная' }],
  consultant: [
    { id: 'home', label: 'Главная' },
    { id: 'learning', label: 'Обучение' },
    { id: 'reporting', label: 'Отчётность' },
    { id: 'motivation', label: 'Мотивация' },
    { id: 'news', label: 'Новости' },
  ],
  partner: [
    { id: 'home', label: 'Главная' },
    { id: 'learning', label: 'Обучение' },
    { id: 'reporting', label: 'Отчётность' },
    { id: 'motivation', label: 'Мотивация' },
    { id: 'news', label: 'Новости' },
  ],
};

export const sectionDefinitions: Array<{ id: SectionId; label: string }> = [
  ...sections,
  { id: 'products', label: 'Продукты' },
  { id: 'contest', label: 'Конкурсы' },
  { id: 'games', label: 'Игровые механики' },
  { id: 'investor', label: 'Альфа-Инвестор' },
  { id: 'knowledge', label: 'База знаний' },
  { id: 'metrics', label: 'Показатели и расчёты' },
  { id: 'reporting', label: 'Отчётность' },
  { id: 'motivation', label: 'Мотивация' },
  { id: 'news', label: 'Новости' },
  { id: 'employee-profile', label: 'Профиль сотрудника' },
  { id: 'partner-log', label: 'Журнал работы с партнёрами' },
  { id: 'scenario', label: 'Сценарий' },
  { id: 'marketplace', label: 'Маркетплейс наград' },
  { id: 'marketplace-order', label: 'Оформление награды' },
  { id: 'marketplace-success', label: 'Результат оформления' },
  { id: 'public-profile', label: 'Публичный профиль' },
];

export function isRoleId(value: string | null): value is RoleId {
  return roles.some((role) => role.id === value);
}

export function isSectionId(value: string | null): value is SectionId {
  return sectionDefinitions.some((section) => section.id === value);
}
