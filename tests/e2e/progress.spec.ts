import { readFileSync } from 'node:fs';
import { expect, test, type Locator } from '@playwright/test';
import { waitForStablePage } from './helpers';

// Core 50.32 renders one translated fill inside the clipped progressbar root.
// Inspect geometry, clipping and paint, not just the accessible value or root visibility.
async function expectPaintedProgress(bars: Locator, count: number) {
  await expect(bars).toHaveCount(count);
  for (const bar of await bars.all()) {
    await bar.scrollIntoViewIfNeeded();
    await expect(bar).toBeVisible();
    const result = await bar.evaluate(root => {
      const fill = root.firstElementChild as HTMLElement;
      const track = root.getBoundingClientRect();
      const rect = fill.getBoundingClientRect();
      const style = getComputedStyle(fill);
      const left = Math.max(track.left, rect.left);
      const right = Math.min(track.right, rect.right);
      const top = Math.max(track.top, rect.top);
      const bottom = Math.min(track.bottom, rect.bottom);
      const width = Math.max(0, right - left);
      const height = Math.max(0, bottom - top);
      const value = Number(root.getAttribute('aria-valuenow'));
      const hit = width > 0 && height > 0 ? document.elementFromPoint((left + right) / 2, (top + bottom) / 2) : null;
      return { value, label: root.getAttribute('aria-label'), trackHeight: track.height,
        fraction: width / track.width, height, color: style.backgroundColor,
        trackColor: getComputedStyle(root).backgroundColor, opacity: style.opacity,
        visibility: style.visibility, hit: hit === fill || fill.contains(hit),
        margin: style.marginTop };
    });
    expect(result.label).toContain(`${result.value}%`);
    expect(result.trackHeight).toBe(8);
    expect(result.margin).toBe('0px');
    expect(result.fraction).toBeCloseTo(Math.min(100, Math.max(0, result.value)) / 100, 2);
    expect(result.height).toBe(8);
    if (result.value > 0) {
      expect(result.color).not.toBe('rgba(0, 0, 0, 0)');
      expect(result.color).not.toBe(result.trackColor);
      expect(result.opacity).toBe('1');
      expect(result.visibility).toBe('visible');
      expect(result.hit).toBe(true);
    }
  }
}

const metricBars = '.metric-widget [role="progressbar"], .role-metric-card [role="progressbar"]';
const routes = [
  ['only', '/?role=only&section=home', 4],
  ['manager', '/?role=manager&section=home', 2],
  ['log', '/?role=manager&section=partner-log', 1],
  ['consultant', '/?role=consultant&section=home', 1],
] as const;
for (const [name, route, count] of routes) {
  test(`${name}: metric fills are painted`, async ({ page }) => {
    await page.goto(route);
    await waitForStablePage(page);
    await expectPaintedProgress(page.locator(metricBars), count);
    if (name === 'log') await expect(page.locator('.role-metric-grid').first()).toHaveScreenshot('log-metrics.png');
  });
}

test('manager Only: all seven metric fills are painted', async ({ page }) => {
  await page.goto('/?role=manager&section=home');
  await page.locator('.role-tabs').getByRole('button', { name: 'Only', exact: true }).click();
  await waitForStablePage(page);
  await expectPaintedProgress(page.locator(metricBars), 7);
  await page.locator('h1').click();
  await expect(page).toHaveScreenshot('manager-only.png', { fullPage: true });
});

const employees = [...readFileSync('src/data/roleData.ts', 'utf8').matchAll(/employee\('([^']+)'/g)].map(match => match[1]);
test('every employee profile: metric fill matches plan including overfulfilment', async ({ page }) => {
  expect(employees.length).toBe(18);
  for (const employee of employees) {
    await page.goto(`/?role=manager&section=employee-profile&employee=${employee}`);
    await waitForStablePage(page);
    await expectPaintedProgress(page.locator(metricBars), 1);
    if (['kirill', 'nikolay'].includes(employee)) {
      await expect(page.locator('.role-metric-grid')).toHaveScreenshot(`employee-${employee}-metrics.png`);
    }
  }
});

test('MetricWidget and MetricCards: 0, partial and 100 percent', async ({ page }) => {
  await page.goto('http://127.0.0.1:4174/tests/fixtures/progress.html');
  await waitForStablePage(page);
  await expectPaintedProgress(page.locator(metricBars), 6);
  for (const selector of ['.metric-widget', '.role-metric-card']) {
    for (const value of [0, 45, 100]) {
      const card = page.locator(selector).filter({ has: page.getByRole('progressbar', { name: new RegExp(` ${value}%: ${value}%$`) }) });
      await expect(card).toContainText(`${value}%`);
    }
  }
  await expect(page).toHaveScreenshot('metric-progress-states.png', { fullPage: true });
});
