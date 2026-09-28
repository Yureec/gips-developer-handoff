import { createRoot } from 'react-dom/client';
import { LearningProvider } from '../../src/components/learning/LearningProvider';
import { DailyDetails, DailyInvest } from '../../src/components/learning/DailyInvest';
import type { LearningRead, DailyAssignment, LearningAdapter } from '../../src/domain/learning';
import '../../src/styles.css';
const mode = new URLSearchParams(location.search).get('case');
const envelope = { sourceRef: { system: 'LMS', externalId: 'a' }, ownerRef: 'learning', audiencePolicyRef: 'self', revision: 1, updatedAt: '2026-09-21T08:00:00Z', observedAt: '2026-09-21T08:01:00Z', access: 'allowed' as const };
const assignment: DailyAssignment = {
  ...envelope, id: 'a', title: 'Инвестиционные продукты: актуальные аргументы и подробный разбор клиентских вопросов', required: true, assignedAt: '2026-09-20T08:00:00Z', dueAt: '2026-09-27T18:00:00+03:00', dueTimezone: 'Europe/Moscow', status: 'in_progress', completionPolicyRef: 'p1',
  items: Array.from({ length: 7 }, (_, n) => ({ ...envelope, id: `i${n + 1}`, version: 'v1', title: `Элемент ${n + 1}`, required: true, order: n, publication: 'published', eligible: true, state: n < 4 ? 'completed' : 'not_started', ...(n < 4 ? { result: { evidenceRef: `r${n}`, confirmedAt: '2026-09-21T08:00:00Z', policyRef: 'p1' } } : {}) })),
};
if (mode === 'started') { assignment.items[5].state = 'in_progress'; assignment.items[5].lastActivityAt = '2026-09-21T08:00:00Z'; }
if (mode === 'empty') assignment.items = [];
if (mode === 'unknown') assignment.items[4].state = 'unknown';
if (mode === 'policy') assignment.completionPolicyRef = null;
if (mode === 'denied') assignment.access = 'denied';
if (mode === 'completed') { assignment.status = 'completed'; assignment.completion = { evidenceRef: 'done', confirmedAt: '2026-09-21T08:00:00Z' }; }
let calls = 0;
const source: LearningAdapter = {
  read: async (): Promise<LearningRead> => {
    calls++;
    if (mode === 'loading') return new Promise(() => {});
    if (mode === 'error' && calls === 1) throw new Error('offline');
    return { state: 'ready', snapshot: { snapshotId: 's1', subjectRef: 'self', sourceLabel: 'LMS', observedAt: envelope.observedAt, access: 'allowed', sync: mode === 'stale' ? 'stale' : mode === 'pending' ? 'pending' : 'current', assignments: mode === 'none' ? [] : [assignment] } };
  },
  resolveLaunchTarget: async () => mode === 'link' ? { url: 'https://learning.example.org/item', system: 'LMS' } : null,
};
createRoot(document.getElementById('root')!).render(<LearningProvider source={source}><main style={{ padding: 24 }}>
{new URLSearchParams(location.search).has('view') ? <DailyDetails /> : <div className="learning-now-grid"><DailyInvest dashboard /><DailyInvest /></div>}
</main></LearningProvider>);
