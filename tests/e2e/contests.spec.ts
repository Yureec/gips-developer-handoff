import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { contestState, qualification, rankedResults, thresholdMet, type ContestGroup, type ContestThreshold } from '../../src/domain/contests';
import { expectNoHorizontalOverflow, waitForStablePage } from './helpers';

test('contest rules preserve strict thresholds, unknown observations and ties',()=>{
  const t: ContestThreshold={id:'sales',label:'Сборы',target:300000,unit:'₽',comparison:'gt'};
  expect(thresholdMet(t,300000)).toBe(false);expect(thresholdMet(t,300001)).toBe(true);
  expect(thresholdMet({...t,comparison:'gte'},300000)).toBe(true);
  expect(thresholdMet(t,null)).toBeNull();expect(thresholdMet(t,NaN)).toBeNull();
  const g={thresholds:[t]} as ContestGroup;
  expect(qualification(g,{employeeId:'a',name:'A',office:'O',score:0,values:{sales:null}})).toBe('unknown');
  const rows=[100,200,200,50].map((score,i)=>({employeeId:String(i),name:'N',office:'O',score,values:{}}));
  expect(rankedResults(rows).map(r=>r.rank)).toEqual([1,1,3,4]);
  expect(rows[0].score).toBe(100);
  const c={startsOn:'2026-07-15',endsOn:'2026-09-30'};
  expect(contestState(c,'2026-07-14')).toBe('upcoming');expect(contestState(c,'2026-07-15')).toBe('active');expect(contestState(c,'2026-09-30')).toBe('active');expect(contestState(c,'2026-10-01')).toBe('ended');
});

test('Mass navigation, catalog filters, deep links and return context',async({page})=>{
  await page.goto('/?role=mass&section=home');
  const nav=page.getByRole('navigation',{name:'Основные разделы'});
  await expect(nav).toContainText(/Главная.*Конкурсы.*Фокусные продукты.*Обучение.*Профиль/);
  await page.evaluate(() => sessionStorage.setItem('resources-scroll:?role=mass&section=contest', '650'));
  await nav.getByText('Конкурсы',{exact:true}).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.getByRole('heading',{level:1})).toHaveText('Конкурсы');
  await expect(page.locator('.contest-catalog-card')).toHaveCount(6);
  await expect(page.locator('.contest-catalog-grid')).not.toContainText('для партнёров');
  await expect(page.locator('.contest-catalog-grid')).not.toContainText('для заместителей');
  await page.getByRole('button',{name:'Поиск конкурсов',exact:true}).click();
  await page.getByRole('textbox',{name:'Поиск конкурсов'}).fill('Драйвим');
  await expect(page.locator('.contest-catalog-card')).toHaveCount(1);
  await page.getByRole('link',{name:'Условия и результаты'}).click();
  await expect(page).toHaveURL(/contest=drive/);
  await expect(page).toHaveTitle('Драйвим будущее 2.0 · ГИПС');
  await expect(page.getByRole('heading',{name:'Личный прогресс'})).toBeVisible();
  await page.getByRole('link',{name:'Все конкурсы',exact:true}).click();
  await page.getByRole('button',{name:'Поиск конкурсов',exact:true}).click();
  await expect(page.getByRole('textbox',{name:'Поиск конкурсов'})).toHaveValue('Драйвим');
  await page.reload();await expect(page.locator('.contest-catalog-card')).toHaveCount(1);
  await page.getByRole('button',{name:'Поиск конкурсов',exact:true}).click();
  await page.getByRole('textbox',{name:'Поиск конкурсов'}).fill('несуществующий');
  await expect(page.getByRole('heading',{name:'Конкурсы не найдены'})).toBeVisible();
  await page.getByRole('button',{name:'Сбросить фильтры'}).click();
  await expect(page.locator('.contest-catalog-card')).toHaveCount(6);
  await page.getByRole('button',{name:'Скоро',exact:true}).click();
  await expect(page.locator('.contest-catalog-card')).toHaveCount(1);
  await expect(page.locator('.contest-catalog-card')).toContainText('Конкурс по продаже инвестиций');
  await page.goBack();await page.goForward();
  await expectNoHorizontalOverflow(page);
  for(const role of ['only','consultant','partner','manager']){
    await page.goto(`/?role=${role}&section=home`);
    await expect(page.locator('.primary-navigation').getByText('Конкурсы',{exact:true})).toHaveCount(0);
  }
});

