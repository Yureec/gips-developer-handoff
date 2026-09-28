import { contestDashboardItems } from './contestSummary';
import { createFocusCatalog, focusPeriod, focusSales } from './focusCatalog';
import { createResources } from './resources';
import { getPortalMetric, marathonSnapshot, massGameSnapshot } from './portalSnapshot';
import { metricNumber, metricValues } from '../domain/metrics';
import { percentage, rubles, salesProgress } from '../domain/focus';
import productNsjImage from '../assets/product-nsj.png';
import productOmsImage from '../assets/product-oms.png';
import productPdsImage from '../assets/product-pds.png';
import contestMarathonImage from '../assets/contest-marathon.png';
import contestDriveImage from '../assets/contest-drive.webp';
import contestFreshImage from '../assets/optimized/contest-fresh.webp';
import contestHeatImage from '../assets/contest-heat.webp';
import type {
  DashboardData,
  FocusProductData,
  GamesData,
  InvestmentSpaceDataProvider,
  LearningData,
  ProfileData,
  ProductCatalogData,
  ProductKey,
} from './provider';
import employeeImage from '../assets/employee-alena.webp';
import investorMarketImage from '../assets/investor-market.webp';
import investorNovatekImage from '../assets/investor-novatek.webp';
import investorSberImage from '../assets/investor-sber.webp';
import { onlyDashboard, onlyProducts } from './onlyData';
import { consultantData, managerData, partnerData } from './roleData';
import { getMarketplaceData, getPublicProfileData, getScenarioData } from './commonData';
import { featuredAchievements, homeMarketSnapshot, investNewsChannels } from './homeWidgets';

const massChallenges: DashboardData['challenges'] = [
  {
    id: 'full-circle',
    title: 'Полный круг',
    category: '4 урока',
    description: 'Пройди 4 урока Daily Invest и получи одну продажу инвест-продукта за неделю',
    completed: 3,
    total: 4,
    status: 'Пройдено 3 из 4',
    reward: '+150',
    action: 'Daily Invest',
    actionTarget: 'learning',
    tone: 'orange',
  },
  {
    id: 'fund-talks',
    title: 'Разговоры о фондах',
    category: 'Активность',
    description: 'Активность по клиентским диалогам и отработке аргументов',
    completed: 3,
    total: 5,
    status: '3 из 5 разговоров',
    action: 'Подробнее',
    actionTarget: 'games',
    tone: 'blue',
  },
  {
    id: 'expert-practitioner',
    title: 'Знаток и практик',
    category: 'Тест',
    description: 'Сдай тест по продукту и закрой сделку по нему на этой же неделе',
    completed: 1,
    total: 2,
    status: 'Тест выполнен',
    reward: '+50',
    action: 'Открыть тест',
    actionTarget: 'learning',
    tone: 'violet',
  },
  {
    id: 'clean-week',
    title: 'Чистая неделя',
    category: 'Обучение',
    description: 'Нет просроченных обязательных материалов и закрыто обучение недели',
    completed: 0,
    total: 2,
    status: '1 долг · курс недели 60%',
    reward: '+80',
    action: 'К обучению',
    actionTarget: 'learning',
    tone: 'green',
  },
];

function getMassChallenge(id: string) {
  return massChallenges.find((challenge) => challenge.id === id)!;
}

