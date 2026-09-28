import { contests } from './contests';
import { contestEmployeeId, contestsAsOf, type Contest, type ContestGroup, type ContestResultRow, type ContestResults } from '../domain/contests';

/**
 * Local portal observations for the populated prototype (BACKLOG, current stage).
 * These figures are authored examples, not values extracted from the rule PDFs.
 * Keep this dataset separate from eligibility, quotas and award definitions.
 */
const firstNames = ['Дмитрий','Ольга','Игорь','Марина','Сергей','Екатерина','Алексей','Светлана','Михаил','Дарья','Николай','Ирина','Андрей','Юлия','Павел','Анна','Артём','Наталья','Максим','Татьяна'];
const surnames = ['Котов','Миронова','Петров','Романова','Лебедев','Новикова','Кузнецов','Белова','Орлов','Морозова','Волков','Соколова','Зайцев','Фролова','Захаров','Васильева','Егоров','Попова','Макаров','Павлова'];
const offices = ['Тверская','Арбат','Сокол','Парк культуры','Белорусская','Павелецкая','Проспект Мира','Марьино'];
function rowIdentity(index: number, group: ContestGroup, personal: boolean) {
  if (personal && index === 11) return { employeeId:contestEmployeeId, name:'Алена Соколова', office:'Офис «Тверская»' };
  const i=index%firstNames.length;
  const surnameIndex=(i+Math.floor(index/firstNames.length)*2)%surnames.length;
  return {employeeId:`${group.id}-employee-${index+1}`,name:`${firstNames[i]} ${surnames[surnameIndex]}`,office:`Офис «${offices[index%offices.length]}»`};
}
function observationRows(contest: Contest, group: ContestGroup, periodId: string): ContestResultRow[] {
  const count=contest.id==='marathon'?120:contest.id==='drive'?120:24;
  const personal=group.id===contest.personalGroupId;
  return Array.from({length:count},(_,index)=>{
    let score:number;
    if(contest.id==='marathon'){
      const personalScore=periodId==='sprint-1'?420000:periodId==='sprint-2'?340000:214000;
      score=index<11?personalScore+35000*(11-index):index===11?personalScore:Math.max(1000,Math.round(personalScore*(count-index)/(count-11)/1000)*1000);
      if(group.id==='light')score=Math.round(score*0.8/1000)*1000;
    }else if(contest.id==='drive')score=index<11?2200000+125000*(11-index):Math.max(20000,1650000-(index-11)*14000);
    else if(contest.id==='fresh'&&group.id==='partners-contracts')score=35-index;
    else if(contest.id==='fresh')score=12000000-index*350000;
    else if(contest.id==='heat')score=8500000-index*225000;
    else score=2400000-index*65000;
    const values:Record<string,number|null>={};
    for(const t of group.thresholds){
      if(t.id==='sales'||t.id==='contracts')values[t.id]=score;
      else if(t.id==='sc')values[t.id]=index<10?96-index:index===11?82:Math.max(60,86-index);
      else if(t.id==='activation')values[t.id]=index<10?88-index:index===11?68:Math.max(40,80-index);
      else values[t.id]=index<10?t.target+26-index*2:index===11?t.target-7:Math.max(50,t.target+2-index);
    }
    return {...rowIdentity(index,group,personal),score,values};
  });
}
export const contestResults: ContestResults[] = contests.flatMap(contest => {
  // The Q4 competition has no observations before its start.
  if(contest.startsOn>contestsAsOf)return [];
  return contest.periods.flatMap(period=>contest.groups.map(group=>({
    contestId:contest.id,groupId:group.id,periodId:period.id,
    asOf:contest.id==='heat'?'2026-07-31':contest.id==='fresh'?'2026-07-31':period.id==='sprint-1'?'2026-09-14':contestsAsOf,
    state:contest.id==='heat'||contest.id==='fresh'||period.id==='sprint-1'?'final' as const:'intermediate' as const,
    rows:observationRows(contest,group,period.id),
  })));
});
