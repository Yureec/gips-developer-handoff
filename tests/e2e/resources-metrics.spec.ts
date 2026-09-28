import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { metricValues, type PortalMetric } from '../../src/domain/metrics';
import { availableMaterials, readingState, resourceRecommendations, safeResourceReturn, type ResourceMaterial } from '../../src/domain/resources';
import { expectNoHorizontalOverflow, waitForStablePage } from './helpers';

test('metrics distinguish completion, run rate, activation and unknown targets', () => {
  const metric = { kind: 'sales', actual: 50, target: 100, calendar: { month: '2026-09', asOf: '2026-09-01', workingDates: ['2026-09-01', '2026-09-02'] } } as PortalMetric;
  expect(metricValues(metric)).toMatchObject({ completion: 50, runRate: 100, deviation: -50, status: 'in_progress' });
  for (const target of [0, null, NaN, -1]) expect(metricValues({ ...metric, target })).toMatchObject({ completion: null, runRate: null, deviation: null });
  expect(metricValues({ ...metric, actual: 0 })).toMatchObject({ completion: 0, runRate: 0 });
  expect(metricValues({ ...metric, kind: 'activation' }).runRate).toBeNull();
  expect(metricValues({ ...metric, actual: 150 }).completion).toBe(150);
  expect(metricValues({ ...metric, issue: 'unknown rule' }).status).toBe('unknown');
});

test('resource selection respects audience, withdrawn versions and completion', () => {
  const m = { id: 'm', version: '2', roles: ['mass'], publication: 'available', product: { id: 'nsj', title: 'Product' } } as ResourceMaterial;
  const history = { m: { version: '1', state: 'completed' as const, updatedAt: '2026-09-21' } };
  expect(readingState(m, history)).toBeUndefined();
  expect(resourceRecommendations([m], 'mass', history)).toHaveLength(1);
  expect(resourceRecommendations([m], 'mass', { m: { ...history.m, version: '2' } })).toHaveLength(0);
  expect(availableMaterials([m, { ...m, publication: 'withdrawn' }], 'mass')).toHaveLength(1);
  expect(availableMaterials([m], 'only')).toHaveLength(0);
  expect(safeResourceReturn('https://evil.example/?role=mass&section=home', 'https://portal.example/', 'mass')).toBeNull();
  expect(safeResourceReturn('?role=only&section=home', 'https://portal.example/', 'mass')).toBeNull();
  expect(safeResourceReturn('?role=mass&section=knowledge&q=gold', 'file:///portal/index.html', 'mass')).toContain('q=gold');
});

test('resource product context, search, reload and unavailable IDs', async ({ page }) => {
  await page.goto('/?role=mass&section=knowledge&q=Условия');
  await page.locator('.edu-resource-card').first().click();
  await expect(page.getByRole('heading', {level:1})).toContainText('Условия');
  await page.reload();
  await page.getByRole('link', {name:'К базе знаний',exact:true}).click();
  await expect(page.getByRole('textbox',{name:'Поиск материалов'})).toHaveValue('Условия');
  await page.getByRole('textbox',{name:'Поиск материалов'}).fill('несуществующий материал');
  await expect(page.getByRole('heading',{name:'Материалы не найдены'})).toBeVisible();
  await page.getByRole('button',{name:'Сбросить фильтры'}).first().click();
  await expect(page.locator('.edu-resource-card').first()).toBeVisible();
  for (const query of ['role=only&section=knowledge&material=nsj:conditions','role=mass&section=knowledge&material=missing']) {
    await page.goto('/?'+query); await expect(page.getByRole('heading',{name:'Материал недоступен'})).toBeVisible();
  }
});

test('investor route opens the original publication without a local copy', async ({page})=>{
 await page.route('https://alfabank.ru/**',r=>r.fulfill({body:'Альфа-Инвестор'}));
 await page.goto('/?role=mass&section=investor');
 await expect(page).toHaveURL('https://alfabank.ru/alfa-investor/');
});

test('canonical Mass balances and focus sales agree across surfaces', async ({ page }) => {
  await page.goto('/?role=mass&section=home');
  await expect(page.locator('.level-card')).toContainText('2 850');
  await expect(page.locator('.level-card')).toContainText('1 740');
  await expect(page.locator('.rating-list')).toContainText('Марафон желаний');
  await expect(page.locator('.rating-list')).toContainText('12 / 120');
  await expect(page.locator('.widget--focus')).toContainText(/314\s725/);
  await expect(page.locator('.widget--kpi')).toContainText('За текущий месяц');
  await page.locator('.widget--contest').getByRole('button', { name: 'Подробнее', exact: true }).click();
  await expect(page).toHaveURL(/contest=marathon/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Марафон желаний');
  await expect(page.locator('.contest-personal')).toContainText('Стандартная сеть');
  await expect(page.locator('.contest-personal')).toContainText('12 из 120');
  await expect(page.locator('.contest-personal-summary')).toContainText(/214\s000/);
  await page.goto('/?role=mass&section=profile');
  await expect(page.locator('.profile-quick-stats')).toContainText(/2\s850/);
  await expect(page.locator('.profile-quick-stats')).toContainText(/1\s740/);
  await expect(page.locator('.profile-level')).toContainText('760 XP');
  await page.goto('/?role=mass&section=games');
  await expect(page.locator('.page-hero')).toContainText(/2\s850/);
  await expect(page.locator('.page-hero')).toContainText(/1\s740/);
  await page.goto('/?role=mass&section=marketplace&filter=orders');
  await expect(page.locator('.marketplace-orders')).toContainText(/2\s850/);
  await page.goto('/?role=mass&section=focus&product=nsj');
  await expect(page.locator('.focus-personal-sales')).toContainText(/314\s725/);
  await page.goto('/?role=consultant&section=home');
  await expect(page.locator('.widget--contest')).not.toContainText('12 из 120');
  await expect(page.getByRole('progressbar', { name: 'Доля клиентов с инвестициями: 77,2%' })).toHaveAttribute('aria-valuenow', '77');
});

for (const [name, route] of [
  ['resources', '/?role=mass&section=knowledge'], ['material', '/?role=mass&section=knowledge&material=nsj:conditions'],
  ['metric', '/?role=consultant&section=metrics&metric=consultant-base'],
] as const) test(`${name}: layout, accessibility and visual contract`, async ({ page }) => {
  await page.goto(route); await waitForStablePage(page); await expectNoHorizontalOverflow(page);
  const results = await new AxeBuilder({ page }).include('main').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
  await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
});
