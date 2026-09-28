import { useMemo, useState } from 'react';
import { Button } from '@alfalab/core-components/button';
import { IconButton } from '@alfalab/core-components/icon-button';
import { CatalogFilter } from '../components/CatalogFilter';
import { ArrowRightMIcon } from '@alfalab/icons-glyph/ArrowRightMIcon';
import { ChevronLeftMIcon } from '@alfalab/icons-glyph/ChevronLeftMIcon';
import { ChevronDownMIcon } from '@alfalab/icons-glyph/ChevronDownMIcon';
import { ChevronRightMIcon } from '@alfalab/icons-glyph/ChevronRightMIcon';
import { ProductMark, StatusTag } from '../components/PagePrimitives';
import { CompactSearch } from '../components/CompactSearch';
import { SalesKpiWidget } from '../components/widgets/SalesKpiWidget';
import { focusCategoryLabels, type FocusCatalogData, type FocusCategory, type FocusPeriodProduct, type FocusProduct, type FocusProductId } from '../data/focusCatalog';
import { percentage, rubles, salesProgress } from '../domain/focus';

function formatPeriod(month: string) {
  const label = new Date(`${month}-01T12:00:00Z`).toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).replace(' г.', '');
  return label.charAt(0).toLocaleUpperCase('ru-RU') + label.slice(1);
}

