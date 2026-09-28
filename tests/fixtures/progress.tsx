import React from 'react';
import { createRoot } from 'react-dom/client';
import { CoreConfigContext } from '@alfalab/core-components-config';
import { MetricWidget } from '../../src/components/widgets/MetricWidget';
import { MetricCards } from '../../src/components/RolePrimitives';
import '../../src/styles.css';

const values = [0, 45, 100];
createRoot(document.getElementById('root')!).render(
  <CoreConfigContext.Provider value={{ breakpoint: 1024, client: 'desktop' }}>
    <main style={{ padding: 24 }}>
      <div className="only-goal-grid">
        {values.map(progress => <MetricWidget key={progress} label={`KPI ${progress}%`}
          value={`${progress}%`} progress={progress} description="Выполнение плана"
          tone={progress === 45 ? 'alert' : 'success'} trend="Текущий период" remainder="До цели" />)}
      </div>
      <MetricCards items={values.map(progress => ({ label: `План ${progress}%`, value: `${progress}%`, progress }))} />
    </main>
  </CoreConfigContext.Provider>,
);
