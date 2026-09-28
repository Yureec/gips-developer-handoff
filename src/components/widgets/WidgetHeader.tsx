import type { ReactNode } from 'react';
import { Button } from '@alfalab/core-components/button';
import { ArrowRightMIcon } from '@alfalab/icons-glyph/ArrowRightMIcon';

interface WidgetHeaderProps {
  children: ReactNode;
  action?: ReactNode;
  inverted?: boolean;
  onAction?: () => void;
}

export function WidgetHeader({ children, action, inverted, onAction }: WidgetHeaderProps) {
  return (
    <div className="widget-header">
      <span className="widget-eyebrow">{children}</span>
      {typeof action === 'string' ? (
        <Button
          className="widget-header__action"
          colors={inverted ? 'inverted' : 'default'}
          rightAddons={<ArrowRightMIcon aria-hidden="true" />}
          size={32}
          style={{ minHeight: 32 }}
          view="text"
          onClick={onAction}
        >
          {action}
        </Button>
      ) : action ? <div className="widget-header__slot">{action}</div> : null}
    </div>
  );
}
