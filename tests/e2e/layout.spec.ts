import { expect, test } from '@playwright/test';
import { expectNoHorizontalOverflow, waitForStablePage } from './helpers';

const routes = [
  ...['products', 'focus', 'contest', 'learning', 'games', 'profile', 'marketplace', 'marketplace-order', 'marketplace-success', 'scenario', 'public-profile'].map(section => '/?role=mass&section=' + section),
  ...['opif', 'ul', 'realestate', 'selectel', 'kalshi', 'scfa-potential', 'scfa-shield', 'leaders'].map(product => '/?role=only&section=focus&product=' + product),
  ...['manager', 'consultant', 'partner'].map(role => '/?role=' + role + '&section=home'),
  '/?role=manager&section=partner-log',
  '/?role=manager&section=employee-profile&employee=kirill',
];
const grids = '.product-catalog-grid,.focus-overview-grid,.focus-product-grid,.learning-now-grid,.learning-module-grid,.learning-material-grid,.opportunity-grid,.league-grid,.challenge-grid,.games-bottom-grid,.profile-layout,.profile-main,.profile-side,.detail-layout,.detail-main,.detail-side,.only-product-grid,.scenario-layout,.scenario-extra-grid,.marketplace-grid,.marketplace-how,.public-profile-grid,.role-grid';
const surfaces = '.section-card,.page-hero,.role-hero,.product-catalog-card,.learning-module-card,.learning-material-grid button,.opportunity-card';
for (const route of routes) {
  test('page and surface geometry: ' + route, async ({ page }) => {
    await page.goto(route);
    await waitForStablePage(page);
    await expectNoHorizontalOverflow(page);
    const width = page.viewportSize()!.width;
    const shell = await page.locator('.content-shell').boundingBox();
    expect(shell!.width).toBe(Math.min(1440, width - 48));
    expect(shell!.x).toBe((width - shell!.width) / 2);
    for (const grid of await page.locator(grids).all()) {
      await expect(grid).toHaveCSS('gap', '24px');
    }
    for (const surface of await page.locator(surfaces).all()) {
      const compactLearningSummary = await surface.evaluate(node => node.classList.contains('edu-summary'));
      await expect(surface).toHaveCSS('padding', compactLearningSummary ? '10px 24px' : width === 1366 ? '20px' : '24px');
      await expect(surface).toHaveCSS('border-radius', '16px');
      const r = await surface.boundingBox();
      expect(r!.x).toBeGreaterThanOrEqual(shell!.x - 1);
      expect(r!.x + r!.width).toBeLessThanOrEqual(shell!.x + shell!.width + 1);
    }
    for (const grid of await page.locator('.role-page > .role-metric-grid,.marketplace-metrics').all()) {
      await expect(grid).toHaveCSS('gap', '24px');
    }
    for (const grid of await page.locator('.role-section .role-metric-grid').all()) {
      await expect(grid).toHaveCSS('gap', '12px');
    }
    const snapshot = new Map([
      ['/?role=mass&section=products', 'products'],
      ['/?role=mass&section=focus', 'focus'],
      ['/?role=mass&section=contest', 'contest'],
      ['/?role=mass&section=learning', 'learning'],
      ['/?role=mass&section=games', 'games'],
      ['/?role=mass&section=profile', 'profile'],
      ['/?role=only&section=focus&product=opif', 'only-product'],
      ['/?role=mass&section=public-profile', 'public-profile'],
      ['/?role=manager&section=partner-log', 'partner-log'],
    ]).get(route);
    if (snapshot) await expect(page).toHaveScreenshot(snapshot + '.png', { fullPage: true });
    if (route.includes('partner-log')) {
      const table = page.locator('.role-section--content').filter({ has: page.getByRole('heading', { name: 'История визитов' }) });
      const last = await table.locator('tr').last().boundingBox();
      const bounds = await table.boundingBox();
      expect(last!.y + last!.height).toBeLessThan(bounds!.y + bounds!.height);
    }
  });
}

test('navigation matches Figma geometry and preserves selected state', async ({ page }) => {
  for (const role of ['mass', 'only', 'consultant', 'partner']) {
    await page.goto('/?role=' + role + '&section=home');
    await waitForStablePage(page);
    const nav = page.getByRole('navigation', { name: 'Основные разделы' });
    const box = await nav.boundingBox();
    expect(box!.width).toBe(860);
    expect(box!.height).toBe(32);
    expect(box!.x).toBe((page.viewportSize()!.width - 860) / 2);
    const buttons = nav.getByRole('button');
    for (const button of await buttons.all()) await expect(button).toHaveCSS('font-size', '14px');
    const selected = nav.locator('[class*="segmented-control__selectedBox"]');
    await expect(selected).toHaveCSS('border-radius', '16px');
    expect((await selected.boundingBox())!.height).toBe(28);
    await buttons.nth(1).click();
    await expect(nav.getByRole('button').nth(1)).toHaveClass(/segmented-control__selected_/);
    await expect(nav.getByRole('button').nth(1)).toHaveCSS('font-weight', '500');
    const target = await nav.getByRole('button').nth(1).boundingBox();
    await expect.poll(async () => Math.abs((await selected.boundingBox())!.x - target!.x)).toBeLessThan(0.1);
  }
});
