import { DashboardWidgets } from '../components/widgets/DashboardWidgets';
import type { DashboardData, ProductKey } from '../data/provider';
import type { SectionId } from '../domain/navigation';

interface HomePageProps {
  data: DashboardData;
  onNavigate: (section: SectionId) => void;
  onFocusProduct: (product: ProductKey) => void;
}

export function HomePage({ data, onNavigate, onFocusProduct }: HomePageProps) {
  return <DashboardWidgets data={data} onNavigate={onNavigate} onFocusProduct={onFocusProduct} />;
}
