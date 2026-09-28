import contestDriveImage from '../assets/contest-drive.webp';
import contestFreshImage from '../assets/optimized/contest-fresh.webp';
import contestHeatImage from '../assets/contest-heat.webp';
import employeeIrinaImage from '../assets/employee-irina.webp';
import analyticsMoneyFlowImage from '../assets/optimized/only-analytics-money-flow.webp';
import analyticsWeekEventsImage from '../assets/only-analytics-week-events.webp';
import analyticsWithoutRushImage from '../assets/only-analytics-without-rush.webp';
import type { OnlyDashboardData, OnlyProductData, OnlyProductKey } from './provider';
import { getPortalMetric } from './portalSnapshot';
import { metricNumber, metricValues } from '../domain/metrics';

export const onlyDashboard: OnlyDashboardData = {
  employee: {
    name: 'Ирина Богданова',
    role: 'Главный премиум-менеджер',
    office: 'Москва · Отделение «Покровка»',
    league: 'Only · Premium',
    image: employeeIrinaImage,
  },
  period: 'Q3 2026 · данные на 21 июля',
  heroTags: ['Only · Premium', 'Вы в ТОП 10%'],
  heroStats: [
    { label: 'Место в рейтинге по КД (% выполнения плана)', value: '38 / 1 157' },
    { label: 'Прогноз премии по КД за 3 квартал', value: '76 тыс. ₽', detail: '2% от КД 3,8 млн ₽' },
    { label: 'Smart-Link · текущий квартал', value: '47 сделок', detail: 'объём 186 млн ₽ · Q3 2026' },
    { label: 'Обучение Only Invest', value: '72%', detail: '2 долга · финальный тест' },
  ],
  contests: [
    {
      period: 'Июль – Август 2026',
      title: 'Драйвим будущее 2.0',
      description: 'Альфа-Банк совместно с Альфа НПФ проводит конкурс с призами и сертификатами на сумму в 10 000 руб.',
      image: contestDriveImage,
      rank: '9 из 1 157',
    },
    {
      period: '1 июля – 7 августа 2026',
      title: 'ПДС Фреш',
      description: 'Увеличь продажи ПДС и выиграй ценный приз.',
      image: contestFreshImage,
      rank: '14 из 1 157',
    },
    {
      period: '1 апреля – 30 июня 2026',
      title: 'Инвест Жара',
      description: 'Достигни плановых показателей конкурса и готовь чемодан в поездку!',
      image: contestHeatImage,
      rank: '5 из 1 157',
    },
  ],
  observationMetrics: [
    {
      id: 'pds',
      label: 'ПДС',
      progress: 74,
      plan: 'План: 12 000 000 ₽',
      scope: 'По клиентам 3–12 млн ₽',
      fact: '8 900 000 ₽',
      noteIcon: '👍',
      noteTitle: 'Темп хороший.',
      note: 'За неделю добавили +0,8 млн ₽.',
      tone: 'green',
    },
    {
      id: 'oms',
      label: 'ОМС',
      progress: 86,
      plan: 'План: 7 000 000 ₽',
      scope: 'По клиентам 3–12 млн ₽',
      fact: '6 000 000 ₽',
      noteIcon: '↗',
      noteTitle: 'Темп стабильный.',
      note: 'За неделю добавили +0,5 млн ₽.',
      tone: 'amber',
    },
    {
      id: 'realestate',
      label: 'ЗПИФ Недвижимость',
      progress: 61,
      plan: 'План: 18 000 000 ₽',
      scope: 'По клиентам 3–12 млн ₽',
      fact: '11 000 000 ₽',
      noteIcon: '⚡',
      noteTitle: 'Нужен буст.',
      note: 'За неделю добавили +1,7 млн ₽.',
      tone: 'violet',
    },
    {
      id: 'finlist',
      label: 'Finlist',
      progress: 92,
      plan: 'План: 5 000 000 ₽',
      scope: 'По клиентам 3–12 млн ₽',
      fact: '4 600 000 ₽',
      noteIcon: '★',
      noteTitle: 'Темп отличный.',
      note: 'За неделю добавили +0,4 млн ₽.',
      tone: 'blue',
    },
  ],
  goals: [
    {
      label: 'KPI КД инвест',
      value: '83%',
      description: '3,8 млн ₽ из квартальной цели 4,6 млн ₽',
      progress: 83,
      trend: '↑ +9 п.п. за месяц',
      remainder: 'до цели 0,8 млн ₽',
      tone: 'success',
    },
    {
      label: 'План по ФП',
      value: '72%',
      description: '18,6 млн ₽ из цели 25,8 млн ₽ по продуктам месяца',
      progress: 72,
      trend: '+0,9 млн ₽ за прошлую неделю',
      remainder: 'до цели 7,2 млн ₽',
    },
    {
      label: 'Выполнение ЧП',
      value: '61%',
      description: '67,1 млн ₽ из цели квартала 110 млн ₽',
      progress: 61,
      trend: 'темп выше плана',
      remainder: '42,9 млн ₽ до цели',
      tone: 'alert',
    },
    {
      label: 'Метрика влияния',
      value: '78%',
      description: 'Сводный результат по четырём контрольным показателям',
      progress: 78,
      trend: 'выше медианы +6 п.п.',
      remainder: 'фокус на качестве клиентской базы',
    },
  ],
  drivers: [
    {
      title: 'Драйверы ЧП',
      tone: 'dark',
      rank: '44 / 1 157',
      factLabel: 'Факт Q3',
      fact: '67,1 млн ₽',
      planLabel: 'План Q3',
      plan: '110 млн ₽',
      progress: 61,
      remainder: '42,9 млн ₽ до цели',
      items: [
        { rank: '1', product: 'opif', title: 'ОПИФ «Накопительный»', description: 'Факт 28,4 млн ₽ из плана 50 млн ₽', coefficient: '4 / 7' },
        { rank: '2', product: 'ul', title: 'UL «Ежемесячный доход»', description: 'Факт 24,6 млн ₽ из плана 40 млн ₽', coefficient: '3 / 5' },
        { rank: '3', product: 'realestate', title: 'ЗПИФ Недвижимость', description: 'Факт 14,1 млн ₽ из плана 20 млн ₽', coefficient: '2 / 4' },
      ],
    },
    {
      title: 'Драйверы КД',
      tone: 'light',
      rank: '38 / 1 157',
      factLabel: 'Факт КД',
      fact: '3,8 млн ₽',
      planLabel: 'План Q3',
      plan: '4,6 млн ₽',
      progress: 83,
      remainder: '0,8 млн ₽ до цели',
      items: [
        { rank: '1', product: 'kalshi', title: 'Венчурный фонд Kalshi', description: 'КД 1,87 млн ₽ · объём 104 млн ₽', coefficient: '1 / 2' },
        { rank: '2', product: 'scfa-potential', title: 'СЦФА «Потенциал ОФЗ»', description: 'КД 0,72 млн ₽ · объём 34 млн ₽', coefficient: '3 / 5' },
        { rank: '3', product: 'scfa-shield', title: 'СЦФА «Защита 100%»', description: 'КД 0,46 млн ₽ · объём 22 млн ₽', coefficient: '2 / 4' },
      ],
    },
    {
      title: 'Драйверы ФП',
      tone: 'light',
      rank: '27 / 1 157',
      factLabel: 'Факт по ФП',
      fact: '18,6 млн ₽',
      planLabel: 'План Q3',
      plan: '25,8 млн ₽',
      progress: 72,
      remainder: '7,2 млн ₽ до цели',
      items: [
        { rank: '1', product: 'kalshi', title: 'Венчурный фонд Kalshi', description: 'Факт 8,4 млн ₽ из плана 10 млн ₽', coefficient: '1 / 2' },
        { rank: '2', product: 'scfa-potential', title: 'СЦФА «Потенциал ОФЗ»', description: 'Факт 6,1 млн ₽ из плана 9 млн ₽', coefficient: '3 / 5' },
        { rank: '3', product: 'scfa-shield', title: 'СЦФА «Защита 100%»', description: 'Факт 4,1 млн ₽ из плана 6,8 млн ₽', coefficient: '2 / 4' },
      ],
    },
  ],
  deals: [
    { rank: '1', manager: 'Александр Р.', division: 'Москва', product: 'ЗПИФ недвижимости', volume: '186 млн ₽', income: '2,79 млн ₽', date: '04.07', productKey: 'realestate' },
    { rank: '2', manager: 'Мария С.', division: 'Северо-Запад', product: 'СЦФА «Защита 100%: ОФЗ»', volume: '154 млн ₽', income: '2,31 млн ₽', date: '08.07', productKey: 'scfa-shield' },
    { rank: '3', manager: 'Дмитрий К.', division: 'Москва', product: 'UL Ежемесячный доход', volume: '132 млн ₽', income: '1,98 млн ₽', date: '15.07', productKey: 'ul' },
    { rank: '4', manager: 'Инна В.', division: 'Юг', product: 'ОПИФ «Накопительный»', volume: '119 млн ₽', income: '1,43 млн ₽', date: '11.07', productKey: 'opif' },
    { rank: '5', manager: 'Вы · Ирина Б.', division: 'Москва', product: 'Венчурный фонд Kalshi', volume: '104 млн ₽', income: '1,87 млн ₽', date: '18.07', current: true, productKey: 'kalshi' },
    { rank: '6', manager: 'Елена Т.', division: 'Урал', product: 'СЦФА «Потенциал ОФЗ с защитой»', volume: '98 млн ₽', income: '1,47 млн ₽', date: '07.07', productKey: 'scfa-potential' },
    { rank: '7', manager: 'Сергей Л.', division: 'Поволжье', product: 'Облигации Selectel 001P-08R', volume: '92 млн ₽', income: '1,10 млн ₽', date: '14.07', productKey: 'selectel' },
    { rank: '8', manager: 'Ольга П.', division: 'Сибирь', product: 'Rental Pro', volume: '88 млн ₽', income: '1,32 млн ₽', date: '02.07', productKey: 'realestate' },
    { rank: '9', manager: 'Роман Н.', division: 'Центр', product: 'ОПИФ «Накопительный»', volume: '81 млн ₽', income: '0,97 млн ₽', date: '17.07', productKey: 'opif' },
    { rank: '10', manager: 'Анна Г.', division: 'Дальний Восток', product: 'UL Ежемесячный доход', volume: '74 млн ₽', income: '1,11 млн ₽', date: '09.07', productKey: 'ul' },
  ],
  nominations: [
    {
      icon: '🏆',
      title: 'Награждение по итогам полугодия',
      place: '2 место',
      hint: 'до первого места — 8,4 млн ₽ ЧП',
      leader: true,
      href: 'https://example.org/crm',
    },
    { icon: '✦', title: 'Лидеры по КД', place: '4 место', hint: 'до ТОП-3 — 180 тыс. ₽ КД' },
    { icon: '◈', title: 'Лидеры по фокусным продуктам', place: '5 место', hint: 'до первого места — 2 целевые сделки' },
  ],
  importantNews: [
    { title: 'Обновлён барьер выплаты по СЦФА', description: 'новые материалы доступны с 20 июля', badge: 'важно', tone: 'red' },
    { title: 'CRM-кампания по клиентам с погашением', description: 'выборка уже в SFA', badge: 'SFA', tone: 'blue' },
  ],
  resources: [
    { mark: '2°', title: 'Вторичные кампании', description: 'готовые выборки, продуктовые поводы и сценарии контакта', badge: 'Открыть', action: 'message', message: 'Открыты вторичные кампании Only.' },
    { mark: 'CRM', title: 'CRM и акции для клиентов онлайн', description: 'актуальные предложения, условия и клиентские механики', badge: 'Онлайн', action: 'news' },
    { mark: 'AI', title: 'ИИ-помощник', description: 'подбор следующего действия и аргументов под профиль клиента', badge: 'Помощник', action: 'message', message: 'ИИ-помощник открыт.' },
  ],
  communities: [
    { mark: 'TG', title: 'Альфа-Инвестиции · Telegram', message: 'Telegram-канал Альфа-Инвестиций открыт.' },
    { mark: 'MAX', title: 'Альфа-Инвестиции · MAX', message: 'Канал Альфа-Инвестиций в MAX открыт.' },
    { mark: 'AIC', title: 'Alfa Invest Community', message: 'Alfa Invest Community открыто.' },
  ],
  analytics: [
    {
      title: 'Где крутятся деньги. Рынок растёт две недели подряд',
      description: 'Отката на рынке акций так и не случилось, а деньги ушли в бумаги второго и третьего эшелона',
      href: 'https://alfabank.ru/alfa-investor/t/gde-krutyatsya-dengi-rynok-rastet-dve-nedeli-podryad/',
      image: analyticsMoneyFlowImage,
    },
    {
      title: 'Главные события рынка с 3 по 7 августа',
      description: 'За какими новостями инвесторам стоит следить на этой неделе',
      href: 'https://alfabank.ru/alfa-investor/t/glavnye-sobytiya-rynka-s-3-po-7-avgusta/',
      image: analyticsWeekEventsImage,
    },
    {
      title: 'Инвестиции без спешки: готовимся к новой неделе',
      description: 'Аналитики Альфа-Инвестиций выделяют самые интересные события и помогают принять взвешенные решения',
      href: 'https://alfabank.ru/alfa-investor/t/investitsii-bez-speshki-gotovimsya-k-novoy-nedele/',
      image: analyticsWithoutRushImage,
    },
  ],
};

