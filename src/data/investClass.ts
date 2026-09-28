import voronkovTranscript from './learning/pds-voronkov.txt?raw';
import nsjImage from '../assets/optimized/nsj-course.webp';
import voronkovImage from '../assets/optimized/pds-voronkov.webp';

export type InvestClassKind = 'workshop' | 'track' | 'assessment' | 'course' | 'interview';
export interface InvestClassItem {
  id: string;
  kind: InvestClassKind;
  title: string;
  description: string;
  date: string;
  duration?: string;
  venue?: string;
  reward?: number;
  image?: string;
  imageAlt?: string;
  progress?: { completed: number; total: number };
  availability: string;
  transcript?: string;
  sections: Array<{ title: string; text: string }>;
  links: Array<{ title: string; href: string }>;
  speaker?: { name: string; role: string };
}
export const investClassKinds: Record<InvestClassKind, string> = { workshop: 'Воркшоп', track: 'Учебная траектория', assessment: 'Тестирование', course: 'Дистанционный курс', interview: 'Вопросы и ответы' };
const pdsLink = { title: 'ПДС · условия на сайте Альфа-Банка', href: 'https://alfabank.ru/make-money/investments/programma-dolgosrochnyh-sberezhenij/' };
const nsjLink = { title: 'Накопительное страхование жизни · Альфа-Банк', href: 'https://alfabank.ru/make-money/investments/nszh/' };
const pdsIntro = { title: 'Перед разговором о ПДС', text: 'ПДС — программа для долгосрочных накоплений. Перед выбором программы обсудите цель клиента, срок и доступный резерв. Условия взносов, выплат и досрочного расторжения проверяйте по выбранному договору.' };
export const investClassItems: InvestClassItem[] = [
  {
    id: 'pds-workshop', kind: 'workshop', title: 'Воркшоп по ПДС',
    description: 'Практический разбор аргументов, вопросов клиентов и типовых возражений',
    date: '17 сентября 15:00', duration: '~2 часа', venue: 'Москва, просп. Андропова, 18, корп. 6', reward: 100,
    availability: 'Материалы воркшопа и запись пока не опубликованы.',
    sections: [pdsIntro, { title: 'Что подготовить', text: 'Соберите вопросы клиентов о сроках, доступе к накоплениям и отличиях ПДС от других продуктов. Для подготовки доступны условия программы и разбор вопросов с Евгением Воронковым.' }],
    links: [pdsLink, { title: 'Вопрос-ответ про ПДС от Альфа НПФ', href: '?role=mass&section=learning&view=invest-class&item=pds-questions' }],
  },
  {
    id: 'investment-arguments', kind: 'track', title: 'Инвестиционные продукты: актуальные аргументы',
    description: 'Аргументы для разговора с клиентом об инвестиционных продуктах.',
    date: '18 сентября 15:00', duration: '~2 часа', reward: 50, progress: { completed: 4, total: 7 },
    availability: 'Оставшиеся траектории пока не опубликованы. Прогресс сохранён: 4 из 7.',
    sections: [{ title: 'Подготовка к клиентскому разговору', text: 'Начните с цели и срока вложений. Сопоставьте потребность в доступе к деньгам, приемлемый риск и условия продукта. Для подготовки используйте продуктовые материалы портала.' }, { title: 'Состав обучения', text: 'В программе семь траекторий. Названия и материалы отдельных траекторий появятся после публикации программы.' }],
    links: [{ title: 'Фокусные продукты · условия и материалы', href: '?role=mass&section=focus' }, pdsLink, nsjLink],
  },
  {
    id: 'pds-assessment', kind: 'assessment', title: 'Тестирование по ПДС',
    description: 'Закрепите знание продукта перед следующей клиентской коммуникацией.', date: 'до 14 сентября', reward: 200,
    availability: 'Вопросы теста и критерии прохождения пока не опубликованы.',
    sections: [pdsIntro, { title: 'Материалы для подготовки', text: 'Повторите условия программы, порядок выплат и досрочного расторжения. В разборе вопросов с представителем Альфа НПФ рассмотрены клиентские ситуации и распространённые представления о ПДС.' }],
    links: [pdsLink, { title: 'Разбор вопросов по ПДС', href: '?role=mass&section=learning&view=invest-class&item=pds-questions' }],
  },
  {
    id: 'nsj-course', kind: 'course', title: 'Накопительное страхование жизни для сотрудников фронт-офиса',
    description: 'Знакомство с накопительным страхованием жизни и условиями программ для клиентов.', date: 'Дистанционный курс', duration: '~1 час', reward: 200,
    image: nsjImage, imageAlt: 'Накопительное страхование жизни',
    availability: 'Уроки курса и итоговое задание пока не опубликованы.',
    sections: [{ title: 'О накопительном страховании жизни', text: 'НСЖ объединяет накопления и страховую защиту. Программы различаются сроками и графиком взносов. Для знакомства с конкретной программой откройте её условия и материалы.' }, { title: 'Материалы перед курсом', text: 'На портале доступны условия «Максимума»: взносы, выплаты, страховое покрытие и ограничения. Это материалы для подготовки; прохождение курса будет доступно после публикации уроков.' }],
    links: [{ title: 'НСЖ «Максимум» · материалы продукта', href: '?role=mass&section=focus&product=nsj' }, nsjLink],
  },
  {
    id: 'pds-questions', kind: 'interview', title: 'Вопрос-ответ про ПДС от Альфа НПФ',
    description: voronkovTranscript.split('\n')[0], date: '22 сентября',
    image: voronkovImage, imageAlt: 'Евгений Воронков, руководитель управления по работе с Альфа-Банком Департамента развития продаж',
    speaker: { name: 'Евгений Воронков', role: 'Руководитель управления по работе с Альфа-Банком Департамента развития продаж' },
    availability: '',
    transcript: voronkovTranscript,
    sections: [],
    links: [],
  },
];
export function investClassHref(id?: string) {
  const params = new URLSearchParams({ role: 'mass', section: 'learning', view: 'invest-class' });
  if (id) params.set('item', id);
  return `?${params}`;
}
