import { type FormEvent, useMemo, useRef, useState } from 'react';
import { Button } from '@alfalab/core-components/button';
import { IconButton } from '@alfalab/core-components/icon-button';
import { Input } from '@alfalab/core-components/input';
import { Modal } from '@alfalab/core-components/modal';
import { Tag } from '@alfalab/core-components/tag';
import { CrossMediumMIcon } from '@alfalab/icons-glyph/CrossMediumMIcon';
import { DocumentMIcon } from '@alfalab/icons-glyph/DocumentMIcon';
import { MagnifierMIcon } from '@alfalab/icons-glyph/MagnifierMIcon';

import type { SectionId } from '../domain/navigation';

interface GlobalSearchProps {
  value: string;
  onChange: (value: string) => void;
  onNavigate: (section: SectionId) => void;
}

const quickQueries = ['калькулятор КД', 'отчёт Smart-Link', 'Weekly Invest News', 'ПДС Фреш', 'Альфа-Капитал'];

const portalItems: Array<{ title: string; description: string; section: SectionId }> = [
  { title: 'Как работают ачивки', description: 'Ачивки и конкурсы', section: 'games' },
  { title: 'Как рассчитывается КД', description: 'Мотивация и премия', section: 'profile' },
  { title: 'Фокусные продукты', description: 'Продукты месяца и результаты продаж', section: 'focus' },
  { title: 'Обучение', description: 'Курсы, материалы и текущий прогресс', section: 'learning' },
  { title: 'Калькулятор КД', description: 'Расчёт клиентской доходности', section: 'profile' },
  { title: 'Отчёт Smart-Link', description: 'Отчётность по клиентским коммуникациям', section: 'profile' },
  { title: 'Weekly Invest News', description: 'Еженедельные новости для разговора с клиентом', section: 'learning' },
  { title: 'ПДС Фреш', description: 'Материалы по продукту', section: 'focus' },
  { title: 'Альфа-Капитал', description: 'Материалы управляющей компании', section: 'learning' },
];

export function GlobalSearch({ value, onChange, onNavigate }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const normalizedQuery = value.trim().toLocaleLowerCase('ru');
  const results = useMemo(() => normalizedQuery
    ? portalItems.filter(item => `${item.title} ${item.description}`.toLocaleLowerCase('ru').includes(normalizedQuery))
    : portalItems.slice(0, 4), [normalizedQuery]);

  const close = () => setOpen(false);
  const navigate = (section: SectionId) => {
    close();
    onNavigate(section);
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (results[0]) navigate(results[0].section);
  };

  return <>
    <IconButton
      aria-label="Поиск по инвестпорталу"
      className="global-search-trigger"
      icon={<MagnifierMIcon aria-hidden="true" focusable="false" />}
      size={40}
      type="button"
      view="secondary"
      onClick={() => setOpen(true)}
    />
    <Modal
      className="global-search-modal"
      componentRef={modalRef}
      open={open}
      scrollLock
      size={800}
      wrapperProps={{ 'aria-label': 'Поиск по инвестпорталу' }}
      onClose={close}
      onMount={() => {
        modalRef.current?.querySelectorAll('svg[role="img"]').forEach(icon => icon.setAttribute('aria-hidden', 'true'));
        inputRef.current?.focus();
      }}
    >
      <Modal.Content>
        <form className="global-search-dialog" role="search" onSubmit={submit}>
          <IconButton
            aria-label="Закрыть поиск"
            className="global-search-dialog__close"
            icon={<CrossMediumMIcon aria-hidden="true" focusable="false" />}
            size={32}
            type="button"
            view="secondary"
            onClick={close}
          />
          <label className="sr-only" htmlFor="global-search-input">Найти сотрудника, сервис или ответ на вопрос</label>
          <Input
            block
            clear="auto"
            id="global-search-input"
            inputMode="search"
            leftAddons={<MagnifierMIcon aria-hidden="true" />}
            placeholder="Найти сотрудника, сервис или ответ на вопрос"
            ref={inputRef}
            size={56}
            type="text"
            value={value}
            onChange={(_, payload) => onChange(payload.value)}
          />
          <div className="global-search-dialog__tags" aria-label="Популярные запросы">
            {quickQueries.map(query => <Tag key={query} shape="rounded" size={32} view="muted" onClick={() => onChange(query)}>{query}</Tag>)}
          </div>
          <section className="global-search-results" aria-labelledby="global-search-results-title">
            <h2 id="global-search-results-title">{normalizedQuery ? 'Результаты' : 'Рекомендуемые статьи'}</h2>
            <div className="global-search-results__list">
              {results.map(item => <Button
                block
                className="global-search-result"
                key={item.title}
                leftAddons={<span className="global-search-result__icon"><DocumentMIcon aria-hidden="true" /></span>}
                size={64}
                view="transparent"
                onClick={() => navigate(item.section)}
              >
                <span><strong>{item.title}</strong><small>{item.description}</small></span>
              </Button>)}
              {results.length === 0 ? <p className="global-search-results__empty">Ничего не найдено. Измените запрос.</p> : null}
            </div>
          </section>
          <Button
            block
            disabled={!results.length}
            leftAddons={<MagnifierMIcon aria-hidden="true" />}
            size={48}
            type="submit"
            view="secondary"
          >
            Искать по инвестпорталу
          </Button>
        </form>
      </Modal.Content>
    </Modal>
  </>;
}
