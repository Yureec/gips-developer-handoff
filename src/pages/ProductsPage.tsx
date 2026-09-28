import { useMemo, useState } from 'react';
import { Button } from '@alfalab/core-components/button';
import { Input } from '@alfalab/core-components/input';
import { Segment, SegmentedControl } from '@alfalab/core-components/segmented-control';
import { ArrowRightMIcon } from '@alfalab/icons-glyph/ArrowRightMIcon';
import { BriefcaseMIcon } from '@alfalab/icons-glyph/BriefcaseMIcon';
import { MagnifierMIcon } from '@alfalab/icons-glyph/MagnifierMIcon';

import { PageHero, ProductMark, RewardChip, StatusTag } from '../components/PagePrimitives';
import type { ProductCatalogData, ProductFilter, ProductKey } from '../data/provider';

interface ProductsPageProps {
  data: ProductCatalogData;
  onOpenProduct: (key: ProductKey) => void;
}

const filters: Array<{ id: ProductFilter; label: string }> = [
  { id: 'all', label: 'Все' },
  { id: 'focus', label: 'Фокусные' },
  { id: 'insurance', label: 'Страхование' },
  { id: 'investments', label: 'Инвестиции' },
];

export function ProductsPage({ data, onOpenProduct }: ProductsPageProps) {
  const [filter, setFilter] = useState<ProductFilter>('all');
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');

  const products = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ru');

    return data.products.filter((product) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'focus' && product.focus) ||
        product.category === filter ||
        (filter === 'investments' && product.category === 'service');
      const matchesQuery =
        !normalizedQuery ||
        `${product.title} ${product.description}`.toLocaleLowerCase('ru').includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [data.products, filter, query]);

  return (
    <div className="section-page products-page">
      <PageHero
        icon={<BriefcaseMIcon />}
        tags={
          <>
            <StatusTag tone="red">Продукты</StatusTag>
            <StatusTag>Фокусные выделены</StatusTag>
          </>
        }
        title={data.title}
        description={data.description}
      />

      <section className="catalog-toolbar" aria-label="Фильтры каталога">
        <Input
          block
          aria-label="Поиск по продуктам"
          clear="auto"
          inputMode="search"
          leftAddons={<MagnifierMIcon aria-hidden="true" />}
          placeholder="Поиск по продуктам"
          size={48}
          type="text"
          value={query}
          onChange={(_, payload) => setQuery(payload.value)}
        />
        <SegmentedControl
          className="catalog-toolbar__filters"
          selectedId={filter}
          size={40}
          onChange={(selectedId) => setFilter(selectedId as ProductFilter)}
        >
          {filters.map((item) => (
            <Segment id={item.id} key={item.id} title={item.label} />
          ))}
        </SegmentedControl>
      </section>

      <p className="sr-only" role="status">
        Найдено продуктов: {products.length}
      </p>
      {message && (
        <div className="action-feedback" role="status">
          {message}
        </div>
      )}

      <section className="product-catalog-grid" aria-label="Инвестиционные продукты">
        {products.map((product) => (
          <article className={`product-catalog-card${product.focus ? ' is-focus' : ''}`} key={product.id}>
            <div className="product-catalog-card__top">
              <ProductMark image={product.logo} label={product.mark} />
              <StatusTag tone={product.focus ? 'red' : 'neutral'}>{product.categoryLabel}</StatusTag>
            </div>
            <h2>{product.title}</h2>
            <p>{product.description}</p>
            <div className="product-catalog-card__meta">
              {product.runRate ? (
                <>
                  <span>
                    RR <b className={`metric-${product.runRateTone}`}>{product.runRate}</b>
                  </span>
                  <RewardChip>{product.reward}</RewardChip>
                </>
              ) : (
                product.meta?.map((item) => <span key={item}>{item}</span>)
              )}
            </div>
            <Button
              block
              rightAddons={<ArrowRightMIcon aria-hidden="true" />}
              size={40}
              view="secondary"
              onClick={() => {
                if (product.key) onOpenProduct(product.key);
                else setMessage(product.actionMessage ?? '');
              }}
            >
              Открыть продукт
            </Button>
          </article>
        ))}
      </section>
    </div>
  );
}
