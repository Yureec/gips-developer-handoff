interface CarouselPagerProps {
  activeIndex: number;
  count: number;
  itemLabel: string;
  inverted?: boolean;
  onChange: (index: number) => void;
}

export function CarouselPager({ activeIndex, count, itemLabel, inverted = false, onChange }: CarouselPagerProps) {
  return (
    <div
      className={`carousel-pager${inverted ? ' carousel-pager--inverted' : ''}`}
      aria-label={`Переключение: ${itemLabel}`}
      role="group"
    >
      {Array.from({ length: count }, (_, index) => (
        <button
          aria-label={`${itemLabel} ${index + 1} из ${count}`}
          aria-pressed={index === activeIndex}
          className={index === activeIndex ? 'is-active' : undefined}
          key={index}
          type="button"
          onClick={() => onChange(index)}
        />
      ))}
    </div>
  );
}
