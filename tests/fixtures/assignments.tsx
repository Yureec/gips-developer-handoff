import { createRoot } from 'react-dom/client';
import { LearningProvider } from '../../src/components/learning/LearningProvider';
import { DailyInvest } from '../../src/components/learning/DailyInvest';
import { AssignmentQueue, OverdueNotice } from '../../src/components/learning/AssignmentQueue';
import { LearningRoutes } from '../../src/components/learning/AssignmentDetails';
import type { DailyAssignment, LearningAdapter } from '../../src/domain/learning';
import '../../src/styles.css';
const envelope = { sourceRef: { system: 'LMS', externalId: 'a' }, ownerRef: 'learning', audiencePolicyRef: 'self', revision: 1, updatedAt: '2026-09-21T08:00:00Z', observedAt: '2026-09-21T08:01:00Z', access: 'allowed' as const };
const base: DailyAssignment = { ...envelope, id: 'exam', group: 'assignment', kind: 'assessment', title: 'Тестирование по инвестиционным продуктам и работе с клиентскими вопросами', required: true, assignedAt: '2026-09-20T08:00:00Z', dueAt: '2020-09-20T18:00:00+03:00', dueTimezone: 'Europe/Moscow', status: 'in_progress', completionPolicyRef: null, items: [{ ...envelope, id: 'test', version: 'v1', title: 'Знание продуктов', required: true, order: 1, publication: 'published', eligible: null, state: 'in_progress' }], attempts: [{ ...envelope, id: 'try1', assignmentRef: 'exam', assessmentVersionRef: { item: 'test', version: 'v1' }, startedAt: '2026-09-20T08:00:00Z', submittedAt: '2026-09-20T08:20:00Z', state: 'evaluated', resultRef: 'r1', attemptPolicyRef: null }, { ...envelope, id: 'try2', assignmentRef: 'exam', assessmentVersionRef: { item: 'test', version: 'v1' }, startedAt: '2026-09-21T08:00:00Z', state: 'submitted', attemptPolicyRef: null }], results: [{ ...envelope, id: 'r1', assignmentRef: 'exam', attemptRef: 'try1', outcome: 'failed', score: 0, maxScore: 100, completionEvidenceRef: 'e1', confirmedAt: '2026-09-20T08:21:00Z' }] };
const mode = new URLSearchParams(location.search).get('case');
const assignments: DailyAssignment[] = [base, { ...base, id: 'daily', group: 'daily', title: 'Daily приоритет', attempts: [], results: [] }, { ...base, revision: 0, title: 'Устаревший дубль' }, ...Array.from({ length: 12 }, (_, i): DailyAssignment => ({ ...base, id: `course-${i}`, kind: 'course', title: `Курс ${i + 1}`, required: false, dueAt: undefined, attempts: [], results: [] })), { ...base, id: 'done', title: 'Завершённое назначение', status: 'completed', completion: { evidenceRef: 'done', confirmedAt: '2026-09-21T08:00:00Z' }, attempts: [], results: [] }];
if (mode === 'review') base.results![0].reviewItems = [{ item: 'test', version: 'v1' }, { item: 'missing', version: 'v1' }];
if (mode === 'attempt-link') { base.items[0].eligible = true; base.attempts![1].state = 'in_progress'; }
if (mode === 'denied') base.access = 'denied';
if (mode === 'result-denied') base.results![0].access = 'denied';
if (mode === 'uncertain') { base.results![0].completionEvidenceRef = undefined; base.results![0].outcome = 'passed'; }
if (mode === 'corrected') base.results!.push({ ...base.results![0], id: 'r2', outcome: 'unknown', supersedes: 'r1', confirmedAt: '2026-09-21T08:00:00Z' });
let calls = 0;
const source: LearningAdapter = {
  read: async () => {
    if (mode === 'loading') return new Promise(() => {});
    if (mode === 'unavailable') return { state: 'unavailable' };
    if (mode === 'error' && calls++ === 0) throw Error('offline');
    return { state: 'ready', snapshot: { snapshotId: 's1', subjectRef: 'self', sourceLabel: 'LMS', observedAt: envelope.observedAt, access: mode === 'no-access' ? 'denied' : 'allowed', sync: mode === 'stale' ? 'stale' : mode === 'pending' ? 'pending' : 'current', assignments: mode === 'empty' ? [] : assignments } };
  },
  resolveLaunchTarget: async () => null,
  resolveAttemptLaunchTarget: async (assignment, attempt) => mode === 'attempt-link' && assignment === 'exam' && attempt === 'try2' ? { url: 'https://learning.example.org/attempt/try2', system: 'LMS' } : null,
};
createRoot(document.getElementById('root')!).render(<LearningProvider source={source}><main style={{ padding: 24 }}>
{new URLSearchParams(location.search).has('view') ? <LearningRoutes /> : <><OverdueNotice /><div className="learning-now-grid"><DailyInvest /><AssignmentQueue /></div></>}
</main></LearningProvider>);
