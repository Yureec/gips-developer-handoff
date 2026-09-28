import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { focusSales, massInvestmentSales } from '../../src/data/investmentSales';
import { expectNoHorizontalOverflow, waitForStablePage } from './helpers';

const items = ['pds-workshop', 'investment-arguments', 'pds-assessment', 'nsj-course', 'pds-questions'];
test('focus sales remain a subset of investment KPI', () => {
  const kpi = massInvestmentSales;
  const actual = Object.values(focusSales).reduce((sum, sale) => sum + (sale.actual ?? 0), 0);
  const plan = Object.values(focusSales).reduce((sum, sale) => sum + (sale.plan ?? 0), 0);
  expect(kpi.plan).toBe(3000000);
  expect(actual).toBeLessThanOrEqual(kpi.actual!);
  expect(plan).toBeLessThanOrEqual(kpi.plan!);
  expect(actual / plan).toBeLessThanOrEqual(kpi.actual! / kpi.plan!);
});
test('all carousel cards have exact destinations, preserve slide and return', async ({ page }) => {
  await page.goto('/?role=mass&section=home');
  const widget = page.getByRole('article', { name: 'Инвест-класс', exact: true });
  for (const [index, id] of items.entries()) {
    await widget.getByRole('button', { name: `Инвест-класс ${index + 1} из 5` }).click();
    await waitForStablePage(page);
    await expect(widget).toHaveScreenshot(`card-${id}.png`);
    const title = await widget.getByRole('heading', { level: 2 }).textContent();
    await widget.getByRole('link').click();
    await expect(page).toHaveURL(new RegExp(`item=${id}$`));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title!);
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title!);
    await expectNoHorizontalOverflow(page);
    await page.getByRole('link', { name: 'На главную' }).click();
    await expect(widget.getByRole('heading', { level: 2 })).toHaveText(title!);
  }
});
for (const id of items) test(`${id}: shared page, accessible content and honest availability`, async ({ page }) => {
  await page.goto(`/?role=mass&section=learning&view=invest-class&item=${id}`);
  await waitForStablePage(page);
  await expectNoHorizontalOverflow(page);
  expect((await new AxeBuilder({ page }).include('main').withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
  await expect(page).toHaveScreenshot(`detail-${id}.png`, { fullPage: true });
  await expect(page.getByRole('button', { name: /Завершить|Начислить|Зарегистрироваться/ })).toHaveCount(0);
});
test('catalog, unknown route and storage failure keep navigation usable', async ({ page }) => {
  await page.goto('/?role=mass&section=learning&view=invest-class&item=unknown');
  await expect(page.getByRole('heading', { name: 'Материал не найден' })).toBeVisible();
  await page.getByRole('link', { name: 'К обучению' }).click();
  await page.goto('/?role=mass&section=learning&view=invest-class');
  await expect(page.locator('.edu-recommendation')).toHaveCount(8);
  await page.addInitScript(() => { Storage.prototype.getItem = () => { throw new Error('blocked'); }; Storage.prototype.setItem = () => { throw new Error('blocked'); }; });
  await page.goto('/?role=mass&section=home');
  await page.getByRole('article', { name: 'Инвест-класс', exact: true }).getByRole('link').click();
  await expect(page.getByRole('heading', { name: 'Воркшоп по ПДС', exact: true })).toBeVisible();
});


test('interview preserves every character of the supplied text', async ({ page }) => {
  const source = readFileSync('src/data/learning/pds-voronkov.txt', 'utf8');
  expect(createHash('sha256').update(source).digest('hex')).toBe('664b74b1fbf718e8a5366f2d5be1db8b56f0092dc8be552aa4a198ac6acd65c7');
  await page.goto('/?role=mass&section=learning&view=invest-class&item=pds-questions');
  expect((await page.locator('.invest-class-transcript [data-source-text]').allTextContents()).join('')).toBe(source);
  await expect(page.locator('.invest-class-qa')).toHaveCount(7);
  await expect(page.locator('.invest-class-qa h2')).toHaveCount(7);
  await expect(page.locator('.invest-class-speaker')).toHaveCount(0);
  await expect(page.getByText('Краткий разбор по материалам встречи с Евгением Воронковым.')).toHaveCount(0);
});

test('carousel never shifts the dashboard and uses the shared type scale', async ({ page }) => {
  await page.goto('/?role=mass&section=home');
  await waitForStablePage(page);
  const widget = page.getByRole('article', { name: 'Инвест-класс', exact: true });
  const geometry = () => page.locator('.dashboard-main > *, .dashboard-side, .app-footer').evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect();
    return { x: rect.x, y: rect.y + scrollY, width: rect.width, height: rect.height };
  }));
  const initial = await geometry();
  const anchors = () => widget.evaluate(element => {
    const outer = element.getBoundingClientRect();
    return ['.widget-header', '.event-meta-row', '.invest-class-preview', '.widget-card-footer', '.widget-card-footer a', '.carousel-pager'].map(selector => {
      const rect = element.querySelector(selector)!.getBoundingClientRect();
      return { top: rect.top - outer.top, bottom: selector === '.invest-class-preview' ? undefined : rect.bottom - outer.top };
    });
  });
  const initialAnchors = await anchors();
  let rewardTop: number | undefined;
  for (const [index, id] of items.entries()) {
    await widget.getByRole('button', { name: `Инвест-класс ${index + 1} из 5` }).click();
    await waitForStablePage(page);
    await expect(widget).toHaveCSS('height', '342px');
    expect(await geometry()).toEqual(initial);
    expect(await anchors()).toEqual(initialAnchors);
    if (await widget.locator('.reward-chip').count()) {
      const top = await widget.locator('.reward-chip').evaluate(element => element.getBoundingClientRect().top - element.closest('article')!.getBoundingClientRect().top);
      rewardTop ??= top;
      expect(top).toBe(rewardTop);
    }
    const content = await widget.locator('.invest-class-preview').boundingBox();
    const tail = await widget.locator('.invest-class-tail').boundingBox();
    for (const child of await widget.locator('.invest-class-preview > *').all()) {
      const box = await child.boundingBox();
      expect(box!.y + box!.height).toBeLessThanOrEqual(content!.y + content!.height + 1);
      expect(box!.y + box!.height).toBeLessThanOrEqual(tail!.y - 11);
    }
    const footer = await widget.locator('.widget-card-footer').boundingBox();
    const pager = await widget.locator('.carousel-pager').boundingBox();
    expect(footer!.y + footer!.height).toBeLessThanOrEqual(pager!.y);
    for (const label of await widget.locator('.widget-meta, .invest-class-progress > span').all()) {
      await expect(label).toHaveCSS('font-size', '13px');
      await expect(label).toHaveCSS('font-weight', '400');
      await expect(label).toHaveCSS('line-height', '18.2px');
      await expect(label).toHaveCSS('font-family', '"Alfa Interface Sans", Arial, sans-serif');
    }
    await expect(page).toHaveScreenshot(`home-${id}.png`, { fullPage: true });
  }
});