for(const id of ['catalog','marathon','drive','maximum','invest-q4','heat','fresh']){
  test(`contest shared template, accessibility and layout: ${id}`,async({page})=>{
    await page.goto(`/?role=mass&section=contest${id==='catalog'?'':`&contest=${id}`}`);
    await waitForStablePage(page);await expectNoHorizontalOverflow(page);
    await expect(page.getByRole('heading',{level:1})).toHaveCount(1);
    if(id!=='catalog'){
      await expect(page.locator('.contest-table')).toHaveCount(2);
      await expect(page.locator('#contest-materials a[download]')).toHaveCount(1);
      if(['maximum','fresh'].includes(id))await expect(page.getByRole('heading',{name:'Личный прогресс'})).toHaveCount(0);
    }
    const scan=await new AxeBuilder({page}).include('.contests-page').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    expect(scan.violations).toEqual([]);
    await expect(page).toHaveScreenshot(`contests-${id}.png`,{fullPage:true});
  });
}

test('period retains its address and employee group ignores URL overrides; unpublished results are not zeros',async({page})=>{
  await page.goto('/?role=mass&section=contest&contest=marathon');
  await page.getByRole('combobox',{name:'Период конкурса'}).click();
  await page.getByRole('option').filter({hasText:'Спринт 1'}).click();
  await expect(page).toHaveURL(/period=sprint-1/);
  await page.goto('/?role=mass&section=contest&contest=marathon&group=light&period=sprint-1&rankq=unknown');
  await expect(page.getByRole('combobox',{name:'Группа участников'})).toHaveCount(0);
  await expect(page.locator('.contest-ranking caption')).toContainText('Стандартная сеть');
  await expect(page.getByRole('textbox',{name:'Поиск по рейтингу'})).toHaveCount(0);
  await page.goto('/?role=mass&section=contest&contest=invest-q4');
  await expect(page.locator('.contest-personal-summary')).toContainText('—');
  await expect(page.locator('.contest-ranking')).toContainText('Рейтинг появится после старта конкурса');
  await page.goto('/?role=mass&section=contest&contest=pds-rush');
  await expect(page.getByRole('heading',{name:'Конкурс не найден'})).toBeVisible();
});

test('original PDF download has a PDF signature',async({page})=>{
  await page.goto('/?role=mass&section=contest&contest=drive');
  const downloadPromise=page.waitForEvent('download');
  await page.locator('#contest-materials').getByRole('link',{name:'Скачать условия · PDF'}).click();
  const download=await downloadPromise;
  expect(download.suggestedFilename()).toBe('Драйвим будущее 2.0.pdf');
  const stream=await download.createReadStream();const chunks:Buffer[]=[];for await(const chunk of stream!)chunks.push(chunk);
  expect(Buffer.concat(chunks).subarray(0,5).toString()).toBe('%PDF-');
});

