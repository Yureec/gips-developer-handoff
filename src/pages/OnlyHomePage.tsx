import { useState, type CSSProperties, type ReactNode } from 'react';
import { metricHref } from '../domain/metrics';
import { Button } from '@alfalab/core-components/button';
import { ArrowRightMIcon } from '@alfalab/icons-glyph/ArrowRightMIcon';

import { AccessibleProgressBar } from '../components/AccessibleProgressBar';
import { StatusTag } from '../components/PagePrimitives';
import { RoleHero, RoleTabs } from '../components/RolePrimitives';
import { Heading } from '../components/Typography';
import { CarouselPager } from '../components/widgets/CarouselPager';
import { ContestWidget } from '../components/widgets/ContestWidget';
import { MetricWidget } from '../components/widgets/MetricWidget';
import { WidgetHeader } from '../components/widgets/WidgetHeader';
import type { OnlyDashboardData, OnlyProductKey } from '../data/provider';
import type { SectionId } from '../domain/navigation';

interface OnlyHomePageProps {
  data: OnlyDashboardData;
  onNavigate: (section: SectionId) => void;
  onOpenProduct: (product: OnlyProductKey) => void;
}

export function OnlyHomePage({ data, onNavigate, onOpenProduct }: OnlyHomePageProps) {
  const [metricIndex, setMetricIndex] = useState(0);
  const [analyticsIndex, setAnalyticsIndex] = useState(0);
  const [message, setMessage] = useState('');
  const metric = data.observationMetrics[metricIndex];
  const analytics = data.analytics[analyticsIndex];

  return (
    <div className="only-home-page">
      <RoleHero
        action={(
          <div className="only-hero__actions">
            <span>{data.period}</span>
            <Button colors="inverted" size={40} view="secondary" href={metricHref('only')}>
              Открыть KPI
            </Button>
          </div>
        )}
        avatar={(
          <Button
            aria-label={`Открыть профиль ${data.employee.name}`}
            className="only-hero__avatar-button"
            size={64}
            view="transparent"
            onClick={() => onNavigate('profile')}
          >
            <img src={data.employee.image} alt="" />
          </Button>
        )}
        metrics={data.heroStats}
        subtitle={`${data.employee.role} · ${data.employee.office}`}
        tags={data.heroTags.map((tag) => ({ label: tag, tone: 'violet' as const }))}
        title={data.employee.name}
      />

      <div className="only-priority-grid">
        <ContestWidget
          columnSpan={1}
          contests={data.contests}
          itemLabel="Конкурс Only"
          onOpen={() => onNavigate('motivation')}
        />

        <article className="widget only-observation-card">
          <WidgetHeader action="Подробнее" onAction={() => onNavigate('reporting')}>
            Метрики наблюдения ЧП по клиентам 3-12 млн руб
          </WidgetHeader>
          <div className="only-metric-tabs">
            <RoleTabs
              compact
              ariaLabel="Переключатель метрик наблюдения"
              options={data.observationMetrics.map((item, index) => ({ id: String(index), label: item.label }))}
              value={String(metricIndex)}
              onChange={(value) => setMetricIndex(Number(value))}
            />
          </div>
          <div
            aria-label={metric.label}
            className={`only-observation-panel is-${metric.tone}`}
            id="only-observation-panel"
          >
            <div className="only-observation-panel__primary">
              <div className="only-progress-ring" style={{ '--progress': `${metric.progress * 3.6}deg` } as CSSProperties}>
                <span>{metric.progress}%</span>
              </div>
              <div>
                <span>{metric.plan}</span>
                <small>{metric.scope}</small>
                <strong>{metric.fact}</strong>
              </div>
            </div>
            <div className="only-observation-panel__note">
              <span aria-hidden="true">{metric.noteIcon}</span>
              <p><strong>{metric.noteTitle}</strong><small>{metric.note}</small></p>
            </div>
          </div>
          <CarouselPager
            activeIndex={metricIndex}
            count={data.observationMetrics.length}
            itemLabel="Метрика наблюдения"
            onChange={setMetricIndex}
          />
        </article>
      </div>

      <OnlySectionHeading
        title="Выполнение целей"
        description="Главные личные ориентиры Only: комиссионный доход, фокусные продукты, чистое привлечение и качество клиентской базы."
      />
      <section className="only-goal-grid" aria-label="Выполнение целей">
        {data.goals.map((goal) => (
          <MetricWidget key={goal.label} {...goal} />
        ))}
      </section>

      <OnlySectionHeading
        title="Драйверы квартала"
        description="Приоритеты квартала и продукты, которые сильнее всего влияют на ЧП и выполнение плана по ФП."
      />
      <section className="only-driver-grid" aria-label="Драйверы квартала">
        {data.drivers.map((driver) => (
          <article className={`widget only-driver-card is-${driver.tone}`} key={driver.title}>
            <WidgetHeader inverted={driver.tone === 'dark'}>{driver.title}</WidgetHeader>
            <div className="only-driver-card__rank"><span>Место в рейтинге по стране</span><b>{driver.rank}</b></div>
            <dl className="only-driver-card__totals">
              <div><dt>{driver.factLabel}</dt><dd>{driver.fact}</dd></div>
              <div><dt>{driver.planLabel}</dt><dd>{driver.plan}</dd></div>
            </dl>
            <AccessibleProgressBar label={`${driver.title}: выполнено ${driver.progress}%`} value={driver.progress} view={driver.tone === 'dark' ? 'link' : 'positive'} size={8} />
            <div className="only-driver-card__progress"><span>Выполнено {driver.progress}%</span><span>{driver.remainder}</span></div>
            <div className="only-driver-list">
              {driver.items.map((item) => (
                <button key={`${driver.title}-${item.rank}`} type="button" onClick={() => onOpenProduct(item.product)}>
                  <span>{item.rank}</span>
                  <p><strong>{item.title}</strong><small>{item.description}</small></p>
                  <b title="Смысл показателя уточняется">—</b>
                </button>
              ))}
            </div>
            <Button size={32} view="text" colors={driver.tone === 'dark' ? 'inverted' : undefined} href={metricHref('only', 'only-driver-coefficients')}>О показателях драйверов</Button>
          </article>
        ))}
      </section>

      <OnlySectionHeading
        action={<StatusTag tone="gold">Q3 2026</StatusTag>}
        title="ТОП-10 сделок по стране"
        description="Крупнейшие инвестиционные сделки за текущий квартал."
      />
      <section className="section-card only-deals-card" aria-label="ТОП-10 сделок по стране">
        <div className="only-deals-scroll">
          <table className="only-deals-table">
            <thead><tr><th>Место</th><th>Премиум-менеджер</th><th>Дивизион</th><th>Продукт</th><th>Объём</th><th>КД</th><th>Дата</th></tr></thead>
            <tbody>
              {data.deals.map((deal) => (
                <tr className={deal.current ? 'is-current' : undefined} key={deal.rank}>
                  <td><span>{deal.rank}</span></td>
                  <td><strong>{deal.manager}</strong></td>
                  <td>{deal.division}</td>
                  <td>
                    {deal.productKey ? (
                      <Button size={32} view="text" onClick={() => onOpenProduct(deal.productKey!)}>{deal.product}</Button>
                    ) : deal.product}
                  </td>
                  <td><strong>{deal.volume}</strong></td><td>{deal.income}</td><td>{deal.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <OnlySectionHeading
        action={
          <Button
            Component="a"
            href="https://example.org/crm"
            rel="noopener noreferrer"
            size={32}
            target="_blank"
            view="text"
          >
            Полный полугодовой рейтинг
          </Button>
        }
        title="Номинации для признания Only Award за 6 месяцев"
        description="Три наиболее релевантные номинации, в которых вы ближе всего к первому месту."
      />
      <section className="only-nomination-grid" aria-label="Номинации Only Award">
        {data.nominations.map((nomination) => {
          const content = (
            <>
              <span aria-hidden="true">{nomination.icon}</span>
              <h3>{nomination.title}</h3>
              <strong>{nomination.place}</strong>
              <p>{nomination.hint}</p>
            </>
          );
          return nomination.href ? (
            <a className="widget only-nomination-card is-leader" href={nomination.href} key={nomination.title} rel="noopener noreferrer" target="_blank">{content}</a>
          ) : (
            <article className="widget only-nomination-card" key={nomination.title}>{content}</article>
          );
        })}
      </section>

      <section className="only-tools-grid" aria-label="Инструменты Only">
        <article className="widget">
          <WidgetHeader>Важные новости</WidgetHeader>
          <p className="only-card-intro">Изменения, которые нужно обязательно учесть</p>
          <div className="only-compact-list">
            {data.importantNews.map((item, index) => (
              <button key={item.title} type="button" onClick={() => onNavigate('news')}>
                <span className="only-compact-item__mark">{index + 1}</span>
                <p><strong>{item.title}</strong><small>{item.description}</small></p>
                <StatusTag tone={item.tone === 'red' ? 'red' : 'neutral'}>{item.badge}</StatusTag>
              </button>
            ))}
          </div>
        </article>
        <article className="widget">
          <WidgetHeader>Ресурсы Only</WidgetHeader>
          <div className="only-compact-list">
            {data.resources.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => item.action === 'news' ? onNavigate('news') : setMessage(item.message ?? '')}
              >
                <span className="only-compact-item__mark">{item.mark}</span>
                <p><strong>{item.title}</strong><small>{item.description}</small></p>
                <StatusTag tone="violet">{item.badge}</StatusTag>
              </button>
            ))}
          </div>
        </article>
        <article className="widget">
          <WidgetHeader>Полезные сообщества</WidgetHeader>
          <div className="only-compact-list only-community-list">
            {data.communities.map((item) => (
              <div key={item.title}>
                <span className="only-compact-item__mark">{item.mark}</span>
                <strong>{item.title}</strong>
                <Button size={32} view="text" onClick={() => setMessage(item.message)}>Открыть</Button>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="only-bottom-grid" aria-label="Аналитика и сопровождение">
        <article
          className="widget only-analytics-card"
          style={{ '--analytics-image': `url(${analytics.image})` } as CSSProperties}
        >
          <div aria-live="polite">
            <WidgetHeader inverted>Аналитика · Альфа-Инвестор</WidgetHeader>
            <h2>{analytics.title}</h2>
            <p>{analytics.description}</p>
            <Button
              Component="a"
              colors="inverted"
              href={analytics.href}
              rel="noopener noreferrer"
              rightAddons={<ArrowRightMIcon aria-hidden="true" />}
              size={40}
              target="_blank"
              view="secondary"
            >
              Подробнее
            </Button>
          </div>
          <CarouselPager activeIndex={analyticsIndex} count={data.analytics.length} inverted itemLabel="Новость" onChange={setAnalyticsIndex} />
        </article>
        <article className="widget only-online-card">
          <div>
            <WidgetHeader>Обращение на OnlineInvestments</WidgetHeader>
            <p>Задайте вопрос по инвестиционным продуктам, сопровождению сделок и нестандартным клиентским кейсам</p>
          </div>
          <Button size={40} view="primary" onClick={() => setMessage('Форма обращения на OnlineInvestments открыта.')}>
            Создать обращение
          </Button>
        </article>
      </section>

      <p className="sr-only" role="status">{message}</p>
      {message ? <div className="action-feedback" aria-hidden="true">{message}</div> : null}
    </div>
  );
}

function OnlySectionHeading({
  action,
  description,
  title,
}: {
  action?: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <div className="only-section-heading">
      <div><Heading level={2} variant="section">{title}</Heading><p>{description}</p></div>
      {action}
    </div>
  );
}