const massDashboard: DashboardData = {
  employee: {
    name: 'Алена Соколова',
    role: 'Менеджер по работе с клиентами',
    office: 'Офис «Тверская»',
    league: 'Gold League',
    image: employeeImage,
  },
  contests: [
    {
      id: 'marathon',
      eyebrow: 'КОНКУРС',
      period: 'Июль – Август 2026',
      title: 'Марафон желаний',
      description: 'Альфа-Банк совместно с АСЖ',
      image: contestMarathonImage,
      rank: '12 из 120',
      reward: '1 200',
    },
    {
      eyebrow: 'КОНКУРС',
      period: 'Июль – Август 2026',
      title: 'Драйвим будущее 2.0',
      id: 'drive',
      description: 'Альфа-Банк совместно с Альфа НПФ проводит конкурс с призами и сертификатами на сумму в 10 000 руб.',
      image: contestDriveImage,
    },
    {
      eyebrow: 'КОНКУРС',
      period: '1 июля – 7 августа 2026',
      title: 'ПДС Фреш',
      id: 'fresh',
      description: 'Увеличь продажи ПДС и выиграй ценный приз.',
      image: contestFreshImage,
    },
    {
      eyebrow: 'КОНКУРС',
      period: '1 апреля – 30 июня 2026',
      title: 'Инвест Жара',
      id: 'heat',
      description: 'Достигни плановых показателей конкурса и готовь чемодан в поездку!',
      image: contestHeatImage,
    },
  ],
  focusProducts: [
    {
      key: 'nsj',
      title: 'НСЖ "Максимум"',
      logo: productNsjImage,
      runRate: 'RR: 100%',
      runRateTone: 'positive',
      description: 'Для тех клиентов, кому важны надёжность и гарантированный конкурентный доход',
      actual: '5 000 000 ₽',
      target: 'из 5 000 000 ₽',
      reward: '+120',
    },
    {
      key: 'oms',
      title: 'ОМС в золоте',
      logo: productOmsImage,
      runRate: 'RR: 50%',
      runRateTone: 'negative',
      description: 'Защитный инструмент в периоды экономической и геополитической нестабильности',
      actual: '2 500 000 ₽',
      target: 'из 5 000 000 ₽',
      reward: '+120',
    },
    {
      key: 'pds',
      title: 'ПДС',
      logo: productPdsImage,
      runRate: 'RR: 150%',
      runRateTone: 'positive',
      description: 'Поддержка от государства + налоговый вычет + инвестиционный доход',
      actual: '7 500 000 ₽',
      target: 'из 5 000 000 ₽',
      reward: '+120',
    },
  ],
  kpi: {
    progress: 78,
    completion: '78%',
    plan: '3 000 000 ₽',
    actual: '2 340 000 ₽',
    weeklyDelta: '+1 000 руб',
    reward: '+1200',
  },
  coefficients: [
    { label: 'ПИФ', value: '3' },
    { label: 'НСЖ', value: '1,5' },
    { label: 'НСЖ Фиксированный доход', value: '1,5' },
    { label: 'Стратегии', value: '1' },
    { label: 'ОМС', value: '0,75' },
    { label: 'ПДС', value: '0,75' },
  ],
  level: {
    level: '7 LVL',
    title: 'ИНВЕСТ-ПРОФИ',
    progress: 42,
    xp: '1 740',
    coins: '2 850',
    streak: '6',
  },
  ratings: [
    { label: 'Продажи', detail: 'по месячному KPI', position: '12 / 96' },
    { label: 'Фокус-продукт', detail: 'среди участников', position: '4 / 50' },
    { label: 'Конкурс', detail: '«Марафон желаний»', position: '7 / 120' },
  ],
  achievements: featuredAchievements,
  challenges: massChallenges,
  investNewsChannels,
  market: homeMarketSnapshot,
  investorNews: [
    {
      category: 'Рынки сейчас',
      title: 'Главное к открытию: акции снижаются, инвесторы избегают рисков',
      description: 'Тем временем спрос на ОФЗ-ПД возвращается: Минфин провёл успешные аукционы',
      href: 'https://alfabank.ru/alfa-investor/t/glavnoe-k-otkrytiyu-10-09-2026/',
      image: investorMarketImage,
      imageAlt: 'Красный бумажный кораблик в море',
    },
    {
      category: 'Новости',
      title: 'Сбербанк увеличил доходы в августе',
      description: 'По итогам месяца прибыль банка выросла на 14,2%',
      href: 'https://alfabank.ru/alfa-investor/t/sberbank-uvelichil-dohody-v-avguste/',
      image: investorSberImage,
      imageAlt: 'Интерьер офиса Сбербанка',
    },
    {
      category: 'Аналитика',
      title: 'Фавориты стратегии на III квартал 2026 года: НОВАТЭК',
      description: 'Почему компания остаётся перспективным игроком в нефтегазовом секторе',
      href: 'https://alfabank.ru/alfa-investor/t/favority-strategii-na-iii-kvartal-2026-goda-novatek-090826/',
      image: investorNovatekImage,
      imageAlt: 'Промышленный комплекс НОВАТЭК',
    },
  ],
};

