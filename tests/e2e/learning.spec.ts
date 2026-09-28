import { expect, test } from '@playwright/test';
import { dailyProgress, nextDailyItem, selectDailyAssignments, type DailyAssignment } from '../../src/domain/learning';
import { expectNoHorizontalOverflow, waitForStablePage } from './helpers';
const fixture = 'http://127.0.0.1:4174/tests/fixtures/learning.html';
for (const mode of ['default', 'started', 'empty', 'unknown', 'policy', 'denied', 'completed', 'none', 'stale', 'pending', 'loading']) {
  test(`Daily state: ${mode}`, async ({ page }) => {
    await page.goto(`${fixture}?case=${mode}`);
    const cards = page.getByRole('article', { name: 'Daily Invest' });
    await expect(cards).toHaveCount(2);
    await expect(cards.first()).toHaveText((await cards.last().textContent())!);
    if (mode === 'default' || mode === 'started') {
      await expect(cards.first().getByRole('progressbar')).toHaveAttribute('aria-valuenow', String(Math.round(4 / 7 * 100)));
      await expect(cards.first().getByRole('link', { name: mode === 'started' ? 'Продолжить' : 'Начать следующий элемент' })).toHaveAttribute('href', new RegExp(`item=i${mode === 'started' ? 6 : 5}&version=v1`));
    }
    if (['empty', 'unknown', 'policy', 'none', 'loading', 'denied'].includes(mode)) await expect(page.getByRole('progressbar')).toHaveCount(0);
    if (mode === 'completed') await expect(cards.first().getByText('Завершение подтверждено')).toBeVisible();
    if (mode === 'stale') await expect(cards.first().getByText(/Данные требуют обновления/)).toBeVisible();
    if (mode === 'pending') await expect(cards.first().getByText(/Ожидаем результат/)).toBeVisible();
    await expectNoHorizontalOverflow(page);
    if (mode === 'default') await expect(page).toHaveScreenshot('daily-confirmed.png', { fullPage: true });
  });
}
test('retry reads source and link-only launch never completes an item', async ({ page }) => {
  await page.goto(`${fixture}?case=error`);
  await expect(page.getByText(/Не удалось загрузить Daily Invest/).first()).toBeVisible();
  await page.getByRole('button', { name: 'Обновить' }).first().click();
  await expect(page.getByRole('progressbar').first()).toBeVisible();
  await page.goto(`${fixture}?case=link&view=item&assignment=a&item=i5&version=v1`);
  const launch = page.getByRole('link', { name: 'Открыть в LMS' });
  await expect(launch).toHaveAttribute('target', '_blank');
  await expect(launch).toHaveAttribute('href', 'https://learning.example.org/item');
  await page.route('https://learning.example.org/**', route => route.fulfill({ body: 'Learning system' }));
  const popup = page.waitForEvent('popup');
  await launch.click();
  await (await popup).close();
  await page.reload();
  await expect(page.getByText(/Подтверждено 4 из 7/)).toBeVisible();
});
test('details reject mismatched IDs, versions and parameters', async ({ page }) => {
  for (const query of ['view=assignment&assignment=missing', 'view=item&assignment=a&item=i5&version=wrong', 'view=assignment&assignment=a&item=i5', 'view=item&assignment=a&item=i5&version=v1&product=oms']) {
    await page.goto(`${fixture}?${query}`);
    await expect(page.getByText(/Объект недоступен/)).toBeVisible();
    await expect(page.getByRole('progressbar')).toHaveCount(0);
  }
});
test('Mass home and learning share the supplied progress; other roles cannot open assignments', async ({ page }) => {
  await page.goto('/?role=mass&section=home');
  const daily = page.getByRole('article', { name: 'Daily Invest' });
  await expect(daily.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3');
  await expect(daily.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '5');
  await expect(daily.getByRole('link', {name: 'Мое обучение'})).toHaveAttribute('href', 'https://alfapeople.alfabank.ru/lxp-my-education/');
  await page.goto('/?role=mass&section=learning');
  await expect(page.locator('.edu-daily-card').getByRole('progressbar')).toHaveAttribute('aria-valuenow','60');
  await expectNoHorizontalOverflow(page);
  await page.goto('/?role=only&section=learning&view=assignment&assignment=a');
  await expect(page.getByText('Нет доступа к назначениям')).toBeVisible();
});

test('selector respects evidence, corrections, optional items and source resume target', () => {
  const base = { id: 'a', access: 'allowed', status: 'in_progress', completionPolicyRef: 'p', assignedAt: '2026-09-20', required: true, revision: 2, items: [
    { id: 'i1', version: 'v', required: true, access: 'allowed', publication: 'published', eligible: true, order: 1, state: 'completed', result: { evidenceRef: 'r', policyRef: 'p', confirmedAt: '2026-09-21' } },
    { id: 'i2', version: 'v', required: true, access: 'allowed', publication: 'published', eligible: true, order: 2, state: 'not_started' },
    { id: 'optional', version: 'v', required: false, access: 'allowed', publication: 'published', eligible: true, order: 3, state: 'not_started' },
  ] } as DailyAssignment;
  expect(dailyProgress(base)).toEqual({ completed: 1, total: 2 });
  expect(nextDailyItem(base)?.id).toBe('i2');
  expect(nextDailyItem({ ...base, resumeTarget: { item: 'optional', version: 'v' } })?.id).toBe('optional');
  expect(nextDailyItem({ ...base, resumeTarget: { item: 'i1', version: 'v' } })).toBeNull();
  expect(nextDailyItem({ ...base, access: 'denied' })).toBeNull();
  const corrected = { ...base, items: base.items.map(i => i.id === 'i1' ? { ...i, state: 'unknown' as const, result: undefined } : i) };
  expect(dailyProgress(corrected)).toBeNull();
  expect(nextDailyItem(corrected)).toBeNull();
  expect(dailyProgress({ ...base, items: [...base.items, base.items[0]] })).toBeNull();
  const snapshot = { assignments: [{ ...base, revision: 1, title: 'old' }, { ...base, title: 'new' }] } as Parameters<typeof selectDailyAssignments>[0];
  expect(selectDailyAssignments(snapshot).map(a => a.title)).toEqual(['new']);
});

test('detail exposes freshness and retry without guessing completion', async ({ page }) => {
  await page.goto(`${fixture}?case=stale&view=assignment&assignment=a`);
  await expect(page.getByText(/Данные требуют обновления/)).toBeVisible();
  await page.getByRole('button', { name: 'Обновить результат' }).click();
  await expect(page.getByText(/Подтверждено 4 из 7/)).toBeVisible();
  await expect(page.getByText('Завершение подтверждено')).toHaveCount(0);
});
