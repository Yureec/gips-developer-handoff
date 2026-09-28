import { useCallback } from 'react';
import { ProgressBar as CoreProgressBar, type ProgressBarProps } from '@alfalab/core-components/progress-bar';

export function AccessibleProgressBar({ label, ...props }: ProgressBarProps & { label: string }) {
  const setAccessibleName = useCallback((element: HTMLDivElement | null) => {
    element?.setAttribute('aria-label', label);
  }, [label]);

  return <CoreProgressBar ref={setAccessibleName} {...props} />;
}