const massProducts: ProductCatalogData = {
  title: 'Все инвестиционные продукты',
  description:
    'Каталог помогает быстро перейти от главного виджета к продукту. На прототипе подробно проработана одна длинная продуктовая страница, остальные карточки показывают архитектуру каталога.',
  products: [
    {
      id: 'nsj',
      key: 'nsj',
      title: 'НСЖ "Максимум"',
      description: 'Надёжность, финансовая защита и долгосрочная стратегия для клиента.',
      category: 'focus',
      categoryLabel: 'Фокус',
      focus: true,
      mark: 'НСЖ',
      logo: productNsjImage,
      runRate: '100%',
      runRateTone: 'positive',
      reward: '+120',
    },
    {
      id: 'oms',
      key: 'oms',
      title: 'ОМС в золоте',
      description: 'Защитный инструмент на периоды нестабильности и повышенного спроса на золото.',
      category: 'focus',
      categoryLabel: 'Фокус',
      focus: true,
      mark: 'ОМС',
      logo: productOmsImage,
      runRate: '50%',
      runRateTone: 'negative',
      reward: '+120',
    },
    {
      id: 'pds',
      key: 'pds',
      title: 'ПДС',
      description: 'Долгосрочные накопления с государственной поддержкой и налоговыми преимуществами.',
      category: 'focus',
      categoryLabel: 'Фокус',
      focus: true,
      mark: 'ПДС',
      logo: productPdsImage,
      runRate: '150%',
      runRateTone: 'positive',
      reward: '+120',
    },
    {
      id: 'alfa-capital',
      title: 'Альфа-Капитал',
      description: 'Решения управляющей компании для разных горизонтов и риск-профилей.',
      category: 'investments',
      categoryLabel: 'Инвестиции',
      focus: false,
      mark: 'АК',
      meta: ['Материалы', 'Карточка продукта'],
      actionMessage: 'В боевом каталоге здесь откроется продуктовая страница Альфа-Капитал.',
    },
    {
      id: 'asj',
      title: 'АСЖ',
      description: 'Страховые продукты с инвестиционной и накопительной составляющей.',
      category: 'insurance',
      categoryLabel: 'Страхование',
      focus: false,
      mark: 'АСЖ',
      meta: ['Материалы', 'Скрипты'],
      actionMessage: 'В боевом каталоге здесь откроется продуктовая страница АСЖ.',
    },
    {
      id: 'alfa-investments',
      title: 'Альфа-Инвестиции',
      description: 'Сервис и инвестиционные решения, которые сотрудник может показать клиенту.',
      category: 'service',
      categoryLabel: 'Сервис',
      focus: false,
      mark: 'АИ',
      meta: ['Материалы', 'Клиентский вид'],
      actionMessage: 'В боевом каталоге здесь откроется продуктовая страница Альфа-Инвестиций.',
    },
  ],
};

