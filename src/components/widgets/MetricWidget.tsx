import { AccessibleProgressBar } from '../AccessibleProgressBar';
import { WidgetHeader } from './WidgetHeader';
import { Metadata, MetricValue } from '../Typography';

interface MetricWidgetProps {
  description: string;
  label: string;
  progress: number;
  remainder: string;
  tone?: 'alert' | 'success';
  trend: string;
  value: string;
}

export function MetricWidget({
  description,
  label,
  progress,
  remainder,
  tone,
  trend,
  value,
}: MetricWidgetProps) {
  return (
    <article className={`widget metric-widget${tone ? ` is-${tone}` : ''}`}>
      <WidgetHeader>{label}</WidgetHeader>
      <MetricValue className="metric-widget__value" variant="display">{value}</MetricValue>
      <p className="metric-widget__description">{description}</p>
      <AccessibleProgressBar
        className="metric-widget__progress"
        label={`${label}: ${progress}%`}
        size={8}
        value={progress}
        view={tone === 'alert' ? 'negative' : tone === 'success' ? 'positive' : 'link'}
      />
      <div className="metric-widget__footer">
        <span>{trend}</span>
        <Metadata as="small" variant="label">{remainder}</Metadata>
      </div>
    </article>
  );
}
