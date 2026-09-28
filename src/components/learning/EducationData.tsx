export const EduPlatform = {
  home: "https://alfapeople.alfabank.ru/lxp-my-education/",
  overdue: "https://alfapeople.alfabank.ru/lxp-my-education/task/7sgrhxm40in0",
  asOf: "18 сентября, 08:20",
  date: "2026-09-18T08:20:00+03:00",
};

export const EduInvestorHome = "https://alfabank.ru/alfa-investor/";

export const EduInvestorArticleIDs = [
  "market-opening",
  "sber-results",
  "novatek-strategy",
];

export const EduDailyCourses = [
  {
    id: "di-1409",
    start: "14.09",
    end: "18.09",
    period: "14–18 сентября",
    theme: "НСЖ",
    topic: "Накопительное страхование жизни",
    progress: 60,
    completedDays: 3,
    totalDays: 5,
    due: "21 сентября, 16:00",
    status: "current",
    url: EduPlatform.home,
  },
  {
    id: "di-0709",
    start: "07.09",
    end: "11.09",
    period: "7–11 сентября",
    theme: "НСЖ",
    topic: "Накопительное страхование жизни",
    progress: 100,
    completedDays: 5,
    totalDays: 5,
    due: "14 сентября, 16:00",
    status: "completed",
    url: EduPlatform.home,
  },
  {
    id: "di-3108",
    start: "31.08",
    end: "04.09",
    period: "31 августа — 4 сентября",
    theme: "Альфа-Инвестиции",
    topic: "Актуальные коэффициенты: сентябрь 2026",
    progress: 40,
    completedDays: 2,
    totalDays: 5,
    due: "7 сентября, 16:02",
    status: "overdue",
    url: EduPlatform.overdue,
  },
  {
    id: "di-2408",
    start: "24.08",
    end: "28.08",
    period: "24–28 августа",
    theme: "Альфа-Инвестиции",
    topic: "Альфа-Инвестиции",
    progress: 100,
    completedDays: 5,
    totalDays: 5,
    due: "31 августа, 16:00",
    status: "completed",
    url: EduPlatform.home,
  },
  {
    id: "di-1708",
    start: "17.08",
    end: "21.08",
    period: "17–21 августа",
    theme: "ОМС",
    topic: "Обезличенные металлические счета",
    progress: 100,
    completedDays: 5,
    totalDays: 5,
    due: "24 августа, 16:00",
    status: "completed",
    url: EduPlatform.home,
  },
  {
    id: "di-1008",
    start: "10.08",
    end: "14.08",
    period: "10–14 августа",
    theme: "ОМС",
    topic: "Обезличенные металлические счета",
    progress: 100,
    completedDays: 5,
    totalDays: 5,
    due: "17 августа, 16:00",
    status: "completed",
    url: EduPlatform.home,
  },
];

export const EduTasks = [
  {
    id: "nsj-check",
    kind: "assessment",
    title: "Проверка знаний по НСЖ",
    description: "Закрепите условия программы и ответы на вопросы клиентов.",
    due: "25 сентября",
    duration: "10 минут",
    status: "not_started",
    progress: 0,
    required: true,
    questions: 10,
    threshold: 80,
    attempts: 3,
    material: "nsj:conditions",
    sections: [
      {
        title: "Перед тестированием",
        text: "Повторите условия программы «Максимум», страховую защиту и ограничения. Материалы для подготовки доступны в базе знаний.",
      },
    ],
  },
  {
    id: "investment-arguments",
    kind: "track",
    title: "Инвестиционные продукты: актуальные аргументы",
    due: "30 сентября",
    duration: "~2 часа",
    status: "in_progress",
    progress: 57,
    required: true,
    description: "Продолжите начатую учебную траекторию.",
  },
  {
    id: "nsj-course",
    kind: "course",
    title: "НСЖ для сотрудников фронт-офиса",
    due: "30 сентября",
    duration: "~1 час",
    status: "in_progress",
    progress: 50,
    required: true,
    description: "Условия программ и подготовка к разговору с клиентом.",
  },
  {
    id: "pds-assessment",
    kind: "assessment",
    title: "Тестирование по ПДС",
    due: "14 сентября",
    duration: "10 минут",
    status: "completed",
    progress: 100,
    score: 90,
    threshold: 80,
    completedAt: "12 сентября",
    required: true,
  },
];

export const EduAllCourses = [
  ...EduDailyCourses.map((c) => ({
    id: c.id,
    title: `Daily Invest · ${c.start}–${c.end}`,
    progress: c.progress,
  })),
  ...EduTasks.filter((t) => t.kind !== "assessment").map((t) => ({
    id: t.id,
    title: t.title,
    progress: t.progress,
  })),
  ...[
    "ПДС: программа долгосрочных сбережений",
    "БПИФ: основы продукта",
    "Стратегии автоследования",
    "Клиентский разговор об инвестициях",
  ].map((title, i) => ({ id: `completed-course-${i}`, title, progress: 100 })),
];