const focusProducts: Record<ProductKey, FocusProductData> = {
  nsj: {
    key: 'nsj',
    title: 'НСЖ «Максимум»',
    description:
      'Для клиентов, которым важны надёжность, финансовая защита и долгосрочная стратегия накоплений.',
    logo: productNsjImage,
    reward: '+120',
    fact: '5 000 000 ₽',
    plan: '5 000 000 ₽',
    runRate: '100%',
    runRateTone: 'positive',
    position: '4 / 50',
    positioning: 'Защита + долгосрочная финансовая цель',
    positioningText:
      'Продукт удобно обсуждать с клиентами, которые не хотят выбирать между накоплением и страховой защитой и готовы смотреть на длинный горизонт.',
    audience: 'Клиенты с долгосрочной целью, которым важны предсказуемость и защита семьи.',
    arguments: [
      {
        title: 'Защита финансовой цели',
        description: 'Клиент формирует долгосрочный капитал и одновременно получает страховую составляющую.',
      },
      {
        title: 'Понятный сценарий',
        description: 'Продукт проще объяснять через цель клиента, а не через набор сложных параметров.',
      },
      {
        title: 'Дисциплина накоплений',
        description: 'Подходит тем, кому важна регулярность и заранее определённый горизонт.',
      },
    ],
  },
  oms: {
    key: 'oms',
    title: 'ОМС в золоте',
    description: 'Защитный инструмент в периоды экономической и геополитической нестабильности',
    logo: productOmsImage,
    reward: '+120',
    fact: '2 500 000 ₽',
    plan: '5 000 000 ₽',
    runRate: '50%',
    runRateTone: 'negative',
    position: '4 / 50',
    positioning: 'Золото как защитная часть капитала',
    positioningText:
      'Основной сценарий — разговор о диверсификации и защитной части портфеля без необходимости самостоятельно хранить физический металл.',
    audience: 'Клиенты, которые хотят добавить в структуру капитала защитный актив и понимают рыночные колебания.',
    arguments: [
      {
        title: 'Диверсификация',
        description: 'Золото может выступать отдельной защитной частью структуры капитала.',
      },
      {
        title: 'Простой доступ',
        description: 'Клиент получает рыночную экспозицию без бытовых вопросов хранения физического металла.',
      },
      {
        title: 'Понятная роль в портфеле',
        description: 'Продукт проще обсуждать не как ставку на цену, а как элемент диверсификации.',
      },
    ],
  },
  pds: {
    key: 'pds',
    title: 'ПДС',
    description:
      'Долгосрочные накопления с государственной поддержкой, налоговым вычетом и инвестиционным доходом.',
    logo: productPdsImage,
    reward: '+120',
    fact: '7 500 000 ₽',
    plan: '5 000 000 ₽',
    runRate: '150%',
    runRateTone: 'positive',
    position: '4 / 50',
    positioning: 'Долгосрочная цель + государственная поддержка',
    positioningText:
      'ПДС удобно связывать с крупными целями на длинном горизонте, когда клиент готов регулярно формировать накопления.',
    audience:
      'Клиенты с длинным горизонтом планирования, которым важны дисциплина накоплений и доступные меры поддержки.',
    arguments: [
      {
        title: 'Длинный горизонт',
        description: 'Продукт помогает структурировать накопления под будущую крупную цель.',
      },
      {
        title: 'Поддержка',
        description: 'Государственная поддержка и налоговые преимущества усиливают ценность сценария.',
      },
      {
        title: 'Регулярность',
        description: 'ПДС удобно использовать как дисциплинирующий механизм долгосрочного накопления.',
      },
    ],
  },
};

