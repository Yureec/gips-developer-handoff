import { expect, test } from '@playwright/test';
import { waitForStablePage } from './helpers';

test('shell geometry belongs to its variant, independently of parent layout', async ({ page }) => {
  await page.goto('http://127.0.0.1:4174/tests/fixtures/widget-contracts.html');
  await waitForStablePage(page);
  for (const parent of ['plain', 'grid']) {
    const root = page.getByTestId(parent);
    const dashboard = root.locator('.role-section--dashboard');
    const content = root.locator('.role-section--content');
    expect((await dashboard.boundingBox())!.height).toBe(342);
    expect((await content.boundingBox())!.height).toBeLessThan(342);
    for (const section of [dashboard, content]) {
      await expect(section).toHaveCSS('padding', page.viewportSize()!.width === 1366 ? '20px' : '24px');
      await expect(section).toHaveCSS('border-radius', '16px');
      await expect(section.locator('h2')).toHaveCSS('font-size', '20px');
    }
  }
  const long = page.locator('.role-section').filter({ has: page.getByRole('heading', { name: 'Long content' }) });
  expect((await long.boundingBox())!.height).toBeGreaterThan(342);
  const last = await long.getByRole('row').last().boundingBox();
  const shell = await long.boundingBox();
  expect(last!.y + last!.height).toBeLessThan(shell!.y + shell!.height);
});

const routes = [
  '/?role=manager&section=home',
  '/?role=consultant&section=home',
  '/?role=partner&section=home',
  '/?role=manager&section=employee-profile&employee=kirill',
  '/?role=manager&section=partner-log',
];
for (const route of routes) {
  test(`explicit shell contracts: ${route}`, async ({ page }) => {
    await page.goto(route);
    await waitForStablePage(page);
    async function check() {
      const sections = page.locator('.role-section');
      expect(await sections.count()).toBeGreaterThan(0);
      for (const section of await sections.all()) {
        const info = await section.evaluate(el => ({
          dashboard: el.classList.contains('role-section--dashboard'),
          content: el.classList.contains('role-section--content'),
          min: getComputedStyle(el).minBlockSize,
        }));
        expect(Number(info.dashboard) + Number(info.content)).toBe(1);
        expect(info.min).toBe(info.dashboard ? '342px' : 'auto');
      }
    }
    await check();
    if (route === routes[0]) {
      await page.locator('.role-tabs').getByRole('button', { name: 'Only', exact: true }).click();
      await check();
    }
    if (route === routes[1]) {
      const table = page.locator('.role-table-scroll--focus-products table');
      await expect(table).toHaveCSS('table-layout', 'fixed');
      await expect(table).toHaveCSS('font-size', '12px');
      await expect(table.getByRole('columnheader')).toHaveCount(6);
    }
  });
}
