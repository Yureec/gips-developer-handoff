import { contests } from './contests';
import { contestResults } from './contestResults';
import { contestEmployeeId, contestState, rankedResults } from '../domain/contests';
import type { DashboardData } from './provider';

export function contestDashboardItems(): DashboardData['contests'] {
  return contests.filter(c => c.personalGroupId && contestState(c) === 'active').map(c => {
    const observation = contestResults.find(r => r.contestId === c.id && r.groupId === c.personalGroupId && r.periodId === c.defaultPeriodId);
    const row = rankedResults(observation?.rows ?? []).find(r => r.employeeId === contestEmployeeId);
    return { id:c.id, eyebrow:'КОНКУРС', title:c.title, period:c.periodLabel, description:c.description, image:c.dashboardImage,
      ...(row ? { rank: `${row.rank} из ${observation!.rows.length}` } : {}) };
  });
}
