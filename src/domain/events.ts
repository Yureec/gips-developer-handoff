import type { LearningEntity, LearningSnapshot } from './learning';

export type EventAction = 'join' | 'recording' | 'material';
export interface EventAsset extends LearningEntity {
  title: string;
  version: string;
  publication: 'published' | 'revoked';
}
export interface Participation extends LearningEntity {
  eventRef: string;
  registrationState: 'not_registered' | 'pending' | 'registered' | 'waitlisted' | 'rejected' | 'cancelled';
  attendanceState: 'unknown' | 'attended' | 'absent';
  recordingViewState: 'unknown' | 'viewed';
  evidence?: { registration?: string; attendance?: string; recording?: string; confirmedAt: string };
  reason?: string;
}
export interface LearningEvent extends LearningEntity {
  productRefs: string[];
  sync: LearningSnapshot['sync'];
  title: string;
  description: string;
  format: 'webinar' | 'workshop' | 'meeting';
  topics: Array<{ id: string; title: string }>;
  startsAt?: string;
  endsAt?: string;
  timezone?: string;
  venue?: string;
  state: 'scheduled' | 'live' | 'ended' | 'cancelled';
  previousSchedule?: { startsAt: string; timezone: string };
  cancellationReason?: string;
  registration: { state: 'open' | 'closed' | 'full' | 'unknown'; policyRef?: string; description?: string; eligible: boolean | null; reason?: string };
  join: { available: boolean | null; reason?: string };
  recordings?: EventAsset[];
  materials?: EventAsset[];
  participation?: Participation;
}
export function eventHref(event?: string, filters: Record<string, string> = {}) {
  const p = new URLSearchParams({ role: 'mass', section: 'learning', view: event === undefined ? 'events' : 'event', ...(event === undefined ? filters : { event }) });
  return `?${p}`;
}
export const eventFormats = { all: 'Все форматы', webinar: 'Вебинары', workshop: 'Практикумы', meeting: 'Встречи' };
export function latestEntities<T extends LearningEntity>(rows: T[]): T[] {
  const map = new Map<string, T>();
  for (const row of rows) { const old = map.get(row.id); if (!old || row.revision > old.revision) map.set(row.id, row); }
  return [...map.values()];
}
export function selectEvents(snapshot: LearningSnapshot) {
  if (snapshot.access !== 'allowed') return [];
  return latestEntities(snapshot.events ?? []).filter(e => ['webinar', 'workshop', 'meeting'].includes(e.format)).sort((a, b) => (eventInstant(a.startsAt, a.timezone) ?? Infinity) - (eventInstant(b.startsAt, b.timezone) ?? Infinity) || a.id.localeCompare(b.id));
}
export function eventInstant(date?: string, timezone?: string): number | null {
  if (!date || !timezone || !/(Z|[+-]\d{2}:\d{2})$/.test(date) || !Number.isFinite(Date.parse(date))) return null;
  try { new Intl.DateTimeFormat('ru', { timeZone: timezone }).format(); return Date.parse(date); } catch { return null; }
}
export function eventTime(date?: string, timezone?: string) {
  return eventInstant(date, timezone) === null ? 'Время уточняется' : `${new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long', timeStyle: 'short', timeZone: timezone }).format(new Date(date!))} · ${timezone}`;
}
export function participationFor(e: LearningEvent) { return e.participation?.eventRef === e.id && e.participation.access === 'allowed' ? e.participation : undefined; }
export function canRegister(e: LearningEvent, snapshot: LearningSnapshot) {
  const p = participationFor(e);
  return snapshot.access === 'allowed' && snapshot.sync === 'current' && e.access === 'allowed' && e.sync === 'current' && ['scheduled', 'live'].includes(e.state) && e.registration.state === 'open' && !!e.registration.policyRef && e.registration.eligible === true && !!p && ['not_registered', 'rejected', 'cancelled'].includes(p.registrationState);
}
export function canOpenEvent(e: LearningEvent, snapshot: LearningSnapshot, action: EventAction, asset?: EventAsset) {
  return snapshot.access === 'allowed' && snapshot.sync === 'current' && e.access === 'allowed' && e.sync === 'current' && (action === 'join' ? ['scheduled', 'live'].includes(e.state) && e.join.available === true : e.state === 'ended' && asset?.access === 'allowed' && asset.publication === 'published');
}

/** Calendar export does not send a registration request or certify attendance. */
export function eventCalendar(e: LearningEvent): string | null {
  const start = eventInstant(e.startsAt, e.timezone);
  const end = eventInstant(e.endsAt, e.timezone);
  if (e.access !== 'allowed' || e.sync !== 'current' || !['scheduled', 'live'].includes(e.state) || start === null || end === null || end <= start || !Number.isFinite(Date.parse(e.updatedAt))) return null;
  const stamp = (value: number) => new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const escape = (value: string) => value.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/[,;]/g, char => '\\' + char);
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//GIPS//Learning Events//RU', 'BEGIN:VEVENT', `UID:${encodeURIComponent(e.id)}`, `SEQUENCE:${e.revision}`, `DTSTAMP:${stamp(Date.parse(e.updatedAt))}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`, `SUMMARY:${escape(e.title)}`, ...(e.venue ? [`LOCATION:${escape(e.venue)}`] : []), 'END:VEVENT', 'END:VCALENDAR', ''].join('\r\n');
}
