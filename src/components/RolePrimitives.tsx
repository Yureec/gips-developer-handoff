import type { ReactNode } from 'react';
import { Segment, SegmentedControl } from '@alfalab/core-components/segmented-control';

import { StatusTag } from './PagePrimitives';
import { AccessibleProgressBar } from './AccessibleProgressBar';
import { AlfaSelect } from './AlfaSelect';
import { WidgetHeader } from './widgets/WidgetHeader';
import { Heading, Metadata, MetricValue } from './Typography';

interface RoleHeroProps {
  image?: string;
  avatar?: ReactNode;
  title: string;
  subtitle: string;
  tags: Array<{ label: string; tone?: 'neutral' | 'red' | 'gold' | 'green' | 'violet' }>;
  metrics?: Array<{ label: string; value: string; detail?: string }>;
  action?: ReactNode;
}

export function RoleHero({ image, avatar, title, subtitle, tags, metrics = [], action }: RoleHeroProps) {
  return (
    <section className="role-hero" aria-labelledby="role-page-title">
      <div className="role-hero__top">
        <div className="role-hero__identity">
          {avatar ?? (image ? <img src={image} alt="" /> : null)}
          <div>
            <div className="role-hero__tags">
              {tags.map((tag) => <StatusTag key={tag.label} tone={tag.tone}>{tag.label}</StatusTag>)}
            </div>
            <Heading level={1} variant="page" id="role-page-title">{title}</Heading>
            <p>{subtitle}</p>
          </div>
        </div>
        {action}
      </div>
      {metrics.length ? (
        <dl className="role-hero__metrics">
          {metrics.map((metric) => (
            <div key={metric.label}>
              <Metadata as="dt" variant="label">{metric.label}</Metadata>
              <dd>
                <MetricValue as="span" variant="inline">{metric.value}</MetricValue>
                {metric.detail ? <Metadata as="small" variant="label">{metric.detail}</Metadata> : null}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}

export interface RoleSectionProps {
  /** Dashboard keeps the module minimum; content grows solely with its contents. */
  variant: 'dashboard' | 'content';
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function RoleSection({ title, eyebrow, action, children, variant }: RoleSectionProps) {
  return (
    <section className={`section-card role-section role-section--${variant}`}>
      <div className="role-section__header">
        <WidgetHeader action={action}>{eyebrow ?? 'Раздел'}</WidgetHeader>
        <Heading level={2} variant="card">{title}</Heading>
      </div>
      {children}
    </section>
  );
}

export function MetricCards({ items }: { items: Array<{ label: string; value: string; detail?: string; progress?: number }> }) {
  return (
    <dl className="role-metric-grid compact-metric-grid">
      {items.map((item) => (
        <div className="role-metric-card compact-metric" key={item.label}>
          <Metadata as="dt" variant="label">{item.label}</Metadata>
          <dd>
            <MetricValue as="span" variant="compact">{item.value}</MetricValue>
            {item.detail ? <Metadata as="small" variant="label">{item.detail}</Metadata> : null}
            {item.progress !== undefined ? <AccessibleProgressBar className="role-metric-card__progress" label={`${item.label}: ${item.progress}%`} value={item.progress} view={item.progress < 60 ? 'negative' : 'positive'} size={8} /> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function RoleMetricValue({ children }: { children: ReactNode }) {
  return <MetricValue className="role-large-value" variant="display">{children}</MetricValue>;
}

export function RoleTabs({
  ariaLabel,
  compact = false,
  onChange,
  options,
  value,
}: {
  ariaLabel: string;
  compact?: boolean;
  onChange: (value: string) => void;
  options: Array<{ id: string; label: string }>;
  value: string;
}) {
  return (
    <SegmentedControl
      aria-label={ariaLabel}
      className="role-tabs"
      selectedId={value}
      size={compact ? 32 : 40}
      onChange={(selectedId) => onChange(String(selectedId))}
    >
      {options.map((option) => <Segment id={option.id} key={option.id} title={option.label} />)}
    </SegmentedControl>
  );
}

export function RoleSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ key: string; content: string }>;
  value: string;
}) {
  return (
    <AlfaSelect
      accessibleName={label}
      className="role-select"
      fieldClassName="role-select__field"
      label={label}
      labelView="outer"
      options={options}
      selected={value}
      size={40}
      onChange={({ selected }) => selected && onChange(selected.key)}
    />
  );
}

export interface DataTableProps {
  label: string;
  headings: string[];
  children: ReactNode;
  /** Focus-product columns preserve the existing dense six-column composition. */
  variant?: 'standard' | 'focus-products';
}

export function DataTable({ label, headings, children, variant = 'standard' }: DataTableProps) {
  return (
    <div className={`role-table-scroll role-table-scroll--${variant}`} tabIndex={0} aria-label={`${label}. Таблица прокручивается по горизонтали при необходимости`}>
      <table className="role-table">
        <caption className="sr-only">{label}</caption>
        <thead><tr>{headings.map((heading) => <th scope="col" key={heading}>{heading}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
