import investmentConnoisseurImage from '../assets/achievements/investment-connoisseur.webp';
import investmentMagisterImage from '../assets/achievements/investment-magister.webp';
import savingsMasterImage from '../assets/achievements/savings-master.webp';

import type { AchievementData, DashboardData } from './provider';

export const homeMarketSnapshot: DashboardData['market'] = {
  asOf: '23 сентября 2026',
  keyRate: '14%',
  nextMeeting: '23 октября 2026',
  inflation: '6,3%',
  inflationTarget: '4%',
  quotes: [
    { id: 'gold', label: 'Золото', value: '11 814 ₽/г · $4 372/oz' },
    { id: 'brent', label: 'Нефть Brent', value: '$98,75 / барр.' },
    { id: 'moex', label: 'Индекс Мосбиржи', value: '2 295 п.' },
    { id: 'bonds', label: 'Индекс гособлигаций', value: '112,33 п.' },
    { id: 'usd', label: 'USD / RUB', value: '84,07 ₽' },
    { id: 'cny', label: 'CNY / RUB', value: '12,53 ₽' },
  ],
};

export const investNewsChannels: DashboardData['investNewsChannels'] = [
  {
    id: 'max',
    platform: 'MAX',
    messenger: 'max',
    title: 'Invest Easy',
    kind: 'канал',
    href: 'https://alfapeople.alfabank.ru/channels/366?type=working_chat',
  },
  {
    id: 'achat',
    platform: 'А-Чат',
    messenger: 'achat',
    title: 'Invest Easy',
    kind: 'канал',
    href: 'https://example.org/communication',
  },
  {
    id: 'telegram-bot',
    platform: 'Telegram',
    messenger: 'telegram',
    title: 'Invest Easy',
    kind: 'бот',
    href: 'https://t.me/InvestAlfa_bot',
  },
  {
    id: 'telegram-channel',
    platform: 'Telegram',
    messenger: 'telegram',
    title: 'Альфа-Инвестиции',
    kind: 'канал',
    href: 'https://alfapeople.alfabank.ru/channels/109?type=community',
  },
];

const investmentAchievementsUrl = 'https://alfapeople.alfabank.ru/faq/tree/post/7444-znatok-i-magistr-investitsiy';

export const featuredAchievements: AchievementData[] = [
  {
    id: 'investment-connoisseur',
    title: 'Знаток инвестиций',
    tone: 'blue',
    image: investmentConnoisseurImage,
    href: investmentAchievementsUrl,
  },
  {
    id: 'investment-magister',
    title: 'Магистр инвестиций',
    tone: 'violet',
    image: investmentMagisterImage,
    href: investmentAchievementsUrl,
  },
  {
    id: 'savings-master',
    title: 'Мастер накоплений',
    tone: 'gold',
    image: savingsMasterImage,
    href: 'https://alfapeople.alfabank.ru/faq/tree/post/7471-master-nakopleniy',
  },
];
