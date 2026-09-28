import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CoreConfigContext } from '@alfalab/core-components-config';

import { App } from './App';
import './styles.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Не найден корневой элемент приложения');
}

createRoot(root).render(
  <StrictMode>
    <CoreConfigContext.Provider value={{ breakpoint: 1024, client: 'desktop' }}>
      <App />
    </CoreConfigContext.Provider>
  </StrictMode>,
);

