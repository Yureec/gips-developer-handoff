import { Button } from '@alfalab/core-components/button';

import { PageHero, SectionEyebrow, StatusTag } from '../components/PagePrimitives';
import type { ScenarioData } from '../data/provider';

export function ScenarioPage({ data, onAction }: {
  data: ScenarioData;
  onAction: (target: string) => void;
}) {
  return (
    <div className="section-page scenario-page">
      <PageHero
        icon={<span className="scenario-page__symbol">{data.icon}</span>}
        tags={data.badges.map((badge, index) => (
          <StatusTag key={badge} tone={index === 0 ? 'red' : 'neutral'}>{badge}</StatusTag>
        ))}
        title={data.title}
        description={data.subtitle}
      />

      <div className="scenario-layout">
        <section className="section-card scenario-steps" aria-labelledby="scenario-steps-title">
          <SectionEyebrow>Как это работает</SectionEyebrow>
          <h2 className="sr-only" id="scenario-steps-title">Как работает сценарий</h2>
          <ol>
            {data.steps.map(([title, description], index) => (
              <li key={`${title}-${index}`}>
                <span aria-hidden="true">{index + 1}</span>
                <p><strong>{title}</strong>{description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="section-card scenario-actions" aria-labelledby="scenario-actions-title">
          <SectionEyebrow>Действия</SectionEyebrow>
          <h2 className="sr-only" id="scenario-actions-title">Действия сценария</h2>
          <div>
            {data.actions.map(([label, target], index) => (
              <Button
                key={`${label}-${target}`}
                size={40}
                view={index === 0 ? 'primary' : 'secondary'}
                onClick={() => onAction(target)}
              >
                {label}
              </Button>
            ))}
          </div>
          <p>{data.note}</p>
        </section>
      </div>

      <section className="page-section" aria-labelledby="scenario-extra-title">
        <div className="page-section__heading"><h2 id="scenario-extra-title">Дополнительно</h2></div>
        <dl className="scenario-extra-grid">
          {data.extra.map(([title, description]) => (
            <div className="section-card" key={title}><dt>{title}</dt><dd>{description}</dd></div>
          ))}
        </dl>
      </section>
    </div>
  );
}
