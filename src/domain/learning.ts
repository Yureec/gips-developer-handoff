import type { LearningEvent, EventAction } from './events';
/** Read model supplied by an authenticated learning adapter. Role in a URL is not authority. */
export interface LearningEntity {
  id: string;
  sourceRef: { system: string; externalId: string };
  ownerRef: string;
  audiencePolicyRef: string;
  revision: number;
  updatedAt: string;
  observedAt: string;
  access: 'allowed' | 'denied';
}
export interface DailyItem extends LearningEntity {
  version: string;
  title: string;
  required: boolean;
  order: number | null;
  publication: 'published' | 'revoked';
  eligible: boolean | null;
  state: 'unknown' | 'not_started' | 'in_progress' | 'completed' | 'pending';
  lastActivityAt?: string;
  result?: { evidenceRef: string; confirmedAt: string; policyRef: string };
}
export interface DailyAssignment extends LearningEntity {
  /** Missing group is the LEARN-02 Daily-only contract. New adapters set it explicitly. */
  group?: 'daily' | 'assignment';
  kind?: 'assessment' | 'course' | 'program';
  rules?: { version: string; description: string; durationMinutes?: number };
  attempts?: LearningAttempt[];
  results?: LearningResult[];
  title: string;
  required: boolean;
  assignedAt: string;
  dueAt?: string;
  dueTimezone?: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
  completion?: { evidenceRef: string; confirmedAt: string };
  completionPolicyRef: string | null;
  resumeTarget?: { item: string; version: string };
  items: DailyItem[];
}
export interface LearningSnapshot {
  snapshotId: string;
  subjectRef: string;
  sourceLabel: string | null;
  observedAt: string | null;
  access: 'allowed' | 'denied';
  sync: 'current' | 'pending' | 'stale' | 'unknown';
  assignments: DailyAssignment[];
  /** Undefined means unavailable, [] means a known empty register. */
  events?: LearningEvent[];
}
export type LearningRead = { state: 'loading' } | { state: 'error' } | { state: 'unavailable' } | { state: 'ready'; snapshot: LearningSnapshot };
export interface LearningAdapter {
  read(): Promise<LearningRead>;
  /** Server validates subject, current event revision/policy and existing participation.
   * Deduplicate retries by subject + event + requestId. Response is transport acceptance,
   * never confirmation of participation; refresh reads authoritative evidence. */
  registerEvent?(event: string, revision: number, requestId: string): Promise<{ state: 'accepted' | 'rejected'; reason?: string }>;
  /** Recheck audience, state, join window or exact published asset ID/version and HTTPS allowlist.
   * No tokens in URLs. Resolving/opening a target is not attendance or recording evidence. */
  resolveEventTarget?(event: string, revision: number, action: EventAction, asset?: { id: string; version: string }): Promise<{ url: string; system: string } | null>;
  /** Optional server resolution for one explicitly authorized existing attempt. */
  resolveAttemptLaunchTarget?(assignment: string, attempt: string, item: string, version: string): Promise<{ url: string; system: string } | null>;
  /** Must validate authenticated subject, assignment, version, publication and allowlisted HTTPS host. */
  resolveLaunchTarget(assignment: string, item: string, version: string): Promise<{ url: string; system: string } | null>;
}
export function selectAssignments(snapshot: LearningSnapshot, now = Date.now()) {
  const unique = new Map<string, DailyAssignment>();
  for (const a of snapshot.assignments) {
    const old = unique.get(a.id);
    if (!old || old.revision < a.revision) unique.set(a.id, a);
  }
  return [...unique.values()].sort((a, b) => {
    const terminal = (v: DailyAssignment) => ['completed', 'cancelled', 'expired'].includes(v.status) ? 1 : 0;
    const due = knownDeadline;
    const rank = (v: DailyAssignment) => v.required ? due(v) < now ? 0 : due(v) < Infinity ? 1 : 2 : 3;
    return terminal(a) - terminal(b) || rank(a) - rank(b) || (due(a) === due(b) ? 0 : due(a) < due(b) ? -1 : 1) || a.assignedAt.localeCompare(b.assignedAt) || a.id.localeCompare(b.id);
  });
}
export function dailyProgress(a: DailyAssignment) {
  const items = a.items.filter(i => i.required);
  if (a.access !== 'allowed' || !a.completionPolicyRef || !items.length || new Set(a.items.map(i => i.id)).size !== a.items.length) return null;
  if (items.some(i => i.access !== 'allowed' || i.state === 'unknown' || i.state === 'pending' || (i.state === 'completed' && (!i.result?.evidenceRef || !i.result.confirmedAt || i.result.policyRef !== a.completionPolicyRef)))) return null;
  return { completed: items.filter(i => i.state === 'completed').length, total: items.length };
}
export function nextDailyItem(a: DailyAssignment) {
  if (a.access !== 'allowed' || !['assigned', 'in_progress'].includes(a.status)) return null;
  const allowed = (i: DailyItem) => i.access === 'allowed' && i.publication === 'published' && i.eligible === true && ['not_started', 'in_progress'].includes(i.state);
  if (a.resumeTarget) return a.items.find(i => i.id === a.resumeTarget?.item && i.version === a.resumeTarget.version && allowed(i)) ?? null;
  if (a.access !== 'allowed' || !a.completionPolicyRef || a.items.some(i => i.state === 'completed' && (!i.result?.evidenceRef || !i.result.confirmedAt || i.result.policyRef !== a.completionPolicyRef))) return null;
  if (a.items.some(i => i.order === null || i.state === 'unknown' || i.state === 'pending')) return null;
  const candidates = a.items.filter(allowed);
  const started = candidates.filter(i => i.state === 'in_progress' && i.lastActivityAt).sort((a, b) => b.lastActivityAt!.localeCompare(a.lastActivityAt!) || a.id.localeCompare(b.id));
  return started[0] ?? candidates.sort((a, b) => a.order! - b.order! || a.id.localeCompare(b.id))[0] ?? null;
}
export function learningHref(view?: string, assignment?: string, item?: DailyItem) {
  const p = new URLSearchParams({ role: 'mass', section: 'learning' });
  if (view) p.set('view', view);
  if (assignment) p.set('assignment', assignment);
  if (item) { p.set('item', item.id); p.set('version', item.version); }
  if (view === 'assignments') { p.set('group', 'daily'); p.set('status', 'active'); }
  return `?${p}`;
}

