import React from 'react';
import { createRoot } from 'react-dom/client';
import { RoleSection, DataTable } from '../../src/components/RolePrimitives';
import '../../src/styles.css';

createRoot(document.getElementById('root')!).render(
  <main style={{ padding: 24, display: 'grid', gap: 24 }}>
    <div data-testid="plain">
      <RoleSection variant="dashboard" title="Dashboard outside grid"><p>Summary</p></RoleSection>
      <RoleSection variant="content" title="Content outside grid"><p>Summary</p></RoleSection>
    </div>
    <div data-testid="grid" className="role-grid role-grid--2" style={{ alignItems: 'start' }}>
      <RoleSection variant="dashboard" title="Dashboard inside grid"><p>Summary</p></RoleSection>
      <RoleSection variant="content" title="Content inside grid"><p>Summary</p></RoleSection>
    </div>
    <RoleSection variant="content" title="Long content">
      <DataTable label="Long table" headings={['Name', 'Value']}>
        {Array.from({ length: 20 }, (_, i) => <tr key={i}><td>Row {i}</td><td>{i}</td></tr>)}
      </DataTable>
    </RoleSection>
  </main>,
);