export function FocusCatalogPage({ data, onOpenProduct }: { data: FocusCatalogData; onOpenProduct: (id: FocusProductId) => void }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FocusCategory | 'all'>('all');
  const [changesExpanded, setChangesExpanded] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(data.period.month);
  const selectedPeriodIndex = data.periods.findIndex(item => item.period.month === selectedMonth);
  const selectedSnapshot = data.periods[selectedPeriodIndex] ?? data.periods[0];
  const periodProducts = useMemo<Array<FocusProduct | FocusPeriodProduct>>(() => {
    if (selectedSnapshot.productIds) {
      const selectedIds = new Set(selectedSnapshot.productIds);
      return data.products.filter(product => selectedIds.has(product.id));
    }
    return selectedSnapshot.products ?? [];
  }, [data.products, selectedSnapshot]);
  const products = useMemo(() => periodProducts.filter(product => {
    return (category === 'all' || product.category === category) && `${product.title} ${product.description}`.toLocaleLowerCase('ru').includes(query.trim().toLocaleLowerCase('ru'));
  }), [periodProducts, category, query]);
  const covered = periodProducts.filter(product => product.sales.actual !== null && product.sales.plan !== null);
  const total = covered.length ? covered.reduce((sum, product) => ({ actual: sum.actual + product.sales.actual!, plan: sum.plan + product.sales.plan! }), { actual: 0, plan: 0 }) : { actual: null, plan: null };
  const days = salesProgress(total, selectedSnapshot.period);
  const isClosedPeriod = days.total > 0 && days.elapsed === days.total;
  const displayedProgress = isClosedPeriod ? days.completion : days.runRate;
  const periodLabel = formatPeriod(selectedSnapshot.period.month);
  const changesPanelId = `focus-changes-${selectedSnapshot.period.month}`;
  const asOf = selectedSnapshot.period.asOf.split('-').reverse().join('.');
  const changesCount = selectedSnapshot.changes.added.length + selectedSnapshot.changes.removed.length + (selectedSnapshot.changes.changed?.length ?? 0);
  const availableCategories = Object.entries(focusCategoryLabels).filter(([id]) => periodProducts.some(product => product.category === id));
  const categoryOptions = [['all', 'Все'], ...availableCategories];
  const selectPeriod = (index: number) => {
    const nextPeriod = data.periods[index];
    if (!nextPeriod) return;
    setSelectedMonth(nextPeriod.period.month);
    setChangesExpanded(false);
    setQuery('');
    setCategory('all');
  };
  return <div className="section-page focus-catalog-page">
    <h1 className="sr-only">Фокусные продукты</h1>
    <div className="focus-context-bar">
      <div className="focus-period-slider" aria-label="Период списка фокусных продуктов">
        <IconButton aria-label="Предыдущий месяц" disabled={selectedPeriodIndex >= data.periods.length - 1} icon={<ChevronLeftMIcon aria-hidden="true" focusable="false" />} size={32} view="transparent" onClick={() => selectPeriod(selectedPeriodIndex + 1)} />
        <span aria-live="polite">{periodLabel}</span>
        <IconButton aria-label="Следующий месяц" disabled={selectedPeriodIndex <= 0} icon={<ChevronRightMIcon aria-hidden="true" focusable="false" />} size={32} view="transparent" onClick={() => selectPeriod(selectedPeriodIndex - 1)} />
      </div>
      <CatalogFilter label="Категория продукта" compact={availableCategories.length < 3} value={category} onChange={id => setCategory(id as FocusCategory | 'all')} options={categoryOptions.map(([id, title]) => ({ id, title }))} />
      <CompactSearch direction="right" label="Найти фокусный продукт" placeholder="Название или ключевое слово" size={32} value={query} onChange={setQuery} />
      <section className="focus-changes" aria-label={`Изменения за ${periodLabel.toLocaleLowerCase('ru-RU')}`}>
        <Button
          aria-controls={changesPanelId}
          aria-expanded={changesExpanded}
          block
          className="focus-changes__control"
          rightAddons={<ChevronDownMIcon aria-hidden="true" className={`focus-changes__chevron${changesExpanded ? ' is-expanded' : ''}`} />}
          size={32}
          type="button"
          view="transparent"
          onClick={() => setChangesExpanded(expanded => !expanded)}
        >
          Что изменилось · {changesCount}
        </Button>
        <div className={`focus-changes__content${changesExpanded ? ' is-expanded' : ''}`} id={changesPanelId} aria-hidden={!changesExpanded}>
          {selectedSnapshot.changes.added.length > 0 ? <div>
            <span>Добавили</span>
            <ul>{selectedSnapshot.changes.added.map(item => <li key={item}>{item}</li>)}</ul>
          </div> : null}
          {selectedSnapshot.changes.removed.length > 0 ? <div>
            <span>Убрали</span>
            <ul>{selectedSnapshot.changes.removed.map(item => <li key={item}>{item}</li>)}</ul>
          </div> : null}
          {selectedSnapshot.changes.changed?.length ? <div>
            <span>Изменения в списке</span>
            <ul>{selectedSnapshot.changes.changed.map(item => <li key={item}>{item}</li>)}</ul>
          </div>
            : null}
        </div>
      </section>
    </div>
    <section className="focus-catalog-section" aria-label="Каталог фокусных продуктов">
      <div className="focus-product-grid">
        <SalesKpiWidget
          actual={rubles(total.actual)}
          className="focus-summary"
          footer={<span className="focus-summary__date">{isClosedPeriod ? `Период закрыт · рабочих дней: ${days.total}` : `Данные на ${asOf} · ${days.elapsed} из ${days.total} рабочих дней`}</span>}
          heading="Мои продажи"
          hint={<>{isClosedPeriod ? 'Итог' : 'Учтены показатели'} по {covered.length} из {periodProducts.length} продуктов.</>}
          hintTitle={isClosedPeriod
            ? days.completion === null
              ? 'Итог выполнения КПЭ недоступен.'
              : days.completion >= 100
                ? `КПЭ выполнен на ${percentage(days.completion)}.`
                : `КПЭ не выполнен — отставание ${percentage(100 - days.completion)}.`
            : displayedProgress !== null && displayedProgress >= 100 ? 'Темп выше плана.' : 'Проверьте темп продаж.'}
          metricAriaLabel={isClosedPeriod ? 'Выполнение КПЭ' : undefined}
          metricLabel={isClosedPeriod ? 'КПЭ' : undefined}
          plan={rubles(total.plan)}
          progress={displayedProgress ?? 0}
          runRate={percentage(displayedProgress)}
        />
        {products.map(product => {
          const isCurrentProduct = 'segments' in product;
          const productProgress = salesProgress(product.sales, selectedSnapshot.period);
          const hasSales = product.sales.actual !== null && product.sales.plan !== null;
          const productStatus = isClosedPeriod ? productProgress.completion : productProgress.runRate;
          const closedResultTone = isClosedPeriod && productProgress.completion !== null
            ? productProgress.completion >= 100 ? ' focus-product-card__result--positive' : ' focus-product-card__result--negative'
            : '';
          return <article className={`widget focus-product-card${isCurrentProduct ? '' : ' focus-product-card--period'}`} key={product.id}>
            <StatusTag>{focusCategoryLabels[product.category]}</StatusTag>
            <div className="focus-product-card__top">
              {isCurrentProduct ? <a className="focus-product-link focus-product-link--logo" href={`?role=mass&section=focus&product=${product.id}`} aria-label={`Открыть ${product.title}`} onClick={event => { if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) { event.preventDefault(); onOpenProduct(product.id); } }}><ProductMark image={product.logo} label={product.id === 'autofollow' ? 'АС' : 'НСЖ'} /></a> : <ProductMark label={product.label} />}
              <div className="focus-product-card__heading-copy">
                <h3>{isCurrentProduct ? <a className="focus-product-link" href={`?role=mass&section=focus&product=${product.id}`} onClick={event => { if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) { event.preventDefault(); onOpenProduct(product.id); } }}>{product.title}</a> : product.title}</h3>
                <span className={`run-rate${productStatus !== null && productStatus < 100 ? ' run-rate--negative' : ''}${productStatus === null ? ' run-rate--muted' : ''}`}>{isClosedPeriod ? 'Выполнение' : 'RR'} {percentage(productStatus)}</span>
              </div>
            </div>
            <p className="focus-product-card__description">{product.description}</p>
            <div className={`focus-result focus-product-card__result${hasSales ? closedResultTone : ' focus-product-card__result--empty'}`}>
              <span>Факт за месяц</span>
              <div>
                <strong>{hasSales ? rubles(product.sales.actual) : 'Нет данных'}</strong>
                <small>{hasSales ? `из ${rubles(product.sales.plan)}` : 'План не задан'}</small>
              </div>
            </div>
            {isCurrentProduct ? <div className="widget-card-footer">
              <Button block view="secondary" size={40} rightAddons={<ArrowRightMIcon aria-hidden="true" />} onClick={() => onOpenProduct(product.id)} aria-label={`Изучить ${product.title}`}>Изучить продукт</Button>
            </div> : null}
          </article>;
        })}
      </div>
      {products.length === 0 && <div className="section-card focus-empty"><h3>Продукты не найдены</h3><p>Попробуйте другое название или сбросьте фильтры.</p><Button view="secondary" size={40} onClick={() => { setQuery(''); setCategory('all'); }}>Сбросить фильтры</Button></div>}
    </section>
  </div>;
}