const massLearning: LearningData = {
  title: 'Обучение',
  description:
    'Daily Invest, тесты, вебинары и курсы собраны в одном месте. За завершённые активности начисляются инвест-коины и XP.',
  tags: ['Обучение и развитие', 'Уровень 7 → 8', 'держит стрик'],
  metrics: {
    nextLevel: { value: metricNumber(massGameSnapshot.nextLevelXp - massGameSnapshot.xp), unit: 'XP', progress: massGameSnapshot.levelProgress },
    earned: { value: '410', unit: 'I' },
    weekly: { value: '6 / 7', detail: 'без дополнительных множителей' },
  },
  rule:
    'Инвест-коины за обучение начисляются только за подтверждённое действие — завершённый урок, успешный тест, вебинар или курс. Простое открытие статьи не начисляет инвест-коины, чтобы не стимулировать прокликивание.',
  modules: [
    {
      id: 'daily-invest',
      title: 'Daily Invest',
      description: 'БПИФ, вклады, ПДС и короткие уроки по фокусным темам',
      progress: 57,
      tone: 'violet',
    },
    {
      id: 'pro-investments',
      title: 'ПроИнвестиции',
      description: 'Навигатор фондов, БПИФ и продуктовые курсы',
      progress: 30,
      tone: 'red',
    },
    {
      id: 'webinars',
      title: 'Вебинары',
      description: 'Как переводить клиента из вклада в инвестиции',
      meta: '2 предстоят →',
      tone: 'blue',
    },
    {
      id: 'tests',
      title: 'Тестирование',
      description: 'ПДС, БПИФ и Навигатор фондов',
      progress: 80,
      tone: 'gold',
    },
    {
      id: 'workshops',
      title: 'Практикумы',
      description: 'Диалоги: вклад vs БПИФ, ПДС, готовые решения',
      progress: 45,
      tone: 'green',
    },
    {
      id: 'tracks',
      title: 'Обучающие треки',
      description: 'Назначенные программы по продуктам и обязательным темам',
      tone: 'blue',
    },
    {
      id: 'courses',
      title: 'Курсы',
      description: 'Полные программы: БПИФ, ПДС и разговор о вкладах',
      tone: 'violet',
    },
    {
      id: 'all-modules',
      title: 'Все модули',
      description: 'Каталог целиком',
      tone: 'neutral',
    },
  ],
  materials: [
    {
      id: 'investor',
      title: 'Альфа-Инвестор',
      description: 'статьи, личный опыт и разборы сделок',
      tone: 'blue',
    },
    {
      id: 'knowledge',
      title: 'База знаний',
      description: 'условия продуктов, памятки, возражения',
      tone: 'violet',
    },
    {
      id: 'catalog',
      title: 'Каталог курсов',
      description: 'актуальные курсы, вебинары и тестирования',
      tone: 'gold',
    },
    {
      id: 'client-view',
      title: 'Клиентский вид',
      description: 'как продукт выглядит в приложении клиента',
      tone: 'green',
    },
  ],
};

