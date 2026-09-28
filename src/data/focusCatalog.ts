import { focusSales, type FocusProductId } from './investmentSales';
export { focusSales } from './investmentSales';
import { omsGoldContent } from './omsGold';
import material0 from '../assets/optimized/focus/maximum-brochure-1.webp';
import material1 from '../assets/optimized/focus/maximum-brochure-2.webp';
import material2 from '../assets/optimized/focus/maximum-presentation-1.webp';
import material3 from '../assets/optimized/focus/maximum-presentation-2.webp';
import material4 from '../assets/optimized/focus/maximum-presentation-3.webp';
import material5 from '../assets/optimized/focus/maximum-presentation-4.webp';
import material6 from '../assets/optimized/focus/maximum-presentation-5.webp';
import type { FocusProductData } from './provider';
import type { ProductSales, SalesPeriod } from '../domain/focus';

export type { FocusProductId } from './investmentSales';
export type FocusCategory = 'insurance' | 'savings' | 'investments';
export interface FocusPeriodProduct {
  id: string;
  title: string;
  category: FocusCategory;
  label: string;
  description: string;
  sales: ProductSales;
  sourceUrl: string;
}
export interface FocusCatalogPeriod {
  period: SalesPeriod;
  changes: { added: string[]; removed: string[]; changed?: string[] };
  productIds?: FocusProductId[];
  products?: FocusPeriodProduct[];
}
export interface LearningSection {
  id: string;
  title: string;
  entries: Array<{ title: string; text: string; links?: Array<{ title: string; href: string }> }>;
}
export interface FocusProduct {
  id: FocusProductId;
  segments: Array<'mass' | 'only'>;
  title: string;
  category: FocusCategory;
  description: string;
  logo?: string;
  audience: string;
  benefits: Array<{ title: string; description: string }>;
  sales: ProductSales;
  facts: Array<{ label: string; value: string }>;
  sections: LearningSection[];
  source: string;
  important?: { title: string; text: string };
  hasExample?: boolean;
  materials?: Array<{ title: string; href: string }>;
}
export interface FocusCatalogData {
  period: SalesPeriod;
  products: FocusProduct[];
  changes: FocusCatalogPeriod['changes'];
  periods: FocusCatalogPeriod[];
}
export const focusCategoryLabels: Record<FocusCategory, string> = {
  insurance: 'Страхование', savings: 'Сбережения', investments: 'Инвестиции',
};
// September 2026 has no public holidays or transferred working weekends.
// Fixed reporting cut-off: completed business day, never the browser's current time.
export const focusPeriod: SalesPeriod = {
  month: '2026-09', asOf: '2026-09-18',
  workingDates: [1,2,3,4,7,8,9,10,11,14,15,16,17,18,21,22,23,24,25,28,29,30].map(day => `2026-09-${String(day).padStart(2, '0')}`),
};
export const augustFocusPeriod: SalesPeriod = {
  month: '2026-08', asOf: '2026-08-31',
  workingDates: [3,4,5,6,7,10,11,12,13,14,17,18,19,20,21,24,25,26,27,28,31].map(day => `2026-08-${String(day).padStart(2, '0')}`),
};
const maximumSections: LearningSection[] = [
  { id: 'conditions', title: 'Условия программы', entries: [
    { title: 'Три ежегодных взноса', text: 'Срок — 3 года. Взнос от 30 000 до 20 000 000 ₽, один раз в год, в рублях. Доход — 21% от каждого взноса за весь срок программы, выплата в конце срока. Это не ставка годовых.' },
    { title: 'Кто участвует', text: 'Страхователь — дееспособное физическое лицо от 18 до 97 лет. Застрахованный — от 18 до 72 лет на дату начала страхования. Страхователь и застрахованный могут быть разными лицами; допустимые отношения проверяются по условиям договора.' },
    { title: 'Выгодоприобретатель', text: 'Любое физическое лицо, назначенное страхователем. В период действия договора можно изменить персональные данные, заменить или добавить выгодоприобретателя и изменить доли выплаты.' },
    { title: 'Платежи и отказ от программы', text: 'Период охлаждения — 14 календарных дней: возврат 100% взноса при расторжении в этот период. Льготный период для очередного взноса — 14 календарных дней. После периода охлаждения действует таблица выкупных сумм из договора.' },
  ]},
  { id: 'protection', title: 'Защита и дополнительные возможности', entries: [
    { title: 'При дожитии до конца срока', text: 'Возврат внесённых взносов и гарантированный доход: 121% суммы трёх ежегодных взносов, до вычета НДФЛ.' },
    { title: 'При уходе из жизни', text: 'Возврат внесённых ежегодных взносов согласно таблице страховых сумм. При смерти в результате внешнего события предусмотрена дополнительная выплата в размере трёх ежегодных взносов. Выплата зависит от условий и исключений договора.' },
    { title: 'Медицинский сервис', text: 'Лимит — 4,5% ежегодного взноса. В первый год предусмотрены консультации терапевта и специалистов, исследования по назначению врача в рамках программы. Медицинский и лекарственный навигаторы доступны первые 3 месяца. Полный состав услуг — в приложениях к условиям страхования.' },
    { title: 'Адресная передача капитала', text: 'Выплату получает назначенный в договоре выгодоприобретатель. По представленным материалам, срок выплаты — 14–30 дней после заявления и подтверждающих документов. Порядок, перечень документов и юридические ограничения проверяются по договору.' },
  ]},
  { id: 'limits', title: 'Что важно объяснить клиенту', entries: [
    { title: 'Программа не является вкладом', text: 'Это договор страхования жизни. Нельзя обещать свободное снятие денег или представлять программу как замену вклада. Сначала уточните, какие средства клиенту могут понадобиться в ближайшие три года.' },
    { title: 'Досрочное расторжение', text: 'Возвращается выкупная сумма, а не обязательно все внесённые деньги. В первый год она может быть равна 0 ₽. Покажите клиенту таблицу выкупных сумм до оформления.' },
    { title: 'Налогообложение', text: 'Все примеры здесь приведены до вычета НДФЛ. В материалах указаны ставки 13% и 15% с порогом 2,4 млн ₽ и освобождение выплат в связи со смертью. Для индивидуального расчёта используйте действующие правила страховщика; налоговый вычет по этой трёхлетней программе не обещайте.' },
    { title: 'Исключения из покрытия', text: 'В материалах перечислены, в частности, преступные действия, опьянение, профессиональный и ряд опасных видов спорта, отдельные авиационные риски, управление транспортом в состоянии опьянения. Это сокращённый обзор: перед оформлением необходимо разобрать полный перечень в условиях страхования.' },
    { title: 'После оформления', text: 'Проверьте актуальный телефон клиента, объясните доступ к приложению и медицинскому сервису. Предупредите о возможном приветственном звонке страховщика и убедитесь, что клиент понимает условия до подписания договора.' },
  ]},
  { id: 'conversation', title: 'Как построить разговор', entries: [
    { title: '1. Узнать цель и доступную сумму', text: '«На какую цель вы хотите накопить? Когда понадобятся деньги? Какой ежегодный взнос будет комфортным на протяжении трёх лет?» Отдельно уточните потребность в ликвидном резерве.' },
    { title: '2. Связать предложение с целью', text: '«Для части средств, которую вы готовы выделить на три года, можно рассмотреть накопительное страхование жизни с заранее определённым доходом. Давайте посмотрим, как устроены взносы, выплата и страховая защита».' },
    { title: '3. Разобрать пример и ограничения', text: '«При ежегодном взносе 200 000 ₽ вы внесёте 600 000 ₽ за три года. Выплата при дожитии составит 726 000 ₽ до НДФЛ. Доход 126 000 ₽ выплачивается в конце срока. При досрочном расторжении сумма возврата может быть существенно ниже внесённой».' },
    { title: '4. Проверить понимание', text: '«Комфортно ли вносить выбранную сумму каждый год? Понятно ли, когда вы получите выплату и что произойдёт при досрочном расторжении?» Затем разберите покрытие, исключения и документы.' },
  ]},
  { id: 'objections', title: 'Ответы на частые вопросы', entries: [
    { title: '«Это 21% годовых?»', text: 'Нет. 21% начисляется на каждый взнос за весь срок программы и выплачивается в конце. В примере с тремя взносами по 200 000 ₽ общий доход до налога — 126 000 ₽.' },
    { title: '«Три года — слишком долго»', text: 'Уточните, когда и для чего могут понадобиться деньги. Если клиенту нужен свободный доступ к этой сумме, программа может не подходить. Не убеждайте клиента отказываться от необходимого резерва.' },
    { title: '«Я не смогу вносить каждый год»', text: 'Ежегодные взносы — обязательная часть программы. Оцените устойчивый бюджет вместе с клиентом. Не обещайте, что будущий доход по другим продуктам обязательно покроет взносы.' },
    { title: '«А если я захочу забрать деньги?»', text: 'Свободного снятия нет. После периода охлаждения применяется досрочное расторжение с выплатой по таблице выкупных сумм; в первый год сумма может быть нулевой.' },
    { title: '«Во вкладе сейчас выгоднее»', text: 'Сравните сроки, график внесения денег, ликвидность и налоги на одинаковых условиях. НСЖ также включает страховое покрытие. Не сравнивайте 21% за весь срок со ставкой вклада за один год.' },
    { title: '«Что получат близкие?»', text: 'Выплата назначенному выгодоприобретателю зависит от страхового события и условий договора. Разберите отдельно смерть по любой причине и дополнительное покрытие внешнего события, включая исключения.' },
  ]},
];
export function createFocusCatalog(legacy: FocusProductData[]): FocusCatalogData {
  const products: FocusProduct[] = legacy.map(product => ({
    id: product.key, segments: ['mass'],
    title: product.key === 'pds' ? 'ПДС «Оптимальный»' : product.key === 'oms' ? 'ОМС «Золото»' : product.title,
    category: product.key === 'nsj' ? 'insurance' : product.key === 'pds' ? 'savings' : 'investments',
    description: product.description, logo: product.logo, audience: product.audience,
    benefits: product.arguments, sales: focusSales[product.key], facts: [],
    sections: [{ id: 'overview', title: product.positioning, entries: [{ title: 'О продукте', text: product.positioningText }] }],
    source: 'Описание из текущей базы портала. Подробные условия и материалы ещё не добавлены.',
  }));
  Object.assign(products.find(product => product.id === 'oms')!, omsGoldContent);
  const maximum = products.find(product => product.id === 'nsj')!;
  Object.assign(maximum, {
    description: 'Накопления на три года с ежегодными взносами, фиксированным доходом и страховой защитой.',
    audience: 'Клиент с целью на три года, устойчивым бюджетом для ежегодных взносов и отдельным резервом на повседневные расходы.',
    benefits: [
      { title: 'Накопить на цель', description: 'Три ежегодных взноса помогают сформировать капитал к выбранной дате.' },
      { title: 'Зафиксировать доход', description: '21% от каждого взноса за весь срок. Доход и взносы выплачиваются в конце программы.' },
      { title: 'Предусмотреть защиту', description: 'Страховое покрытие, назначение выгодоприобретателя и медицинский сервис.' },
    ],
    facts: [{ label: 'Срок программы', value: '3 года' }, { label: 'Ежегодный взнос', value: 'от 30 000 ₽' }, { label: 'Доход за весь срок', value: '21% от взносов' }, { label: 'Возраст застрахованного', value: '18–72 года' }],
    sections: maximumSections, hasExample: true,
    materials: [
      { title: 'Брошюра · как работает программа', href: material0 },
      { title: 'Брошюра · условия и покрытие', href: material1 },
      { title: 'Презентация · преимущества и параметры', href: material2 },
      { title: 'Презентация · условия и сценарии', href: material3 },
      { title: 'Презентация · защита и медицинский сервис', href: material4 },
      { title: 'Презентация · налоги и ограничения', href: material5 },
      { title: 'Презентация · после покупки', href: material6 },
    ],
    source: 'По предоставленным презентации и брошюре «Максимум». Льготный период 14 дней уточнён владельцем продукта. Примеры — до НДФЛ.',
  });
  products.push({ id: 'nsj-plus', segments: ['mass'], title: 'НСЖ «Максимум плюс»', category: 'insurance', description: 'Отдельный продукт накопительного страхования жизни.', audience: 'Профиль клиента будет добавлен вместе с условиями продукта.', benefits: [], sales: focusSales['nsj-plus'], facts: [], sections: [], source: 'Название подтверждено. Условия и материалы ожидаются; параметры «Максимума» здесь не применяются.' },
    { id: 'autofollow', segments: ['mass'], title: 'Стратегии автоследования', category: 'investments', description: 'Инвестиционные стратегии с автоматическим следованием сделкам.', audience: 'Подбор зависит от выбранной стратегии и профиля клиента.', benefits: [], sales: focusSales.autofollow, facts: [{ label: 'Валюта учёта', value: 'Рубли' }, { label: 'Риск по реестру', value: '4 из 5' }], sections: [{ id: 'accounting', title: 'Как учитываются продажи', entries: [{ title: 'Что входит в фокусные продукты', text: 'По предоставленному реестру: чистый приток и подключения / отключения. Учитываются заводы и выводы средств, а также АУМ при смене тарифа.' }, { title: 'Дата учёта', text: 'По дате пополнения, вывода или смены тарифа: Т−1 при подключении, Т−0 при отключении.' }] }], source: 'Реестр фокусных продуктов, сентябрь 2026. Условия конкретных стратегий ещё не добавлены.' });
  const changes: FocusCatalogPeriod['changes'] = {
    added: [
      'ПСЖ «Чистый процент» на 2 и 3 года',
      'НСЖ «Максимум» и «Максимум плюс»',
      'Выпуск субординированных облигаций Альфа-Банка',
    ],
    removed: ['ЦФА Альфа-Банка'],
  };
  return {
    period: focusPeriod,
    products,
    changes,
    periods: [
      { period: focusPeriod, changes, productIds: products.map(product => product.id) },
      {
        period: augustFocusPeriod,
        changes: {
          added: [],
          removed: [],
          changed: [
            'Защищённый капитал на 3 года',
            'Фиксированный доход 3+12',
            'Защищённый капитал на 5 лет',
          ],
        },
        products: [
          {
            id: 'capital-protected-3y',
            title: 'Защищённый капитал на 3 года',
            category: 'insurance',
            label: 'ЗК',
            description: 'Программа страхования жизни с единовременным взносом, защитой капитала и выплатой по окончании трёхлетнего срока.',
            sales: { actual: 327_460, plan: 485_000 },
            sourceUrl: 'https://base.garant.ru/349071401/',
          },
          {
            id: 'fixed-income-3-12',
            title: 'Фиксированный доход 3+12',
            category: 'insurance',
            label: 'ФД',
            description: 'FortKnox с первым периодом на три месяца и возможностью продолжить программу ещё на 12 месяцев с фиксированными условиями дохода.',
            sales: { actual: 491_875, plan: 632_000 },
            sourceUrl: 'https://www.sravni.ru/strakhovaja-kompanija/alfastrahovanie-jizn/otzyvy/1086541/',
          },
          {
            id: 'capital-protected-5y',
            title: 'Защищённый капитал на 5 лет',
            category: 'insurance',
            label: 'ЗК',
            description: 'Накопительное страхование жизни с единовременным взносом, фиксированным доходом и выплатой в конце пятилетнего срока.',
            sales: { actual: 568_430, plan: 745_000 },
            sourceUrl: 'https://lp103.aslife.ru/',
          },
        ],
      },
    ],
  };
}