export const onlyProducts: Record<OnlyProductKey, OnlyProductData> = {
  opif: {
    key: 'opif',
    kicker: 'Фокусный продукт · УК «Альфа-Капитал»',
    title: 'ОПИФ «Накопительный»',
    description: 'Открытый ПИФ с консервативным профилем риска. Доходность с момента создания фонда — +20,71% с 21.05.2025 по 03.07.2026.',
    heroTone: 'light',
    backTarget: 'home',
    stats: [
      { label: 'Тип фонда', value: 'Открытый ПИФ' },
      { label: 'Профиль риска', value: 'Консервативный' },
      { label: 'Срок', value: 'от 1 года' },
      { label: 'Цена пая', value: '120,75 ₽' },
    ],
    blocks: [
      {
        title: 'Топ-5 эмитентов', span: 6, marker: 'number', items: [
          { mark: '1', title: 'МТС', description: '6,55%' },
          { mark: '2', title: 'Газпром нефть', description: '6,18%' },
          { mark: '3', title: 'Мегафон', description: '6,10%' },
          { mark: '4', title: 'РЖД', description: '5,60%' },
          { mark: '5', title: 'Магнит', description: '5,54%' },
        ],
      },
      {
        title: 'Состав портфеля', span: 6, items: [
          { mark: '≈', title: 'Корпоративные облигации', description: 'около 75%' },
          { mark: '≈', title: 'Денежный рынок', description: 'около 25%' },
        ], paragraphs: ['Управляющий — Андрей Золотов.'],
      },
    ],
    salesScript: [
      'Есть идея, как сохранить доходность при падении ставок по депозитам — покупка ОПИФа «Накопительный» от Альфа-Капитала.',
      'Что получает клиент: фонд-копилку, где доходность не будет падать вместе с депозитными ставками.',
      'Как это работает: фонд сохраняет высокую доходность на длинном горизонте благодаря низкой чувствительности к изменению ключевой ставки, а включение государственных и корпоративных облигаций повышает доходность без увеличения риска.',
    ],
  },
  ul: {
    key: 'ul',
    kicker: 'Фокусный продукт · Альфастрахование-Жизнь',
    title: 'Unit Linked «Ежемесячный доход: пополнение»',
    description: 'Инструмент с ожидаемой доходностью на 12 месяцев — ключевая ставка + 0,7% по мнению аналитиков блока состоятельных клиентов.',
    heroTone: 'light',
    backTarget: 'home',
    stats: [
      { label: 'Состав портфеля', value: 'Облигации (флоатеры)' },
      { label: 'Профиль риска', value: 'Консервативный' },
      { label: 'Срок', value: 'от 6 месяцев' },
      { label: 'Минимальное пополнение', value: 'от 50 тыс. ₽' },
    ],
    blocks: [
      {
        title: 'Ключевые преимущества', span: 6, items: [
          { mark: '✓', title: 'Ежемесячные выплаты купонов' },
          { mark: '✓', title: 'Налог только с чистой прибыли', description: 'при выводе сверх взноса' },
          { mark: '✓', title: 'Консервативная стратегия', description: 'порядка 100% облигаций' },
          { mark: '✓', title: 'Свободный выход без комиссии', description: 'с 7-го месяца' },
        ],
      },
      {
        title: 'Комиссии', span: 6, items: [
          { mark: '0,25%', title: 'Вход' },
          { mark: '1,96%', title: 'Управление', description: 'в год' },
          { mark: '0,1%', title: 'За сделку' },
          { mark: '0,5%', title: 'Выход', description: 'при выводе >15% в первые 6 мес.' },
        ],
      },
    ],
    salesScript: [
      'Если позволите — хочу поделиться одним инструментом, который мне кажется стоит вашего внимания.',
      'Ежемесячные выплаты на счёт — ключевая ставка + 0,7%. Портфель из облигаций АЛРОСА, Газпром нефти, Норникеля — без резких просадок. Налоги уплачиваются только при выводе средств и только с суммы, превышающей вложения; в течение года налогов нет.',
      'И кстати, юридический статус Unit Linked защищает капитал и позволяет передавать его адресно.',
    ],
  },
  realestate: {
    key: 'realestate',
    kicker: 'Фокусный продукт',
    title: 'Недвижимость',
    description: 'Подборка идей по недвижимости с целевой доходностью более 15% годовых.',
    heroTone: 'light',
    backTarget: 'home',
    stats: [
      { label: 'Ожидаемая доходность', value: '15–28,8%' },
      { label: 'Минимальный вход', value: 'от 55 000 ₽' },
      { label: 'Формат', value: 'ЗПИФ / индустриальная и коммерческая недвижимость' },
    ],
    blocks: [
      {
        title: 'Альфа Промышленные парки 3.0', span: 6, subtitle: 'Ожидаемая доходность — 28,8%', paragraphs: [
          'Стратегия индивидуального доверительного управления для инвестиций в строительство коммерческой недвижимости в формате light industrial.',
          'Sales points: инвестиции от 55 000 ₽; цены продажи выросли на 127%, аренда — на 238% из‑за дефицита; льготная ипотека и субсидии в Москве поддерживают спрос; горизонт реализации — до 3 лет.',
        ],
      },
      {
        title: 'ЗПИФ «Место встречи»', span: 6, subtitle: 'Ожидаемая доходность — 22,1%', paragraphs: [
          'ЗПИФ коммерческой недвижимости, инвестирующий в современные районные центры общей площадью 373 тыс. кв. м в Москве с более чем 1200 арендаторами.',
          'Sales points: защита от инфляции через реальный актив; стабильный ежемесячный денежный поток; ликвидность на бирже; объекты класса А; освобождение от уплаты налога на имущество в течение 5 лет.',
        ],
      },
      {
        title: 'Rental Pro от ООО УК «А Класс Капитал»', span: 12, subtitle: 'Ожидаемая доходность — 15,2%', paragraphs: [
          'ЗПИФ Rental Pro — фонд индустриальной недвижимости с ежемесячной выплатой дохода. Активы инвестируются в современные индустриальные здания класса A, логистические центры, складские комплексы и центры обработки данных.',
          'Sales points: фактически выплаченная доходность — 16,4%; полная ресурсная независимость — объекты возводятся внутри контура фонда; инвесторам уже выплачено 8,1 млрд ₽ ежемесячного дохода с момента IPO; ликвидность обеспечивается утренней, вечерней и дополнительной сессией выходного дня.',
        ],
      },
    ],
  },
  selectel: {
    key: 'selectel',
    kicker: 'Фокусный продукт',
    title: 'Облигации Selectel 001P-08R',
    description: 'Биржевые облигации с ориентиром по доходности 17,3% и купонным периодом 30 дней.',
    heroTone: 'light',
    backTarget: 'news',
    stats: [
      { label: 'Эмитент', value: 'АО Селектел' },
      { label: 'Номинал', value: '1 000 ₽' },
      { label: 'Срок обращения', value: '3 года' },
      { label: 'Дюрация', value: '2,4' },
    ],
    blocks: [
      {
        title: 'Рейтинг и тайминг', span: 5, items: [
          { mark: 'A+', title: 'Кредитный рейтинг', description: 'A+(RU), АКРА / ruA+, Эксперт РА' },
          { mark: 'A', title: 'Взгляд А-Клуба', description: 'интересен при купоне не ниже 15,5%' },
          { mark: '🗓', title: 'Сбор заявок', description: '08.07.2026 с 11:00 до 15:00 (МСК)' },
        ],
      },
      {
        title: 'Скрипт продаж', span: 7, paragraphs: [
          'Селектел — крупнейший независимый провайдер IT-инфраструктурных услуг в России.',
          'Топ-3 на рынке облачных сервисов в России, 17 лет опыта и проверенная инфраструктура: 4 дата-центра, собственная облачная платформа и система управления серверами.',
          'Большая клиентская база, регулярные платежи, низкая зависимость от одного заказчика, быстрый рост и высокая рентабельность.',
        ],
      },
    ],
  },
  kalshi: {
    key: 'kalshi',
    kicker: 'Фокусный продукт · GO INVEST',
    title: 'Венчурный фонд Kalshi',
    description: 'Маржинальность продукта — 13,65% в RUB / 11,4% в USD. Продукт для квалифицированных инвесторов.',
    heroTone: 'dark',
    backTarget: 'home',
    stats: [
      { label: 'Минимальная сумма', value: '$20 000' },
      { label: 'Оборот', value: '$15 млрд в месяц' },
      { label: 'Оценка компании', value: '~$25 млрд' },
      { label: 'Горизонт', value: '2 года' },
    ],
    blocks: [
      {
        title: 'Ключевые параметры', span: 5, items: [
          { mark: '✓', title: 'Ожидаемая доходность', description: '34% годовых в USD, 1,8x за 2 года' },
          { mark: '✓', title: 'КД менеджера', description: '13,65% в RUB / 11,4% в USD + комиссия за сделку' },
          { mark: '✓', title: 'Статус инвестора', description: 'только квалифицированные инвесторы' },
        ],
      },
      {
        title: 'Почему это интересно', span: 7, paragraphs: [
          'Американская биржа с федеральной лицензией, оборотом $15 млрд в месяц и долей мирового рынка порядка 50%. Kalshi опережает ближайшего конкурента Polymarket по всем метрикам.',
          'Контракты на события — новый класс актива, аналог S&P 500 для рынка ожиданий. Чемпионат мира по футболу 2026, выборы в Конгресс США и геополитика могут стать катализаторами роста торгов в ближайшие месяцы.',
          'Среди инвесторов Kalshi — Sequoia, a16z, CapitalG (Google) и Morgan Stanley. Крупнейшие брокеры Robinhood, Interactive Brokers и Coinbase используют инфраструктуру Kalshi.',
        ],
      },
    ],
    salesScript: [
      'Хочу предложить вам рассмотреть участие в венчурной сделке в компании Kalshi — американской бирже под федеральной лицензией с оборотом $15 млрд в месяц.',
      'Kalshi — лидер быстрорастущего рынка предсказаний. Ожидаемая доходность — 34% годовых в долларах на горизонте 2 лет. Среди инвесторов — Sequoia, a16z, Google и Morgan Stanley.',
      'Минимальная сумма входа — 20 000 долларов. Буду рад обсудить детали.',
    ],
    actions: [
      { label: 'A-монитор', message: 'A-монитор Kalshi открыт.', primary: true },
      { label: 'Дополнительные материалы', message: 'Дополнительные материалы Kalshi открыты.' },
    ],
  },
  'scfa-potential': {
    key: 'scfa-potential',
    kicker: 'Фокусный продукт',
    title: 'СЦФА «Потенциал ОФЗ с защитой»',
    description: 'Маржинальность продукта — от 6%. Доступен неквалифицированным инвесторам в рамках годового лимита.',
    heroTone: 'dark',
    backTarget: 'home',
    stats: [
      { label: 'Срок', value: '36 месяцев' },
      { label: 'Базовый актив', value: 'ОФЗ 26248' },
      { label: 'Доступен', value: '06.07–16.07.2026' },
      { label: 'Условный доп. доход', value: '16,67% годовых' },
    ],
    blocks: [
      {
        title: 'Ключевые параметры дохода', span: 5, items: [
          { mark: '✓', title: 'Выплата в конце срока', description: '50% через 3 года' },
          { mark: '✓', title: 'Барьер выплаты купона', description: '100%' },
          { mark: '✓', title: 'Защита капитала', description: '100% клиентских денег' },
        ],
      },
      {
        title: 'Почему это интересно', span: 7, paragraphs: [
          'ОФЗ с длинным сроком погашения остаются перспективным активом: текущие доходности создают предпосылки для роста.',
          '100% защита клиентских денег обеспечена Альфа-Банком вне зависимости от динамики базового актива. Через 3 года клиент гарантированно возвращает 100% вложений.',
          'Если ЦБ РФ снизит ставку, тело облигации вырастет. Мы ожидаем снижение ставки ниже 10% в перспективе 3 лет, что максимизирует выплаты купона по продукту.',
        ],
      },
    ],
    salesScript: ['Если вам важно сохранить капитал, но при этом участвовать в росте длинной ОФЗ, можно рассмотреть СЦФА «Потенциал ОФЗ с защитой». На горизонте трёх лет продукт предусматривает 100% защиту вложений и условный дополнительный доход 16,67% годов.'],
    actions: [
      { label: 'A-монитор', message: 'A-монитор СЦФА «Потенциал ОФЗ с защитой» открыт.', primary: true },
      { label: 'Дополнительные материалы', message: 'Продуктовая карточка и материалы СЦФА открыты.' },
    ],
  },
  'scfa-shield': {
    key: 'scfa-shield',
    kicker: 'Фокусный продукт',
    title: 'СЦФА «Защита 100%: ОФЗ»',
    description: 'Маржинальность продукта — от 7%. Защита капитала 100%, коэффициент участия 200%.',
    heroTone: 'dark',
    backTarget: 'home',
    stats: [
      { label: 'Срок', value: '36 месяцев' },
      { label: 'Базовый актив', value: 'ОФЗ 26248' },
      { label: 'Доступен', value: '06.07–16.07.2026' },
      { label: 'Доходность', value: 'до 20% годовых' },
    ],
    blocks: [
      {
        title: 'Ключевые параметры', span: 5, items: [
          { mark: '✓', title: 'Коэффициент участия', description: '200%' },
          { mark: '✓', title: 'Защита капитала', description: '100%' },
          { mark: '✓', title: 'Доход', description: 'формируется за счёт роста цены, а не выплаты купонов' },
        ],
      },
      {
        title: 'Почему это интересно', span: 7, paragraphs: [
          'ОФЗ с длинным сроком погашения остаются перспективным активом, а текущие доходности создают потенциал роста тела облигации.',
          'Клиент получает 100% защиту вложений, обеспеченную Альфа-Банком, и может участвовать в росте базового актива благодаря коэффициенту участия 200%.',
          'Продукт доступен для оформления неквалифицированным инвесторам ЦФА в рамках годового лимита до 600 тыс. рублей.',
        ],
      },
    ],
    salesScript: ['Для клиента, которому важна 100% защита капитала, но нужен потенциал выше классического размещения, можно обсудить СЦФА «Защита 100%: ОФЗ». Клиент участвует в росте ОФЗ с коэффициентом 200%, при этом к окончанию срока сохраняется 100% вложенной суммы.'],
    actions: [
      { label: 'A-монитор', message: 'A-монитор СЦФА «Защита 100%: ОФЗ» открыт.', primary: true },
      { label: 'Дополнительные материалы', message: 'Продуктовая карточка и материалы СЦФА открыты.' },
    ],
  },
  leaders: {
    key: 'leaders',
    kicker: 'Фокусный продукт',
    title: 'CO C-1-800 «Лидеры индустрии»',
    description: 'Маржинальность продукта — от 7%. Для квалифицированных инвесторов.',
    heroTone: 'dark',
    backTarget: 'home',
    stats: [
      { label: 'Срок', value: '12 месяцев' },
      { label: 'Базовые активы', value: 'Сбербанк, Дом.РФ, Озон, Яндекс, ВТБ' },
      { label: 'Доступен', value: '02.07–09.07.2026' },
      { label: 'Условный доход', value: '24% годовых' },
    ],
    blocks: [
      {
        title: 'Ключевые параметры дохода', span: 5, items: [
          { mark: '✓', title: 'Выплаты ежемесячно', description: '2%' },
          { mark: '✓', title: 'Барьер выплаты купона', description: '80%' },
          { mark: '✓', title: 'Эффект памяти', description: 'применим' },
        ],
      },
      {
        title: 'Почему это интересно', span: 7, paragraphs: [
          'Российский рынок сейчас дешёв; текущая коррекция (16 недель подряд) создаёт предпосылки для разворота на горизонте ближайших месяцев.',
          'Мы предлагаем получить экспозицию в российский фондовый рынок через СО «Лидеры индустрии». Это автоколл со сниженным барьером ЕКИ и купона до 80%.',
          'Для погашения продукта по номиналу и получения ежемесячного купонного дохода по ставке 24% годовых базовые активы не должны снизиться более чем на 20% за 1 год. При сильном развороте предусмотрен автоколл на уровне 120%.',
        ],
      },
    ],
    salesScript: ['Если вы рассматриваете идею на рост российского рынка, но хотите получать доход даже при умеренной коррекции, можно рассмотреть СО «Лидеры индустрии». Продукт предусматривает ежемесячный условный купон 2%, барьер 80% и эффект памяти. Прежде чем принять решение, давайте сверим его с вашим риск-профилем и горизонтом.'],
    actions: [
      { label: 'A-монитор', message: 'A-монитор СО «Лидеры индустрии» открыт.', primary: true },
      { label: 'Дополнительные материалы', message: 'Продуктовая карточка и материалы СО «Лидеры индустрии» открыты.' },
    ],
  },
};

