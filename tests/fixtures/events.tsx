import { createRoot } from 'react-dom/client';
import { LearningProvider } from '../../src/components/learning/LearningProvider';
import { Events } from '../../src/components/learning/Events';
import { LearningRoutes } from '../../src/components/learning/AssignmentDetails';
import type { LearningAdapter } from '../../src/domain/learning';
import type { LearningEvent } from '../../src/domain/events';
import '../../src/styles.css';
const envelope = { sourceRef: { system: 'Реестр обучения', externalId: 'event' }, ownerRef: 'organizer', audiencePolicyRef: 'self', revision: 2, updatedAt: '2026-09-21T08:00:00Z', observedAt: '2026-09-21T08:01:00Z', access: 'allowed' as const };
const base: LearningEvent = { ...envelope, id: 'workshop', productRefs: [], sync: 'current', title: 'Практикум по инвестиционным продуктам и вопросам клиентов', description: 'Разбор вопросов клиентов с экспертом.', format: 'workshop', topics: [{ id: 'products', title: 'Продукты' }], startsAt: '2026-10-01T15:00:00+03:00', endsAt: '2026-10-01T17:00:00+03:00', timezone: 'Europe/Moscow', venue: 'Учебная площадка', state: 'scheduled', registration: { state: 'open', eligible: true, policyRef: 'policy-v1', description: 'Условия организатора' }, join: { available: true }, participation: { ...envelope, id: 'p1', eventRef: 'workshop', registrationState: 'not_registered', attendanceState: 'unknown', recordingViewState: 'unknown' } };
const mode = new URLSearchParams(location.search).get('case');
if (mode === 'cancelled') { base.state = 'cancelled'; base.cancellationReason = 'Изменение программы'; }
if (mode === 'moved') base.previousSchedule = { startsAt: '2026-09-25T15:00:00+03:00', timezone: 'Europe/Moscow' };
if (mode === 'denied') base.access = 'denied';
if (mode === 'stale') base.sync = 'stale';
if (mode === 'unknown') { base.registration.policyRef = undefined; base.join.available = null; base.timezone = 'invalid'; }
if (mode === 'full') base.registration.state = 'full';
if (mode === 'closed') base.registration.state = 'closed';
if (mode === 'pending' || mode === 'waitlisted' || mode === 'registered') base.participation!.registrationState = mode;
if (mode === 'unconfirmed') base.participation!.registrationState = 'registered';
if (mode === 'registered') base.participation!.evidence = { registration: 'evidence-1', confirmedAt: envelope.updatedAt };
if (mode === 'foreign') base.participation!.eventRef = 'other';
if (mode === 'recordings' || mode === 'no-recording') {
  base.state = 'ended'; base.recordings = mode === 'recordings' ? [{ ...envelope, id: 'r1', version: 'v2', title: 'Запись практикума', publication: 'published' }, { ...envelope, id: 'revoked', version: 'v1', title: 'Старая запись', publication: 'revoked' }] : []; base.materials = [];
}
const events: LearningEvent[] = [base, { ...base, revision: 1, title: 'Устаревший дубль' }, ...Array.from({ length: 11 }, (_, i): LearningEvent => ({ ...base, id: `webinar-${i}`, startsAt: '2026-10-02T15:00:00+03:00', endsAt: '2026-10-02T17:00:00+03:00', title: `Вебинар ${i + 1}`, format: 'webinar', participation: undefined }))];
let reads = 0;
let requests: string[] = [];
const source: LearningAdapter = {
  read: async () => {
    if (mode === 'loading') return new Promise(() => {});
    if (mode === 'unavailable') return { state: 'unavailable' };
    if (mode === 'error' && reads++ === 0) throw Error('offline');
    if (sessionStorage.getItem('fixture-registered')) { base.participation!.registrationState = 'registered'; base.participation!.evidence = { registration: 'receipt', confirmedAt: envelope.updatedAt }; }
    return { state: 'ready', snapshot: { snapshotId: 'events', subjectRef: 'self', sourceLabel: 'Реестр обучения', observedAt: envelope.observedAt, sync: 'current', access: mode === 'no-access' ? 'denied' : 'allowed', assignments: [], events: mode === 'empty' ? [] : events } };
  },
  resolveLaunchTarget: async () => null,
  registerEvent: async (id, revision, request) => {
    requests.push(request); (window as unknown as { eventRequests: unknown }).eventRequests = { id, revision, requests };
    if (mode === 'registration-error' && requests.length === 1) throw Error('lost response');
    if (mode === 'rejected') return { state: 'rejected', reason: 'Приём заявок завершён' };
    if (mode !== 'accepted') sessionStorage.setItem('fixture-registered', 'yes');
    else base.participation!.registrationState = 'pending';
    return { state: 'accepted' };
  },
  resolveEventTarget: async (event, revision, action, asset) => ({ url: mode === 'bad-link' ? 'javascript:alert(1)' : `https://events.example.org/${event}/${action}/${asset?.id ?? ''}?version=${asset?.version ?? revision}`, system: 'Учебная площадка' }),
};
createRoot(document.getElementById('root')!).render(<LearningProvider source={source}><main className="content-shell" style={{ paddingBlock: 24, width: 'calc(100% - 48px)', maxWidth: 1440, marginInline: 'auto' }}>{new URLSearchParams(location.search).has('view') ? <LearningRoutes /> : <Events dashboard />}</main></LearningProvider>);
