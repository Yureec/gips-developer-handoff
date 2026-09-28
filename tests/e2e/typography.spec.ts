import { expect, test, type Page } from '@playwright/test';

import { expectNoHorizontalOverflow, waitForStablePage } from './helpers';

async function expectTextFits(page: Page, selector: string) {
  const clipped = await page.locator(selector).evaluateAll((elements) => elements.flatMap((element) => {
    const node = element as HTMLElement;
    const style = getComputedStyle(node);
    const horizontal = node.scrollWidth > node.clientWidth + 1 && style.overflowX !== 'visible';
    const vertical = node.scrollHeight > node.clientHeight + 1 && style.overflowY !== 'visible';
    return horizontal || vertical ? [node.textContent?.trim() || selector] : [];
  }));
  expect(clipped, `${selector} must keep its complete visible text`).toEqual([]);
}

test('semantic typography tokens and typed variants stay consistent', async ({ page }) => {
  await page.goto('/?role=manager&section=home');
  await waitForStablePage(page);

  const tokens = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return Object.fromEntries([
      '--gips-type-page-title-size',
      '--gips-type-section-title-size',
      '--gips-type-card-title-size',
      '--gips-type-metric-display-size',
      '--gips-type-metric-compact-size',
      '--gips-type-metric-inline-size',
      '--gips-type-metadata-size',
    ].map((name) => [name, style.getPropertyValue(name).trim()]));
  });
  expect(tokens).toEqual({
    '--gips-type-page-title-size': '32px',
    '--gips-type-section-title-size': '24px',
    '--gips-type-card-title-size': '20px',
    '--gips-type-metric-display-size': '32px',
    '--gips-type-metric-compact-size': '28px',
    '--gips-type-metric-inline-size': '20px',
    '--gips-type-metadata-size': '12px',
  });

  await expect(page.locator('.role-hero .gips-heading--page')).toHaveCSS('font-size', '32px');
  await expect(page.locator('.role-section .gips-heading--card').first()).toHaveCSS('font-size', '20px');
  await expect(page.locator('.role-hero .gips-metric-value--inline').first()).toHaveCSS('font-size', '20px');
  await expect(page.locator('.role-metric-card .gips-metric-value--compact').first()).toHaveCSS('font-size', '28px');
  await expect(page.locator('.role-large-value').first()).toHaveCSS('font-size', '32px');
  await expect(page.locator('.role-large-value').first()).toHaveCSS('font-variant-numeric', 'tabular-nums');
  await expectTextFits(page, '.role-section .gips-heading,.role-hero__metrics dt,.role-hero__metrics small');
  await expectNoHorizontalOverflow(page);
});

const pages = [
  ['only-product', '/?role=only&section=focus&product=opif'],
  ['learning', '/?role=mass&section=learning'],
  ['partner-log', '/?role=manager&section=partner-log'],
  ['placeholder', '/?role=only&section=learning'],
  ['focus-product', '/?role=mass&section=focus&product=nsj'],
] as const;

for (const [name, route] of pages) {
  test(`typography, wrapping and visual contract: ${name}`, async ({ page }) => {
    await page.goto(route);
    await waitForStablePage(page);
    await expectNoHorizontalOverflow(page);
    await expectTextFits(page, 'h1:not(.sr-only),h2:not(.sr-only),h3:not(.sr-only),dt,.gips-metadata');

    if (name === 'only-product') {
      const headings = page.locator('.only-product-block > .gips-heading--card,.only-product-script > .gips-heading--card');
      expect(await headings.count()).toBeGreaterThan(1);
      for (const heading of await headings.all()) {
        await expect(heading).toHaveCSS('font-size', '20px');
        await expect(heading).toHaveCSS('text-transform', 'none');
      }
    }

    if (name === 'placeholder') {
      await expect(page.locator('.section-placeholder .gips-heading--page')).toHaveCSS('font-size', '32px');
    }

    await expect(page).toHaveScreenshot(`ui05-${name}.png`, { fullPage: true });
  });
}
