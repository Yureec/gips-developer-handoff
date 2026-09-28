import { type FormEvent, useEffect, useId, useRef, useState } from 'react';
import { IconButton } from '@alfalab/core-components/icon-button';
import { Input } from '@alfalab/core-components/input';
import { MagnifierMIcon } from '@alfalab/icons-glyph/MagnifierMIcon';

interface CompactSearchProps {
  className?: string;
  direction?: 'down' | 'right';
  label: string;
  placeholder: string;
  size?: 32 | 40;
  value: string;
  onChange: (value: string) => void;
}

export function CompactSearch({ className, direction = 'down', label, placeholder, size = 40, value, onChange }: CompactSearchProps) {
  const [expanded, setExpanded] = useState(false);
  const inputId = useId();
  const panelId = `${inputId}-panel`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!expanded) return;
    rootRef.current?.querySelector('input')?.focus();
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setExpanded(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, [expanded]);

  const close = () => {
    setExpanded(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    close();
  };

  return (
    <div
      className={`compact-search compact-search--${direction} compact-search--size-${size}${value ? ' compact-search--active' : ''}${className ? ` ${className}` : ''}`}
      ref={rootRef}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && expanded) {
          event.stopPropagation();
          close();
        }
      }}
    >
      <IconButton
        aria-controls={panelId}
        aria-expanded={expanded}
        aria-label={expanded ? `Скрыть поиск: ${label}` : label}
        className="compact-search__trigger"
        icon={<MagnifierMIcon aria-hidden="true" focusable="false" />}
        ref={triggerRef}
        size={size}
        type="button"
        view="secondary"
        onClick={() => setExpanded(current => !current)}
      />
      {expanded ? (
        <form className="compact-search__panel" id={panelId} role="search" onSubmit={submit}>
          <label className="sr-only" htmlFor={inputId}>{label}</label>
          <Input
            block
            clear="auto"
            id={inputId}
            inputMode="search"
            placeholder={placeholder}
            size={48}
            type="text"
            value={value}
            onChange={(_, payload) => onChange(payload.value)}
          />
        </form>
      ) : null}
    </div>
  );
}