const massGames: GamesData = {
  title: 'Игры и челленджи',
  description:
    'Витрина игровой активности: инвест-коины, XP, лига, стрик, ачивки и челленджи, которые соединяют продажи с обучением.',
  metrics: [
    {
      label: 'Инвест-коины',
      value: metricNumber(massGameSnapshot.coins, 'I'),
      detail: 'сезонная валюта · сброс в конце месяца',
      tone: 'gold',
      action: 'marketplace',
    },
    { label: 'XP всего', value: metricNumber(massGameSnapshot.xp), detail: 'накопительно · уровень 7', tone: 'violet' },
    { label: 'Ачивок собрано', value: '14 / 30', tone: 'neutral' },
  ],
  leagues: [
    { title: 'Silver', range: '0–2 499 I', description: 'Стартовая лига месяца для всех участников.' },
    {
      title: 'Gold · ваша лига',
      range: massGameSnapshot.league,
      current: true,
      progress: 57,
      progressLabel: 'До Platinum · 2 160 I',
    },
    {
      title: 'Platinum',
      range: '5 000+ I',
      description: 'Открывает повышающий множитель и отдельные награды.',
    },
  ],
  challenges: [
    {
      ...getMassChallenge('full-circle'),
      id: 'full-circle',
      reward: '+150 I',
      progressLabel: '3 из 4 действий',
      action: 'Закрыть последний шаг',
      actionTarget: 'learning',
      tone: 'gold',
    },
    {
      ...getMassChallenge('fund-talks'),
      id: 'fund-talks',
      reward: 'новый челлендж',
      progressLabel: '3 из 5 разговоров',
      action: 'Открыть челлендж',
      actionTarget: 'details',
      tone: 'red',
    },
    {
      ...getMassChallenge('expert-practitioner'),
      id: 'expert-practitioner',
      reward: '+50 I',
      progressLabel: '1 из 2 действий',
      action: 'Открыть тест',
      actionTarget: 'learning',
      tone: 'violet',
    },
    {
      ...getMassChallenge('clean-week'),
      id: 'clean-week',
      reward: '+80 I',
      progressLabel: '0 из 2 условий',
      action: 'Посмотреть обучение',
      actionTarget: 'learning',
      tone: 'green',
    },
  ],
  opportunities: [
    {
      id: 'companion',
      title: 'Спутник',
      description: 'Персональные подсказки: что пройти, кому предложить продукт, где не потерять стрик.',
      tone: 'violet',
    },
    {
      id: 'marketplace',
      title: 'Маркетплейс',
      description: 'Обмен инвест-коинов на титулы, бейджи, мерч и награды из каталога.',
      tone: 'gold',
      action: 'marketplace',
    },
    {
      id: 'mentor',
      title: 'Наставник',
      description: 'Коллега публикует практику, другой сотрудник применяет её в продаже, оба получают прогресс.',
      tone: 'green',
    },
    {
      id: 'segments',
      title: 'Сегменты',
      description: 'Отдельные правила и виджеты для ИК, PM и руководителя с учётом роли и доступных данных.',
      tone: 'blue',
    },
  ],
  achievements: [
    ...featuredAchievements,
    { id: 'plan-boost', title: '+50% к плану', tone: 'red' },
    { id: 'five-courses', title: '5 курсов', tone: 'blue' },
    { id: 'contest-winner', title: 'Призёр конкурса', tone: 'gold' },
    { id: 'office-top', title: 'Топ-3 офиса', tone: 'neutral', locked: true },
    { id: 'thirty-days', title: '30 дней подряд', tone: 'neutral', locked: true },
    { id: 'sales-master', title: 'Мастер продаж', tone: 'neutral', locked: true },
  ],
  ranking: [
    {
      rank: '1',
      initials: 'ДК',
      name: 'Дмитрий К.',
      detail: 'открыть публичный профиль',
      value: '3 210',
      tone: 'violet',
      profileId: 'dmitry',
    },
    {
      rank: '2',
      initials: 'ОМ',
      name: 'Ольга М.',
      detail: 'открыть публичный профиль',
      value: '2 980',
      tone: 'green',
      profileId: 'olga',
    },
    { rank: '8', initials: 'АС', name: 'Алена С.', value: metricNumber(massGameSnapshot.coins, 'I'), tone: 'red', current: true },
  ],
  recent: [
    { title: 'Тест по ПДС', reward: '+30 I' },
    { title: 'Марафон знаний · апрель', reward: '+200 I · ачивка' },
  ],
};

