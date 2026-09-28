import type { MarketplaceItem } from '../data/provider';

type MarketplaceVisualProps = {
  item: MarketplaceItem;
  variant?: 'preview' | 'detail';
};

export function MarketplaceVisual({ item, variant = 'preview' }: MarketplaceVisualProps) {
  if (item.type === 'merch' && item.image) {
    return (
      <span className={`marketplace-visual marketplace-visual--${variant}`}>
        <img src={item.image} alt={item.title} />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`marketplace-visual marketplace-visual--stock is-${item.brand ?? 'generic'} marketplace-visual--${variant}`}
    >
      {item.logoText ?? item.title[0]}
    </span>
  );
}
