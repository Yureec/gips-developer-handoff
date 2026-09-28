import type { ReactNode } from 'react';

interface RewardChipProps {
  children: ReactNode;
  title?: string;
}

export function RewardChip({ children, title }: RewardChipProps) {
  return (
    <span className="reward-chip" title={title}>
      {children}
    </span>
  );
}
