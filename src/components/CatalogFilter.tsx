import { Segment, SegmentedControl } from '@alfalab/core-components/segmented-control';
import './CatalogFilter.css';

/** Shared compact catalog filters used by products and contests. */
export function CatalogFilter({ label, value, options, onChange, compact = false }: {
  label: string; value: string; options: Array<{ id: string; title: string }>;
  onChange: (value: string) => void; compact?: boolean;
}) {
  return <SegmentedControl aria-label={label} className={`catalog-filter${compact ? ' catalog-filter--compact' : ''}`} shape="rounded" size={32} selectedId={value} onChange={id => onChange(String(id))}>
    {options.map(({ id, title }) => <Segment key={id} id={id} title={title} />)}
  </SegmentedControl>;
}
