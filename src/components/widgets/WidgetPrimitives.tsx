import type { CSSProperties, ReactNode } from 'react';

interface WidgetMetaProps {
  children: ReactNode;
  className?: string;
  icon: ReactNode;
}

export function WidgetMeta({ children, className, icon }: WidgetMetaProps) {
  return (
    <span className={`widget-meta${className ? ` ${className}` : ''}`}>
      <span className="widget-meta__icon" aria-hidden="true">
        {icon}
      </span>
      <span>{children}</span>
    </span>
  );
}

interface WidgetIconBadgeProps {
  children: ReactNode;
  tone?: 'blue' | 'gold' | 'green' | 'orange' | 'red' | 'neutral' | 'violet';
}

export function WidgetIconBadge({ children, tone = 'neutral' }: WidgetIconBadgeProps) {
  return (
    <span className={`widget-icon-badge widget-icon-badge--${tone}`} aria-hidden="true">
      {children}
    </span>
  );
}

interface StepProgressProps {
  completed: number;
  total: number;
  label: string;
}

export function StepProgress({ completed, total, label }: StepProgressProps) {
  return (
    <div
      aria-label={label}
      aria-valuemax={total}
      aria-valuemin={0}
      aria-valuenow={completed}
      className="gips-step-progress"
      role="progressbar"
      style={{ '--step-total': total } as CSSProperties}
    >
      {Array.from({ length: total }, (_, index) => (
        <span className={index < completed ? 'is-complete' : undefined} key={index} />
      ))}
    </div>
  );
}