const massProfile: ProfileData = {
  name: 'Алена Соколова',
  roleLine: 'Менеджер по работе с клиентами · Офис «Тверская» · в команде 2 года',
  image: employeeImage,
  level: 'Уровень 7 · Инвест-эксперт',
  league: 'Gold League',
  streak: 'Серия 6 дней',
  coins: metricNumber(massGameSnapshot.coins, 'I'),
  xp: metricNumber(massGameSnapshot.xp),
  achievementsCount: '14',
  nextLevel: {
    label: 'До уровня 8 · Инвест-эксперт',
    remaining: metricNumber(massGameSnapshot.nextLevelXp - massGameSnapshot.xp, 'XP'),
    completed: 5,
    total: 7,
    hint: 'Закрой 2 урока и тест по фондам — и новый уровень твой',
  },
  investmentProgress: [
    { label: 'КПЭ продаж', value: '78%', progress: 78 },
    { label: 'Продаж за месяц', value: '34', detail: '↑ +6' },
    { label: 'Продуктивность', value: '1,9', detail: 'прод./день' },
    { label: 'Активация продуктов', value: '4 / 6' },
  ],
  gameStatus: [
    { label: 'Лига месяца', value: 'Gold', detail: 'Период и очки лиги уточняются', tone: 'gold', action: 'marketplace' },
    { label: 'XP накопительно', value: metricNumber(massGameSnapshot.xp), detail: 'не сбрасывается', tone: 'violet' },
    { label: 'Стрик', value: '6 дней', detail: 'x1.2 на 7-й день', tone: 'red' },
  ],
  achievements: [
    ...featuredAchievements,
    { id: 'plan-boost', title: '+50% к плану', tone: 'red' },
    { id: 'five-courses', title: '5 курсов', tone: 'blue' },
    { id: 'prize-winner', title: 'Призёр', tone: 'gold' },
    { id: 'clean-week', title: 'Чистая неделя', tone: 'green' },
    { id: 'office-top', title: 'Топ-3 офиса', tone: 'neutral', locked: true },
    { id: 'thirty-days', title: '30 дней подряд', tone: 'neutral', locked: true },
    { id: 'sales-master', title: 'Мастер продаж', tone: 'neutral', locked: true },
  ],
  accruals: [
    { id: 'lesson', title: 'Урок Daily Invest', meta: 'сегодня', reward: '+25 I · +12 XP', tone: 'violet' },
    {
      id: 'sale',
      title: 'Продажа Навигатора',
      meta: 'вчера · фокусный продукт',
      reward: '+120 I · +60 XP',
      tone: 'red',
    },
    {
      id: 'challenge',
      title: 'Челлендж «Полный круг»',
      meta: '2 дня назад',
      reward: '+150 I',
      tone: 'gold',
    },
  ],
  nextGoal: { title: 'Ачивка «Топ-3 офиса»', description: 'Поднимись в конкурсе на 11 позиций' },
};

const focusCatalog = createFocusCatalog(Object.values(focusProducts));
// View models derive shared values from one snapshot; formatting never owns business data.
const game = massGameSnapshot;
massDashboard.level = { level: `${game.level} LVL`, title: game.title.toLocaleUpperCase('ru'), progress: game.levelProgress,
  xp: metricNumber(game.xp), coins: metricNumber(game.coins), streak: String(game.streak) };
