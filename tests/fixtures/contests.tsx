import { createRoot } from 'react-dom/client';
import { ContestPage } from '../../src/pages/ContestPage';
import type { ContestResults } from '../../src/domain/contests';
import '../../src/styles.css';

const results: ContestResults[] = [{
  contestId:'drive',groupId:'front-0',periodId:'total',asOf:'2026-09-22',state:'intermediate',
  rows:Array.from({length:21},(_,i)=>({employeeId:i===11?'alena-sokolova':`employee-${i}`, name:i===11?'Алена Соколова':`Сотрудник ${i+1}`,office:'Офис «Тверская»',score:3000000-i*100000,values:{sales:3000000-i*100000}})),
}];
createRoot(document.getElementById('root')!).render(<main className="content-shell"><ContestPage results={results} /></main>);