test('published result contract renders personal progress, pagination and threshold status',async({page})=>{
  await page.goto('http://127.0.0.1:4174/tests/fixtures/contests.html?role=mass&section=contest&contest=drive');
  await expect(page.locator('.contest-personal-summary')).toContainText(/1\s900\s000/);
  await expect(page.locator('.contest-personal-summary')).toContainText('12');
  await expect(page.locator('.contest-thresholds')).toContainText(/До порога 100\s000/);
  await expect(page.locator('.contest-ranking tbody tr')).toHaveCount(10);
  await page.getByRole('button',{name:'Моя строка',exact:true}).click();
  await expect(page.locator('.contest-pagination')).toContainText('2 /');
  await expect(page.locator('.contest-ranking tbody tr')).toHaveCount(10);
  await expect(page.locator('.contest-current-row')).toBeFocused();
  await expect(page.locator('.contest-current-row')).toContainText('Не все выполнены');
  await page.getByRole('button',{name:'Назад',exact:true}).click();
  await expect(page.locator('.contest-ranking tbody tr')).toHaveCount(10);
  await expectNoHorizontalOverflow(page);
  expect((await new AxeBuilder({page}).include('.contests-page').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
});

test('contest menu returns from details to catalog and restores browser history', async ({page}) => {
  await page.goto('/?role=mass&section=contest&contest=drive');
  await page.getByRole('navigation',{name:'Основные разделы'}).getByText('Конкурсы',{exact:true}).click();
  await expect(page.locator('.contest-catalog-card')).toHaveCount(6);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await page.goBack();
  await expect(page.getByRole('heading',{level:1})).toHaveText('Драйвим будущее 2.0');
  await page.goForward();
  await expect(page.locator('.contest-catalog-card')).toHaveCount(6);
});

test('opening a contest ignores stale detail scroll and uses dashboard card heights', async ({page}) => {
  await page.goto('/?role=mass&section=contest');
  await page.evaluate(() => sessionStorage.setItem('resources-scroll:?role=mass&section=contest&contest=marathon', '900'));
  await page.getByRole('link',{name:'Открыть конкурс «Марафон желаний»'}).click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  for (const selector of ['.contest-detail-hero','.contest-personal','.contest-about','#contest-materials']) {
    await expect(page.locator(selector)).toHaveCSS('height','342px');
  }
  await expect(page.locator('.contest-personal')).not.toContainText('Условия участия');
  await expect(page.locator('.contest-sprint [role="combobox"]')).toHaveCSS('height','32px');
});

test('catalog geometry stays identical after navigation and reload', async ({page}) => {
  await page.goto('/?role=mass&section=home');
  await waitForStablePage(page);
  const shell = await page.locator('.content-shell').boundingBox();
  await page.getByRole('navigation',{name:'Основные разделы'}).getByText('Конкурсы',{exact:true}).click();
  await waitForStablePage(page);
  const before = await page.locator('.content-shell').boundingBox();
  const cardBefore = await page.locator('.contest-catalog-card').first().boundingBox();
  await expect(page.getByText('Данные на 22.09.2026',{exact:true})).toBeVisible();
  await expect(page.getByText('Условия, личные результаты и награды — в одном месте.')).toHaveCount(0);
  await page.reload();
  await waitForStablePage(page);
  const after = await page.locator('.content-shell').boundingBox();
  const cardAfter = await page.locator('.contest-catalog-card').first().boundingBox();
  expect(before?.width).toBe(shell?.width);
  expect(after?.width).toBe(before?.width);
  expect(after?.x).toBe(before?.x);
  expect(cardAfter?.width).toBe(cardBefore?.width);
});

test('contest catalog shares the focus-product title scale',async({page})=>{
 await page.goto('/?role=mass&section=focus');
 const title=await page.locator('.focus-product-card h3').first().evaluate(n=>{const s=getComputedStyle(n);return {family:s.fontFamily,size:s.fontSize,weight:s.fontWeight,line:s.lineHeight,spacing:s.letterSpacing}});
 await page.goto('/?role=mass&section=contest');
 for(const h of await page.locator('.contest-card-body h2').all())expect(await h.evaluate(n=>{const s=getComputedStyle(n);return {family:s.fontFamily,size:s.fontSize,weight:s.fontWeight,line:s.lineHeight,spacing:s.letterSpacing}})).toEqual(title);
});