// One numeric source for goal cards, hero summaries and driver totals.
for (const [index, id] of ['only-kd', 'only-fp', 'only-cp'].entries()) {
  const m = getPortalMetric(id), v = metricValues(m);
  const goal = onlyDashboard.goals[index];
  goal.value = `${Math.round(v.completion!)}%`;
  goal.progress = Math.round(v.completion!);
  goal.description = `${metricNumber(v.actual, '₽')} из цели ${metricNumber(v.target, '₽')} · III квартал`;
  goal.remainder = `До цели ${metricNumber(-v.deviation!, '₽')}`;
  goal.tone = undefined;
  goal.trend = 'Выполнение плана; прогноз не задан';
}
for (const [index, id] of ['only-cp', 'only-kd', 'only-fp'].entries()) {
  const v = metricValues(getPortalMetric(id)), driver = onlyDashboard.drivers[index];
  driver.fact = metricNumber(v.actual, '₽'); driver.plan = metricNumber(v.target, '₽');
  driver.progress = Math.round(v.completion!); driver.remainder = `До цели ${metricNumber(-v.deviation!, '₽')}`;
}
for (const item of onlyDashboard.observationMetrics) {
  const v = metricValues(getPortalMetric(`observation-${item.id}`));
  item.fact = metricNumber(v.actual, '₽'); item.plan = `План: ${metricNumber(v.target, '₽')}`;
  item.progress = Math.round(v.completion!); item.noteTitle = 'Выполнение квартального плана.';
  item.tone = 'blue';
}
