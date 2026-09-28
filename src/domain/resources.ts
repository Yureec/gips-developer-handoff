import type { RoleId } from './navigation';

export type ResourceCollection = 'knowledge' | 'investor';
export interface ResourceMaterial {
  id: string;
  version: string;
  collection: ResourceCollection;
  title: string;
  summary: string;
  roles: RoleId[];
  publication: 'available' | 'withdrawn';
  updatedAt: string | null;
  source: string;
  product?: { id: string; title: string; section: string };
  entries: Array<{ title: string; text: string }>;
  image?: string;
  original?: string;
}
export interface ReadingRecord { version: string; state: 'started' | 'completed'; updatedAt: string; anchor?: string }
export type ReadingHistory = Record<string, ReadingRecord>;
export function availableMaterials(materials: ResourceMaterial[], role: RoleId) {
  return materials.filter(m => m.roles.includes(role) && m.publication === 'available');
}
export function readingState(material: ResourceMaterial, history: ReadingHistory) {
  const record = history[material.id];
  return record?.version === material.version ? record : undefined;
}
export function resourceRecommendations(materials: ResourceMaterial[], role: RoleId, history: ReadingHistory) {
  return availableMaterials(materials, role).filter(m => m.product && readingState(m, history)?.state !== 'completed').slice(0, 3)
    .map(material => ({ material, reason: `Раздел фокусного продукта «${material.product!.title}»` }));
}
export function resourceHref(collection: ResourceCollection, id?: string, options: Record<string, string> = {}, role: RoleId = 'mass') {
  return `?${new URLSearchParams({ role, section: collection, ...options, ...(id ? { material: id } : {}) })}`;
}
/** Only same-document portal routes can be used as a return target, including file:// exports. */
export function safeResourceReturn(value: string | null, base: string, role: RoleId): string | null {
  if (!value || value.length > 2000) return null;
  try {
    const current = new URL(base), target = new URL(value, base);
    return target.origin === current.origin && target.pathname === current.pathname && target.searchParams.get('role') === role
      && ['home', 'learning', 'knowledge', 'investor', 'focus'].includes(target.searchParams.get('section') ?? '')
      && !target.searchParams.has('return') ? target.search + target.hash : null;
  } catch { return null; }
}
export function readHistory(key: string): ReadingHistory {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(key) ?? '{}');
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    return Object.fromEntries(Object.entries(raw).filter(([id, v]) => id !== '__proto__' && v && typeof v === 'object'
      && typeof v.version === 'string' && ['started', 'completed'].includes(v.state) && typeof v.updatedAt === 'string'
      && Number.isFinite(Date.parse(v.updatedAt)) && (v.anchor === undefined || typeof v.anchor === 'string')));
  } catch { return {}; }
}
