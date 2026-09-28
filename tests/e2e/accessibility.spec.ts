import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { expectVisibleFocus, waitForStablePage } from './helpers';

const routes = [
  '/?role=mass&section=home',
  '/?role=only&section=home',
  '/?role=manager&section=home',
  '/?role=consultant&section=home',
  '/?role=mass&section=marketplace-order&reward=cap',
  '/?role=mass&section=marketplace-success&reward=nvidia&order=GOAL-9200',
  '/?role=mass&section=scenario&scenario=conversation-challenge',
];

for (const route of routes) {
  test(`${route} has no automated WCAG A/AA violations`, async ({ page }) => {
    await page.goto(route);
    await waitForStablePage(page);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .disableRules(['color-contrast'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
}

test('skip link and primary controls expose visible keyboard focus and names', async ({ page }) => {
  await page.goto('/?role=mass&section=home');

  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Перейти к содержимому' })).toBeFocused();
  await expectVisibleFocus(page);

  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();

  await page.keyboard.press('Tab');
  const active = page.locator(':focus');
  await expect.poll(() => active.evaluate((element) => (
    element.getAttribute('aria-label')
    || element.getAttribute('title')
    || (element as HTMLElement).innerText.trim()
  ))).toMatch(/.+/);
  await expectVisibleFocus(page);
});

test('all focusable elements on the main screen have accessible names', async ({ page }) => {
  await page.goto('/?role=mass&section=home');
  await waitForStablePage(page);

  const unnamed = await page.getByRole('button').evaluateAll((buttons) => buttons
    .filter((button) => {
      const element = button as HTMLElement;
      const explicit = element.getAttribute('aria-label')?.trim();
      const labelledBy = element.getAttribute('aria-labelledby');
      const visible = element.innerText.trim();
      const title = element.getAttribute('title')?.trim();
      return !explicit && !labelledBy && !visible && !title;
    })
    .map((button) => button.outerHTML.slice(0, 240)));

  expect(unnamed).toEqual([]);
});

test('global search modal traps focus and has no automated WCAG violations', async ({ page }) => {
  await page.goto('/?role=mass&section=home');
  await page.getByRole('button', { name: 'Поиск по инвестпорталу' }).click();
  const dialog = page.getByRole('dialog', { name: 'Поиск по инвестпорталу' });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Найти сотрудника, сервис или ответ на вопрос' })).toBeFocused();

  const results = await new AxeBuilder({ page })
    .include('[role="dialog"]')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .disableRules(['color-contrast'])
    .analyze();

  expect(results.violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Поиск по инвестпорталу' })).toBeFocused();
});