const consultantContests = massDashboard.contests.map(({ rank: _rank, reward: _reward, ...contest }) => contest);
massDashboard.contests = contestDashboardItems();
massDashboard.ratings[2].position = marathonSnapshot.rank ? `${marathonSnapshot.rank} / ${marathonSnapshot.participants}` : '—';
massDashboard.ratings[2].detail = `«${marathonSnapshot.title}» · ${marathonSnapshot.period}`;
const kpiValues = metricValues(getPortalMetric('mass-kpi'));
Object.assign(massDashboard.kpi, { actual: rubles(kpiValues.actual), plan: rubles(kpiValues.target), progress: kpiValues.completion ?? 0, completion: percentage(kpiValues.completion) });
Object.assign(massProfile, { coins: metricNumber(game.coins, 'I'), xp: metricNumber(game.xp), level: `Уровень ${game.level} · ${game.title}`,
  streak: `Серия ${game.streak} дней`, league: `${game.league} League`, achievementsCount: String(game.achievements),
  nextLevel: { label: `До уровня ${game.level + 1}`, remaining: metricNumber(game.nextLevelXp - game.xp, 'XP'), completed: 0, total: 0, progress: game.levelProgress, hint: `Опыт: ${metricNumber(game.xp)} из ${metricNumber(game.nextLevelXp)} XP до следующего уровня` },
});
massProfile.investmentProgress[0] = { label: 'КПЭ продаж', value: percentage(kpiValues.completion), progress: kpiValues.completion ?? undefined, detail: 'Выполнение плана · сентябрь 2026' };
massProfile.gameStatus[0].detail = 'Период и очки лиги уточняются';
massProfile.gameStatus[1].value = metricNumber(game.xp);
massProfile.gameStatus[2].detail = 'Правило множителя уточняется';
massProfile.nextGoal.description = 'Посмотрите условия и позиции в конкурсе';
massGames.metrics[0].value = metricNumber(game.coins, 'I');
massGames.metrics[0].label = 'Баланс инвест-коинов';
massGames.metrics[0].detail = 'Доступно для наград';
massGames.metrics[1].value = metricNumber(game.xp);
massGames.leagues[1].range = game.league;
massGames.leagues[1].progress = undefined;
massGames.leagues[1].progressLabel = undefined;
massGames.leagues[1].description = 'Лига сохранена. Месячные очки и правило перехода уточняются; баланс для наград считается отдельно.';
massGames.ranking.find(row => row.current)!.value = metricNumber(game.coins, 'I');
massGames.ranking.find(row => row.current)!.detail = 'Баланс; период рейтинга уточняется';
massLearning.metrics.nextLevel = { value: metricNumber(game.nextLevelXp - game.xp), unit: 'XP', progress: game.levelProgress };
massLearning.tags[1] = `Уровень ${game.level} → ${game.level + 1}`;
for (const item of massDashboard.focusProducts) {
  const product = focusCatalog.products.find(product => product.id === item.key)!;
  const rr = salesProgress(focusSales[item.key], focusPeriod).runRate;
  Object.assign(focusProducts[item.key], { fact: rubles(product.sales.actual), plan: rubles(product.sales.plan), runRate: percentage(rr), runRateTone: rr !== null && rr >= 100 ? 'positive' : 'negative' });
  item.title = product.title;
  item.actual = rubles(product.sales.actual);
  item.target = `из ${rubles(product.sales.plan)}`;
  item.runRate = `RR: ${percentage(rr)}`;
  item.runRateTone = rr !== null && rr >= 100 ? 'positive' : 'negative';
}
for (const item of massProducts.products) {
  if (!item.key) continue;
  const product = focusCatalog.products.find(product => product.id === item.key)!;
  item.title = product.title;
  const rr = salesProgress(product.sales, focusPeriod).runRate;
  item.runRate = percentage(rr);
  item.runRateTone = rr !== null && rr >= 100 ? 'positive' : 'negative';
}

export const portalDataProvider: InvestmentSpaceDataProvider = {
  getResources: () => createResources(focusCatalog, []),
  getDashboard: (role) => {
    if (role === 'only') return { ...massDashboard, employee: onlyDashboard.employee };
    if (role === 'manager') return { ...massDashboard, employee: managerData.employee };
    if (role === 'consultant') return { ...massDashboard, employee: consultantData.employee, contests: consultantContests };
    if (role === 'partner') return { ...massDashboard, employee: partnerData.employee };
    return massDashboard;
  },
  getOnlyDashboard: () => onlyDashboard,
  getOnlyProduct: (key) => onlyProducts[key],
  getProducts: () => massProducts,
  getFocusCatalog: (role) => ({ ...focusCatalog, products: focusCatalog.products.filter(product => product.segments.includes(role === 'only' ? 'only' : 'mass')) }),
  getFocusProduct: (_role, key) => focusProducts[key],
  getLearning: () => massLearning,
  getGames: () => massGames,
  getProfile: () => massProfile,
  getMarketplace: (role) => getMarketplaceData(role === 'only' ? 3920 : game.coins),
  getScenario: getScenarioData,
  getPublicProfile: getPublicProfileData,
  getManager: () => managerData,
  getConsultant: () => consultantData,
  getPartner: () => partnerData,
};
