import { ProductImage } from './ProductImage';
import type { ReactNode } from 'react';
import { Button } from '@alfalab/core-components/button';
import { ArrowLeftMIcon } from '@alfalab/icons-glyph/ArrowLeftMIcon';

import { Heading, Metadata } from './Typography';

export { RewardChip } from './RewardChip';

interface PageBackProps {
  label: string;
  onClick: () => void;
}

export function PageBack({ label, onClick }: PageBackProps) {
  return (
    <Button
      className="page-back"
      leftAddons={<ArrowLeftMIcon aria-hidden="true" />}
      size={40}
      style={{ minHeight: 40 }}
      view="text"
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

interface PageHeroProps {
  icon: ReactNode;
  tags: ReactNode;
  title: string;
  description: string;
  tone?: 'neutral' | 'violet' | 'warm';
  action?: ReactNode;
  children?: ReactNode;
}

export function PageHero({ icon, tags, title, description, tone = 'neutral', action, children }: PageHeroProps) {
  return (
    <section className={`page-hero page-hero--${tone}`} aria-labelledby="page-title">
      <div className="page-hero__top">
        <div className="page-hero__identity">
          <span className="page-hero__icon" aria-hidden="true">
            {icon}
          </span>
          <div className="page-hero__content">
            <div className="page-tags">{tags}</div>
            <Heading level={1} variant="page" id="page-title">{title}</Heading>
            <p>{description}</p>
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function StatusTag({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'red' | 'gold' | 'green' | 'violet';
}) {
  return <span className={`status-tag status-tag--${tone}`}>{children}</span>;
}

export function SectionEyebrow({ children }: { children: ReactNode }) {
  return <Metadata as="div" className="section-eyebrow" variant="eyebrow">{children}</Metadata>;
}

export function ProductMark({ image, label }: { image?: string; label: string }) {
  return image ? (
    <span className="product-mark product-mark--image">
      <ProductImage src={image} />
    </span>
  ) : (
    <span className="product-mark" aria-hidden="true">
      {label}
    </span>
  );
}
