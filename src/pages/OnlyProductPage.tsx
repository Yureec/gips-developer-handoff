import { useState } from 'react';
import { Button } from '@alfalab/core-components/button';
import { BankMIcon } from '@alfalab/icons-glyph/BankMIcon';

import { PageBack, PageHero, StatusTag } from '../components/PagePrimitives';
import { Heading } from '../components/Typography';
import type { OnlyProductData } from '../data/provider';

interface OnlyProductPageProps {
  data: OnlyProductData;
  onBack: (target: OnlyProductData['backTarget']) => void;
}

export function OnlyProductPage({ data, onBack }: OnlyProductPageProps) {
  const [message, setMessage] = useState('');

  return (
    <div className="section-page only-product-page">
      {data.backTarget === 'news' && <PageBack label="К новостям Only" onClick={() => onBack('news')} />}

      <PageHero
        description={data.description}
        icon={<BankMIcon />}
        tags={
          <>
            <StatusTag tone="violet">Only</StatusTag>
            <StatusTag>{data.kicker}</StatusTag>
          </>
        }
        title={data.title}
        tone={data.heroTone === 'dark' ? 'violet' : 'neutral'}
      >
        <div className={`metric-grid metric-grid--${data.stats.length === 3 ? 'three' : 'four'}`}>
          {data.stats.map((stat) => (
            <div className="metric-card" key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              {stat.detail ? <small>{stat.detail}</small> : null}
            </div>
          ))}
        </div>
      </PageHero>

      <div className="only-product-grid">
        {data.blocks.map((block) => (
          <section className={`section-card only-product-block only-product-block--span-${block.span}`} key={block.title}>
            <Heading level={2} variant="card">{block.title}</Heading>
            {block.subtitle ? <p className="only-product-block__subtitle">{block.subtitle}</p> : null}
            {block.items ? (
              <div className="only-compact-list">
                {block.items.map((item, index) => (
                  <div className="only-compact-item" key={`${item.title}-${index}`}>
                    <span className="only-compact-item__mark" aria-hidden="true">{item.mark}</span>
                    <p>
                      <strong>{item.title}</strong>
                      {item.description ? <span>{item.description}</span> : null}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
            {block.paragraphs ? (
              <div className="only-copy-stack">
                {block.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            ) : null}
          </section>
        ))}
      </div>

      {data.salesScript ? (
        <section className="section-card only-product-script">
          <Heading level={2} variant="card">Скрипт продаж</Heading>
          <div className="only-copy-stack">
            {data.salesScript.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          {data.actions ? (
            <div className="only-product-actions">
              {data.actions.map((action) => (
                <Button
                  key={action.label}
                  size={40}
                  view={action.primary ? 'primary' : 'secondary'}
                  onClick={() => setMessage(action.message)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          ) : null}
          <p className="sr-only" role="status">{message}</p>
          {message ? <div className="action-feedback" aria-hidden="true">{message}</div> : null}
        </section>
      ) : null}
    </div>
  );
}
