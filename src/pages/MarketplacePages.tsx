import { type FormEvent, useMemo } from 'react';
import { Button } from '@alfalab/core-components/button';
import { Segment, SegmentedControl } from '@alfalab/core-components/segmented-control';
import { CheckmarkMIcon } from '@alfalab/icons-glyph/CheckmarkMIcon';
import { InformationCircleMIcon } from '@alfalab/icons-glyph/InformationCircleMIcon';
import { StarMIcon } from '@alfalab/icons-glyph/StarMIcon';

import { MarketplaceVisual } from '../components/MarketplaceVisual';
import { PageBack, PageHero, SectionEyebrow, StatusTag } from '../components/PagePrimitives';
import { RewardChip } from '../components/RewardChip';
import type { MarketplaceData, MarketplaceFilter, MarketplaceItem } from '../data/provider';

const filters: Array<{ id: MarketplaceFilter; label: string }> = [
  { id: 'all', label: 'Все' },
  { id: 'merch', label: 'Мерч' },
  { id: 'stocks', label: 'Подарочные акции' },
  { id: 'orders', label: 'Мои заказы' },
];

function formatReward(value: number) {
  return `${value.toLocaleString('ru-RU')} I`;
}

export function MarketplacePage({ data, filter, onFilterChange, onOpenItem }: {
  data: MarketplaceData;
  filter: MarketplaceFilter;
  onFilterChange: (filter: MarketplaceFilter) => void;
  onOpenItem: (item: MarketplaceItem) => void;
}) {
  const items = filter === 'all' ? data.items : data.items.filter((item) => item.type === filter);

  return (
    <div className="section-page marketplace-page">
      <PageHero
        icon={<StarMIcon />}
        tags={
          <>
            <StatusTag tone="gold">{formatReward(data.balance)} доступно</StatusTag>
            <StatusTag tone="green">доставка в офис</StatusTag>
            <StatusTag tone="violet">акции в цель накопления</StatusTag>
          </>
        }
        title="Маркетплейс наград"
        description="Вы можете заказать мерч за инвест-коины или добавить дорогую подарочную акцию в цель накопления. Цены настроены под текущую механику лиг."
        tone="warm"
        action={
          <SegmentedControl
            aria-label="Фильтр наград"
            className="marketplace-filters"
            selectedId={filter}
            size={40}
            onChange={(selectedId) => onFilterChange(selectedId as MarketplaceFilter)}
          >
            {filters.map((item) => <Segment id={item.id} key={item.id} title={item.label} />)}
          </SegmentedControl>
        }
      />

      <dl className="metric-grid metric-grid--three marketplace-metrics">
        <div className="metric-card"><dt>Баланс</dt><dd>{formatReward(data.balance)}</dd><small>можно потратить сейчас</small></div>
        <div className="metric-card"><dt>Доступно сразу</dt><dd>7</dd><small>товаров мерча в пределах баланса</small></div>
        <div className="metric-card"><dt>Цель</dt><dd>Platinum</dd><small>открывает повышенные лимиты и акции</small></div>
      </dl>

      {filter === 'orders' ? <MarketplaceOrders balance={data.balance} /> : (
        <section aria-label="Каталог наград">
          <div className="marketplace-grid">
            {items.map((item) => {
              const enough = item.price <= data.balance;
              return (
                <article className="marketplace-card" key={item.id}>
                  <MarketplaceVisual item={item} />
                  <div className="marketplace-card__body">
                    <div className="marketplace-card__tags">
                      <StatusTag tone={item.type === 'merch' ? 'green' : 'violet'}>{item.badge}</StatusTag>
                      <span>{item.type === 'merch' ? 'мерч' : 'акция'}</span>
                    </div>
                    <h2>{item.title}</h2>
                    <p>{item.description}</p>
                    <div className="marketplace-card__footer">
                      <RewardChip>{formatReward(item.price)}</RewardChip>
                      <Button size={40} view={enough ? 'primary' : 'secondary'} onClick={() => onOpenItem(item)}>
                        {enough ? 'Заказать' : 'В цель'}
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <section className="page-section" aria-labelledby="marketplace-how-title">
        <div className="page-section__heading"><h2 id="marketplace-how-title">Как работает заказ</h2></div>
        <ol className="marketplace-how">
          <li className="section-card"><strong>1. Выбор</strong><p>Вы выбираете мерч или подарочную акцию, а цена сразу показывается в инвест-коинах.</p></li>
          <li className="section-card"><strong>2. Подтверждение</strong><p>Если баланса хватает, заказ отправляется в обработку. Если нет — награда добавляется в цель накопления.</p></li>
          <li className="section-card"><strong>3. Получение</strong><p>Мерч доставляется в офис, а подарочные акции проходят отдельное подтверждение по правилам компании.</p></li>
        </ol>
      </section>
    </div>
  );
}

function MarketplaceOrders({ balance }: { balance: number }) {
  return (
    <section className="section-card marketplace-orders" aria-labelledby="marketplace-orders-title">
      <SectionEyebrow>Мои заказы</SectionEyebrow>
      <h2 className="sr-only" id="marketplace-orders-title">Мои заказы</h2>
      <dl className="metric-grid metric-grid--three">
        <div className="metric-card"><dt>В обработке</dt><dd>1</dd><small>Термостакан Рокстар · доставка 3–5 дней</small></div>
        <div className="metric-card"><dt>Доставлено</dt><dd>3</dd><small>за последние 2 месяца</small></div>
        <div className="metric-card"><dt>В цели</dt><dd>2</dd><small>NVIDIA и Яндекс · осталось накопить</small></div>
      </dl>
      <ul className="marketplace-order-list">
        <li><span className="marketplace-list-icon is-gold" aria-hidden="true"><CheckmarkMIcon /></span><p><strong>Термостакан Рокстар</strong><small>заказ создан, ожидает выдачи в офисе «Тверская»</small></p></li>
        <li><span className="marketplace-list-icon is-violet" aria-hidden="true"><StarMIcon /></span><p><strong>Подарочная акция NVIDIA</strong><small>цель накопления: {balance.toLocaleString('ru-RU')} I из 9 200 I</small></p></li>
      </ul>
    </section>
  );
}

export function MarketplaceOrderPage({ data, item, onBack, onConfirm }: {
  data: MarketplaceData;
  item: MarketplaceItem;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const enough = item.price <= data.balance;
  const steps = item.type === 'merch'
    ? [
        'Подтвердите заказ, инвест-коины резервируются до выдачи.',
        'Мерч комплектуется и доставляется в офис «Тверская».',
        'После получения статус появится в профиле и истории заказов.',
      ]
    : [
        'Подарочная акция добавляется в вашу цель накопления или отправляется на согласование.',
        'После подтверждения по правилам компании награда передаётся в инвестиционный контур.',
        'Вы видите статус в профиле и истории наград.',
      ];

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onConfirm();
  };

  return (
    <div className="section-page marketplace-order-page">
      <PageBack label="К маркетплейсу" onClick={onBack} />
      <div className="marketplace-order-layout">
        <MarketplaceVisual item={item} variant="detail" />
        <form className="marketplace-order-summary" onSubmit={submit}>
          <div className="page-tags">
            <StatusTag tone={item.type === 'merch' ? 'green' : 'violet'}>{item.type === 'merch' ? 'мерч' : 'подарочная акция'}</StatusTag>
            <StatusTag>{item.badge}</StatusTag>
          </div>
          <h1>{item.title}</h1>
          <p>{item.description}</p>
          <dl className="marketplace-order-price">
            <div><dt>Стоимость</dt><dd>{formatReward(item.price)}</dd></div>
            <div><dt>Ваш баланс</dt><dd>{formatReward(data.balance)}</dd></div>
          </dl>
          <ol className="marketplace-order-steps">
            {steps.map((step, index) => <li key={step}><span>{index + 1}</span>{step}</li>)}
          </ol>
          <div className="marketplace-order-actions">
            <Button size={48} type="submit" view="primary">
              {enough ? `Заказать за ${formatReward(item.price)}` : 'Добавить в цель'}
            </Button>
            <Button size={48} type="button" view="secondary" onClick={onBack}>Вернуться</Button>
          </div>
          <div className="page-note">
            <InformationCircleMIcon aria-hidden="true" />
            <p>{enough ? 'Баланса хватает: заказ можно отправить в обработку.' : 'Сейчас баланса не хватает: награду можно сохранить как цель накопления.'}</p>
          </div>
        </form>
      </div>
    </div>
  );
}

export function MarketplaceSuccessPage({ data, item, orderId, onBack, onOpenProfile }: {
  data: MarketplaceData;
  item: MarketplaceItem;
  orderId: string;
  onBack: () => void;
  onOpenProfile: () => void;
}) {
  const enough = item.price <= data.balance;
  const result = useMemo(() => ({
    title: enough ? 'Заказ оформлен' : 'Цель добавлена',
    text: enough
      ? `${item.title} отправлен в обработку. Инвест-коины будут зарезервированы после подтверждения.`
      : `${item.title} добавлен в цель накопления. Система покажет, сколько инвест-коинов осталось собрать.`,
    status: enough ? 'В обработке' : 'Цель накопления',
    date: item.type === 'merch' ? '3–5 рабочих дней' : 'после накопления и подтверждения',
  }), [enough, item]);

  return (
    <div className="section-page marketplace-success-page">
      <PageBack label="К маркетплейсу" onClick={onBack} />
      <section className="marketplace-success" aria-labelledby="marketplace-success-title">
        <span className="marketplace-success__icon" aria-hidden="true"><CheckmarkMIcon /></span>
        <div className="page-tags"><StatusTag tone="green">заказ создан</StatusTag><StatusTag>{orderId}</StatusTag></div>
        <h1 id="marketplace-success-title">{result.title}</h1>
        <p>{result.text}</p>
        <dl className="metric-grid metric-grid--three">
          <div className="metric-card"><dt>Статус</dt><dd>{result.status}</dd></div>
          <div className="metric-card"><dt>Доставка</dt><dd>Офис «Тверская»</dd></div>
          <div className="metric-card"><dt>Срок</dt><dd>{result.date}</dd></div>
        </dl>
        <div className="marketplace-success__actions">
          <Button size={48} view="primary" onClick={onBack}>Вернуться в маркетплейс</Button>
          <Button size={48} view="secondary" onClick={onOpenProfile}>Открыть профиль</Button>
        </div>
      </section>
    </div>
  );
}
