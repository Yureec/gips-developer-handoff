import { expect, test } from '@playwright/test';

for (const [section, parameter, unavailable] of [
  ['scenario', 'scenario', 'Сценарий недоступен'],
  ['public-profile', 'person', 'Профиль недоступен'],
] as const) {
  test(`${section}: rejects inherited, unknown and empty IDs without crashing`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const id of ['constructor', '__proto__', 'toString', 'missing-review-entity', '']) {
      await page.goto(`/?${new URLSearchParams({ role: 'mass', section, [parameter]: id })}`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(unavailable);
      await expect(page).toHaveTitle(`${unavailable} · ГИПС`);
      await page.getByRole('link', { name: 'На главную', exact: true }).click();
      await expect(page.locator('.widget--focus')).toBeVisible();
    }
    expect(errors).toEqual([]);
  });
}

test('valid and omitted entity IDs preserve supported routes and browser history', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/?role=mass&section=scenario&scenario=conversation-challenge');
  await expect(page.locator('.scenario-page')).toBeVisible();
  await page.goto('/?role=mass&section=public-profile&person=dmitry');
  await expect(page.locator('.public-profile-page')).toBeVisible();
  await page.goBack();
  await expect(page.locator('.scenario-page')).toBeVisible();
  await page.goForward();
  await expect(page.locator('.public-profile-page')).toBeVisible();
  for (const [section, selector] of [['scenario', '.scenario-page'], ['public-profile', '.public-profile-page']]) {
    await page.goto(`/?role=mass&section=${section}`);
    await expect(page.locator(selector)).toBeVisible();
  }
  expect(errors).toEqual([]);
});