export const EduAverage = Math.round(
  EduAllCourses.reduce((n, c) => n + c.progress, 0) / EduAllCourses.length,
);

export const EduCompletedCount = EduAllCourses.filter(
  (c) => c.progress === 100,
).length;

export interface EducationEvent {
  id: string;
  kind: "webinar" | "workshop" | "interview";
  format: string;
  title: string;
  description: string;
  date: string;
  day: string;
  month: string;
  status: "upcoming" | "past";
  topic: string;
  time?: string;
  duration?: string;
  start?: string;
  end?: string;
  venue?: string;
  host?: string;
  defaultRegistered?: boolean;
  recording?: boolean;
  textAvailable?: boolean;
  dateISO?: string;
  agenda?: {
    title: string;
    text: string;
  }[];
  links?: {
    title: string;
    href: string;
  }[];
}

export const EduEvents: EducationEvent[] = [
  {
    id: "nsj-webinar",
    kind: "webinar",
    format: "Вебинар",
    title: "НСЖ: уверенный разговор с клиентом",
    description:
      "Разберём вопросы о взносах, страховой защите и условиях программы.",
    date: "23 сентября · 15:00 МСК",
    day: "23",
    month: "сен",
    time: "15:00",
    duration: "45 минут",
    start: "2026-09-23T15:00:00+03:00",
    end: "2026-09-23T15:45:00+03:00",
    venue: "Онлайн",
    host: "Команда инвестиционного обучения",
    defaultRegistered: true,
    status: "upcoming",
    topic: "НСЖ",
    agenda: [
      {
        title: "С чего начать разговор",
        text: "Как выяснить задачу клиента и выбрать материалы для обсуждения.",
      },
      {
        title: "Вопросы об условиях программы",
        text: "Взносы, страховая защита и ограничения: что важно проговорить заранее.",
      },
      {
        title: "Клиентские ситуации",
        text: "Разберём вопросы участников и последовательность следующего разговора.",
      },
    ],
    links: [
      {
        title: "НСЖ «Максимум» · условия программы",
        href: "?role=mass&section=knowledge&material=nsj%3Aconditions",
      },
      {
        title: "НСЖ · ответы на частые вопросы",
        href: "?role=mass&section=knowledge&material=nsj%3Aobjections",
      },
    ],
  },
  {
    id: "investment-practice",
    kind: "workshop",
    format: "Практикум",
    title: "От вопроса клиента к инвестиционному решению",
    description:
      "Практика диалога: цель, срок вложений и вопросы перед выбором продукта.",
    date: "25 сентября · 11:00 МСК",
    day: "25",
    month: "сен",
    time: "11:00",
    duration: "60 минут",
    start: "2026-09-25T11:00:00+03:00",
    end: "2026-09-25T12:00:00+03:00",
    venue: "Онлайн",
    host: "Команда инвестиционного обучения",
    defaultRegistered: false,
    status: "upcoming",
    topic: "Клиентский разговор",
    agenda: [
      {
        title: "Подготовка к разговору",
        text: "Определим, какие вопросы нужно задать о цели и сроке вложений.",
      },
      {
        title: "Отработка клиентского кейса",
        text: "Обсудим аргументы и последовательность диалога на основе продуктовых материалов.",
      },
      {
        title: "Обратная связь",
        text: "Разберём вопросы участников и соберём памятку для следующей встречи.",
      },
    ],
    links: [
      {
        title: "Фокусные продукты · условия и материалы",
        href: "?role=mass&section=focus",
      },
    ],
  },
  {
    id: "pds-workshop",
    kind: "workshop",
    format: "Воркшоп",
    title: "Воркшоп по ПДС",
    description:
      "Практический разбор аргументов, вопросов клиентов и типовых возражений.",
    date: "17 сентября · 15:00 МСК",
    day: "17",
    month: "сен",
    time: "15:00",
    duration: "~2 часа",
    start: "2026-09-17T15:00:00+03:00",
    end: "2026-09-17T17:00:00+03:00",
    venue: "Москва, просп. Андропова, 18, корп. 6",
    status: "past",
    topic: "ПДС",
    recording: false,
  },
  {
    id: "pds-questions",
    kind: "interview",
    format: "Вопросы и ответы",
    title: "Вопрос-ответ про ПДС от Альфа НПФ",
    description: "Разбор клиентских ситуаций с Евгением Воронковым.",
    date: "22 сентября",
    dateISO: "2026-09-22",
    day: "22",
    month: "сен",
    status: "upcoming",
    topic: "ПДС",
    textAvailable: true,
  },
];
