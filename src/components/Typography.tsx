import { createElement, type HTMLAttributes, type ReactNode } from 'react';

export type HeadingVariant = 'page' | 'section' | 'card' | 'feature';

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  level: 1 | 2 | 3;
  variant: HeadingVariant;
}

export function Heading({ children, className, level, variant, ...props }: HeadingProps) {
  return createElement(
    `h${level}`,
    {
      ...props,
      className: `gips-heading gips-heading--${variant}${className ? ` ${className}` : ''}`,
    },
    children,
  );
}

export type MetricValueVariant = 'display' | 'compact' | 'supporting' | 'inline';

interface MetricValueProps {
  as?: 'b' | 'span' | 'strong';
  children: ReactNode;
  className?: string;
  variant: MetricValueVariant;
}

export function MetricValue({ as = 'strong', children, className, variant }: MetricValueProps) {
  return createElement(
    as,
    {
      className: `gips-metric-value gips-metric-value--${variant}${className ? ` ${className}` : ''}`,
    },
    children,
  );
}

export type MetadataVariant = 'eyebrow' | 'label' | 'detail';

interface MetadataProps {
  as?: 'div' | 'dt' | 'small' | 'span';
  children: ReactNode;
  className?: string;
  variant: MetadataVariant;
}

export function Metadata({ as = 'span', children, className, variant }: MetadataProps) {
  return createElement(
    as,
    {
      className: `gips-metadata gips-metadata--${variant}${className ? ` ${className}` : ''}`,
    },
    children,
  );
}
