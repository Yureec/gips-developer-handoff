import type { ProductSales } from '../domain/focus';
export type FocusProductId = 'nsj' | 'oms' | 'pds' | 'nsj-plus' | 'autofollow';

export const massInvestmentSales = { actual: 2_340_000, plan: 3_000_000 } as const;

export const focusSales: Record<FocusProductId, ProductSales> = {
  nsj: { actual: 314_725, plan: 540_000 },
  oms: { actual: 198_670, plan: 575_000 },
  pds: { actual: 360_145, plan: 610_000 },
  'nsj-plus': { actual: null, plan: null },
  autofollow: { actual: null, plan: null },
};