export interface LearningAttempt extends LearningEntity {
  assignmentRef: string;
  assessmentVersionRef: { item: string; version: string };
  startedAt: string;
  submittedAt?: string;
  state: 'created' | 'in_progress' | 'submitted' | 'evaluated' | 'invalidated';
  attemptPolicyRef: string | null;
  resultRef?: string;
  invalidationReason?: string;
}
export interface LearningResult extends LearningEntity {
  assignmentRef: string;
  attemptRef?: string;
  outcome: 'passed' | 'failed' | 'completed' | 'unknown';
  score?: number;
  maxScore?: number;
  completionEvidenceRef?: string;
  confirmedAt?: string;
  supersedes?: string;
  /** Source-selected references only; no client inference of weak topics. */
  reviewItems?: { item: string; version: string }[];
}
export function isDaily(a: DailyAssignment) { return a.group !== 'assignment'; }
export function selectDailyAssignments(snapshot: LearningSnapshot, now = Date.now()) {
  return selectAssignments(snapshot, now).filter(isDaily);
}
export function knownDeadline(a: DailyAssignment) {
  if (!a.dueAt || !a.dueTimezone || !/(Z|[+-]\d{2}:\d{2})$/.test(a.dueAt)) return Infinity;
  try { new Intl.DateTimeFormat('ru', { timeZone: a.dueTimezone }); } catch { return Infinity; }
  const value = Date.parse(a.dueAt);
  return Number.isFinite(value) ? value : Infinity;
}
export function isActive(a: DailyAssignment) { return ['assigned', 'in_progress'].includes(a.status); }
export function isOverdue(a: DailyAssignment, now = Date.now()) { return a.access === 'allowed' && isActive(a) && knownDeadline(a) < now; }
export function latestEntities<T extends LearningEntity>(entities: T[]): T[] {
  const map = new Map<string, T>();
  for (const entity of entities) if (!map.has(entity.id) || map.get(entity.id)!.revision < entity.revision) map.set(entity.id, entity);
  return [...map.values()];
}
export function assignmentResults(a: DailyAssignment) {
  return latestEntities(a.results ?? []).filter(r => r.assignmentRef === a.id).sort((a, b) => (b.confirmedAt ?? '').localeCompare(a.confirmedAt ?? '') || a.id.localeCompare(b.id));
}
export function assignmentAttempts(a: DailyAssignment) {
  return latestEntities(a.attempts ?? []).filter(t => t.assignmentRef === a.id).sort((a, b) => b.startedAt.localeCompare(a.startedAt) || a.id.localeCompare(b.id));
}
export function queueHref(params: Record<string, string> = {}) {
  return `?${new URLSearchParams({ role: 'mass', section: 'learning', view: 'assignments', status: 'active', ...params })}`;
}
export function entityHref(view: 'attempt' | 'result', assignment: string, id: string) {
  return `?${new URLSearchParams({ role: 'mass', section: 'learning', view, assignment, [view]: id })}`;
}
