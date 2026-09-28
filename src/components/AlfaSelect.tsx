import { useEffect, useRef } from 'react';
import { Select, type SelectProps } from '@alfalab/core-components/select';

type AlfaSelectProps = SelectProps & {
  accessibleName: string;
};

export function AlfaSelect({ accessibleName, ...props }: AlfaSelectProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) return undefined;

    const reconcileAccessibility = () => {
      const combobox = root.querySelector<HTMLElement>('[role="combobox"]');

      if (combobox?.getAttribute('aria-label') !== accessibleName) {
        combobox?.setAttribute('aria-label', accessibleName);
      }

      root.querySelectorAll<HTMLElement>('[aria-controls]').forEach((element) => {
        const controlledId = element.getAttribute('aria-controls');

        if (controlledId && !document.getElementById(controlledId)) {
          element.removeAttribute('aria-controls');
        }
      });

      root.querySelectorAll<SVGElement>('svg[role="img"]').forEach((icon) => {
        if (icon.getAttribute('aria-hidden') !== 'true') {
          icon.setAttribute('aria-hidden', 'true');
        }
      });
    };

    reconcileAccessibility();

    const observer = new MutationObserver(reconcileAccessibility);
    observer.observe(root, { attributes: true, childList: true, subtree: true });

    return () => observer.disconnect();
  }, [accessibleName]);

  return (
    <div className="alfa-select-a11y" ref={rootRef}>
      <Select {...props} />
    </div>
  );
}
