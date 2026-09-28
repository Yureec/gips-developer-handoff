import type { DashboardData } from './provider';
import type { FocusCatalogData } from './focusCatalog';
import type { ResourceMaterial } from '../domain/resources';

/** Product sections remain the sole content source: no second copy of product conditions. */
export function createResources(catalog: FocusCatalogData, news: DashboardData['investorNews']): ResourceMaterial[] {
  const productMaterials = catalog.products.filter(p => p.id === 'nsj' || p.id === 'oms').flatMap(product =>
    product.sections.map(section => ({
      id: `${product.id}:${section.id}`, version: '2026-09-21', collection: 'knowledge' as const,
      title: `${product.title} · ${section.title}`, summary: section.entries[0]?.title ?? section.title,
      roles: product.segments, publication: 'available' as const, updatedAt: null,
      source: product.source, product: { id: product.id, title: product.title, section: section.id }, entries: section.entries,
    })));
  return [...productMaterials, ...news.map((article, index) => ({
    id: ['market-opening', 'sber-results', 'novatek-strategy'][index], version: '2026-09-21', collection: 'investor' as const,
    title: article.title, summary: article.category, roles: ['mass' as const], publication: 'available' as const,
    updatedAt: null, source: 'Альфа-Инвестор', entries: [{ title: 'Кратко', text: article.description }], image: article.image,
    // External original is provenance, not an integration dependency or a claimed full article.
    original: article.href,
  }))];
}
