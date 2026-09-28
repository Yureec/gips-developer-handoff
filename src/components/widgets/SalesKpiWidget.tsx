import type { ReactNode } from 'react';
import type { CSSProperties } from 'react';
import { PushpinVerticalCompactMIcon } from '@alfalab/icons-glyph/PushpinVerticalCompactMIcon';

import { WidgetHeader } from './WidgetHeader';

interface SalesKpiWidgetProps {
  variant?: 'dashboard';
  actual: ReactNode;
  footer?: ReactNode;
  heading: string;
  hint: ReactNode;
  hintTitle: string;
  metricAriaLabel?: string;
  metricLabel?: string;
  plan: ReactNode;
  progress: number;
  runRate: ReactNode;
  className?: string;
}

export function SalesKpiWidget({
  variant,
  actual,
  className,
  footer,
  heading,
  hint,
  hintTitle,
  metricAriaLabel = 'Прогноз выполнения плана',
  metricLabel = 'RR',
  plan,
  progress,
  runRate,
}: SalesKpiWidgetProps) {
  const normalizedProgress = Math.min(100, Math.max(0, progress));

  return (
    <article className={`widget widget--kpi sales-kpi-widget${variant ? ` sales-kpi-widget--${variant}` : ''}${className ? ` ${className}` : ''}`}>
      <WidgetHeader>{heading}</WidgetHeader>
      <div className="kpi-panel">
        <div
          aria-label={`${metricAriaLabel}: ${String(runRate)}`}
          className="kpi-ring"
          role="img"
          style={{ '--progress': `${normalizedProgress * 3.6}deg` } as CSSProperties}
        >
          <span className="kpi-ring__value">
            {metricLabel && <small>{metricLabel}</small>}
            <strong>{runRate}</strong>
          </span>
        </div>
        <dl>
          <div>
            <dt>План{variant ? ':' : ''}</dt>
            <dd>{plan}</dd>
          </div>
          <div>
            <dt>{variant ? 'За текущий месяц' : 'Факт'}</dt>
            <dd>{actual}</dd>
          </div>
        </dl>
      </div>
      <div className="kpi-hint">
        <PushpinVerticalCompactMIcon aria-hidden="true" />
        <p>
          <strong>{hintTitle}</strong>
          {hint}
        </p>
      </div>
      {footer ? <div className="widget-card-footer">{footer}</div> : null}
    </article>
  );
}
