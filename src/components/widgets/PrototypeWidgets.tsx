import { Button } from '@alfalab/core-components/button';
import { TooltipDesktop } from '@alfalab/core-components/tooltip/desktop';
import { ArrowRightMIcon } from '@alfalab/icons-glyph/ArrowRightMIcon';
import { InformationCircleLineMIcon } from '@alfalab/icons-glyph/InformationCircleLineMIcon';

import type { DashboardData } from '../../data/provider';
import { EducationDailyCard as DailyInvest } from '../learning/EducationWorkspace';
import { MessengerLogo } from '../MessengerLogo';

interface PrototypeWidgetsProps {
  data: DashboardData;
}

function InvestNewsWidget({ channels }: { channels: DashboardData['investNewsChannels'] }) {
  return (
    <article className="widget widget--invest-news" aria-labelledby="invest-news-title">
      <h2 className="home-widget-eyebrow" id="invest-news-title">Invest News</h2>
      <p className="invest-news__intro">Анонсы по продуктам, скрипты продаж и результаты конкурсов.</p>
      <ul className="invest-news__list">
        {channels.map((channel) => (
          <li key={channel.id}>
            <a
              className="invest-news__link"
              href={channel.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${channel.platform}: ${channel.title}, ${channel.kind}. Открыть в новой вкладке`}
            >
              <span className={`messenger-logo is-${channel.messenger}`} aria-hidden="true">
                <MessengerLogo messenger={channel.messenger} />
              </span>
              <span className="invest-news__copy">
                <strong>{channel.title}</strong>
                <small>{channel.platform} · {channel.kind}</small>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </article>
  );
}

interface MarketMacroProps {
  href: string;
  id: string;
  info: string;
  infoLabel: string;
  label: string;
  suffix?: string;
  value: string;
}

function MarketMacro({ href, id, info, infoLabel, label, suffix, value }: MarketMacroProps) {
  return (
    <div className="market-macro">
      <a className="market-macro__link" href={href} target="_blank" rel="noopener noreferrer">
        <span>{label}</span>
        <strong>{value}{suffix ? <small>{suffix}</small> : null}</strong>
      </a>
      <TooltipDesktop
        content={info}
        dataTestId={`market-${id}-info`}
        fallbackPlacements={['bottom-end', 'top']}
        getPortalContainer={() => document.body}
        offset={[0, 8]}
        position="top-end"
        targetClassName="market-macro__tooltip-target"
        targetTag="span"
        trigger="click"
        view="tooltip"
        zIndex={1000}
      >
        <Button className="market-macro__info" aria-label={infoLabel} size={32} view="transparent">
          <InformationCircleLineMIcon aria-hidden="true" />
        </Button>
      </TooltipDesktop>
    </div>
  );
}

function MarketTodayWidget({ market }: { market: DashboardData['market'] }) {
  return (
    <article className="widget widget--market" aria-labelledby="market-today-title">
      <div className="home-widget-heading">
        <h2 className="home-widget-eyebrow" id="market-today-title">Рынок сегодня</h2>
        <span className="market-date">{market.asOf}</span>
      </div>
      <div className="market-macros">
        <MarketMacro
          href="https://cbr.ru/hd_base/KeyRate/"
          id="key-rate"
          info={`Следующее заседание Совета директоров Банка России — ${market.nextMeeting} года.`}
          infoLabel={`Информация о ключевой ставке: следующее заседание ${market.nextMeeting} года`}
          label="Ключевая ставка"
          value={market.keyRate}
        />
        <MarketMacro
          href="https://cbr.ru/hd_base/infl/"
          id="inflation"
          info={`Цель Банка России по инфляции — ${market.inflationTarget}.`}
          infoLabel={`Информация об инфляции: цель Банка России ${market.inflationTarget}`}
          label="Инфляция"
          suffix="г/г"
          value={market.inflation}
        />
      </div>
      <dl className="market-quotes" aria-label={`Рыночные показатели на ${market.asOf}`}>
        {market.quotes.map((quote) => (
          <div className="market-quote" key={quote.id}>
            <dt>{quote.label}</dt>
            <dd>{quote.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

export function PrototypeWidgets({ data }: PrototypeWidgetsProps) {
  return (
    <>
      <DailyInvest dashboard />
      <InvestNewsWidget channels={data.investNewsChannels} />

      <article className="widget widget--investor-feed" aria-labelledby="investor-feed-title">
        <div className="investor-feed__heading">
          <div>
            <h2 className="home-widget-eyebrow" id="investor-feed-title">Аналитика рынка</h2>
            <p className="investor-feed__intro">Экономика, инвестиции, идеи</p>
          </div>
          <Button
            className="widget-header__action"
            rightAddons={<ArrowRightMIcon aria-hidden="true" />}
            size={32}
            view="text"
            href="https://alfabank.ru/alfa-investor/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Все материалы
          </Button>
        </div>
        <div className="investor-news-grid">
          {data.investorNews.map((article, index) => (
            <a
              className={`investor-news-card${index === 0 ? ' investor-news-card--featured' : ''}`}
              href={article.href}
              key={article.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${article.title}. Открыть на портале Альфа-Инвестора в новой вкладке`}
            >
              <img src={article.image} alt={article.imageAlt} />
              <div className="investor-news-card__copy">
                <span>{article.category}</span>
                <h3>{article.title}</h3>
              </div>
            </a>
          ))}
        </div>
      </article>

      <MarketTodayWidget market={data.market} />
    </>
  );
}
