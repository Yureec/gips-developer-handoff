import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { isOverdue, knownDeadline, selectAssignments, selectDailyAssignments, type DailyAssignment, type LearningSnapshot } from '../../src/domain/learning';
import { expectNoHorizontalOverflow, waitForStablePage } from './helpers';
const fixture = 'http://127.0.0.1:4174/tests/fixtures/assignments.html';
const query = '?role=mass&section=learning';
test('queue deduplicates Daily and preserves explicit group in all assignments', async ({ page }) => {
  await page.goto(fixture + query);
  const queue = page.getByRole('region', { name: 'Назначения и тестирования' });
  await expect(queue.getByText('Daily приоритет')).toHaveCount(0);
  await expect(queue.getByText('Устаревший дубль')).toHaveCount(0);
  await expect(queue.locator('.assignment-row')).toHaveCount(3);
  await expect(queue.getByText('Назначений: 13')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Назначения с истёкшим сроком · 2' })).toBeVisible();
  await queue.getByRole('link', { name: 'Все назначения' }).click();
  await expect(page.locator('.assignment-row')).toHaveCount(10);
  await expect(page.getByText('Daily приоритет')).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: `docs/learning/learn-03-queue-${page.viewportSize()!.width}.png`, fullPage: true });
});
test('filtered list -> assignment -> attempt -> result retains history and reload', async ({ page }) => {
  await page.goto(`${fixture}${query}&view=assignments&status=active&kind=assessment&q=клиентскими`);
  await page.getByRole('link', { name: 'Открыть назначение' }).click();
  await expect(page.getByText('Правила прохождения и попыток пока недоступны')).toBeVisible();
  await expect(page.getByText('Тест не пройден')).toBeVisible();
  await page.getByRole('link', { name: 'Проверено · 2026-09-20T08:00:00Z' }).click();
  await expect(page).toHaveURL(/view=attempt&assignment=exam&attempt=try1/);
  await page.getByRole('link', { name: 'Открыть результат попытки' }).click();
  await page.reload();
  await expect(page.getByText('Баллы: 0 из 100')).toBeVisible();
  await expect(page.getByText('Тест не пройден')).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Попытка тестирования' })).toBeVisible();
  await page.goForward();
  await expect(page.getByRole('heading', { name: 'Результат тестирования' })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: `docs/learning/learn-03-result-${page.viewportSize()!.width}.png`, fullPage: true });
  await page.getByRole('link', { name: 'Назад к попытке' }).click();
  await page.getByRole('link', { name: 'Назад к назначению' }).click();
  await page.getByRole('link', { name: 'Вернуться к списку' }).click();
  await expect(page.getByRole('textbox', { name: 'Поиск назначений' })).toHaveValue('клиентскими');
  await expect(page).toHaveURL(/kind=assessment/);
});
test('pagination, search, empty and completed views survive reload; keyboard works', async ({ page }) => {
  await page.goto(`${fixture}${query}&view=assignments&status=active&kind=course&page=2`);
  await expect(page.getByText('Страница 2 из 2')).toBeVisible();
  await page.getByRole('link', { name: 'Открыть назначение' }).first().click();
  await page.getByRole('link', { name: 'Вернуться к списку' }).click();
  await page.reload();
  await expect(page.getByText('Страница 2 из 2')).toBeVisible();
  const search = page.getByRole('textbox', { name: 'Поиск назначений' });
  await search.fill('нет такого');
  await search.press('Enter');
  await expect(page.getByText('По выбранным условиям ничего не найдено')).toBeVisible();
  await page.getByRole('link', { name: 'Сбросить фильтры' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.assignment-row')).toHaveCount(10);
  await page.goto(`${fixture}${query}&view=assignments&status=completed`);
  await expect(page.getByText('Завершённое назначение')).toBeVisible();
  await expect(page.getByText('Завершение подтверждено')).toBeVisible();
});
test('strict address and parent checks reject conflicts', async ({ page }) => {
  for (const suffix of ['view=attempt&assignment=course-0&attempt=try1', 'view=result&assignment=exam&result=missing', 'view=result&assignment=exam&result=r1&attempt=try1', 'view=assignments&status=bogus', 'view=assignments&status=active&page=-1', 'view=assignments&status=active&status=completed', 'view=attempt&assignment=exam&attempt=try1&product=oms', 'view=item&assignment=exam&item=test&version=old']) {
    await page.goto(`${fixture}${query}&${suffix}`);
    await expect(page.getByText(/Объект недоступен/)).toBeVisible();
    await expect(page.getByText('Баллы: 0 из 100')).toHaveCount(0);
  }
});
for (const mode of ['loading', 'unavailable', 'error', 'no-access', 'empty', 'stale', 'pending']) test(`assignment source state ${mode}`, async ({ page }) => {
  await page.goto(`${fixture}${query}&view=assignments&status=active&case=${mode}`);
  const labels = { loading: 'Загружаем назначения…', unavailable: 'Назначения пока недоступны', error: 'Не удалось загрузить назначения. Попробуйте ещё раз.', 'no-access': 'Нет доступа к назначениям', empty: 'Нет назначений в этом списке', stale: /Данные требуют обновления/, pending: /Ожидаем результат/ };
  await expect(page.getByText(labels[mode as keyof typeof labels])).toBeVisible();
  if (mode === 'error') { await page.getByRole('button', { name: 'Обновить', exact: true }).click(); await expect(page.locator('.assignment-row')).toHaveCount(10); }
  await expectNoHorizontalOverflow(page);
});
test('no disclosure or inferred success for denied, unconfirmed and corrected results', async ({ page }) => {
  await page.goto(`${fixture}${query}&view=result&assignment=exam&result=r1&case=result-denied`);
  await expect(page.getByText('Нет доступа к объекту обучения')).toBeVisible();
  await expect(page.getByText('Баллы: 0 из 100')).toHaveCount(0);
  await page.goto(`${fixture}${query}&view=result&assignment=exam&result=r1&case=uncertain`);
  await expect(page.getByText('Результат ожидает подтверждения')).toBeVisible();
  await expect(page.getByText('Тест пройден', { exact: true })).toHaveCount(0);
  await page.goto(`${fixture}${query}&view=result&assignment=exam&result=r1&case=corrected`);
  await expect(page.getByText('Результат заменён новой оценкой')).toBeVisible();
  await page.goto(`${fixture}${query}&view=attempt&assignment=exam&attempt=try2`);
  await expect(page.getByText('Отправлено · ожидает проверки')).toBeVisible();
  await expect(page.getByText('Тест пройден', { exact: true })).toHaveCount(0);
});
test('priority uses valid instant and timezone, latest revision and terminal state', () => {
  const a = { id: 'a', revision: 1, required: true, access: 'allowed', group: 'assignment', status: 'assigned', assignedAt: '2026-01-01', dueAt: '2020-01-01T00:00:00Z', dueTimezone: 'Europe/Moscow' } as DailyAssignment;
  expect(isOverdue(a)).toBe(true);
  expect(knownDeadline({ ...a, dueTimezone: 'wrong' })).toBe(Infinity);
  expect(knownDeadline({ ...a, dueAt: '2020-01-01' })).toBe(Infinity);
  expect(isOverdue({ ...a, status: 'completed' })).toBe(false);
  const snapshot = { assignments: [{ ...a, revision: 0, group: 'daily' }, a, { ...a, id: 'b', dueAt: undefined }, { ...a, id: 'c', dueAt: '2099-01-01T00:00:00Z' }, { ...a, id: 'd', status: 'completed' }] } as LearningSnapshot;
  expect(selectAssignments(snapshot).map(a => a.id)).toEqual(['a', 'c', 'b', 'd']);
  expect(selectDailyAssignments(snapshot)).toHaveLength(0);
});
test('Mass queue entry and testing navigation stay in learning', async ({ page }) => {
  await page.goto('/?role=mass&section=learning');
  await waitForStablePage(page);
  await expectNoHorizontalOverflow(page);
  const dailyBox = (await page.getByRole('article', { name: 'Daily Invest' }).boundingBox())!;
  const queueBox = (await page.getByRole('region', { name: 'Назначения и тестирования' }).boundingBox())!;
  if (page.viewportSize()!.width === 1366) expect(queueBox.y).toBeGreaterThanOrEqual(dailyBox.y + dailyBox.height);
  else { expect(queueBox.y).toBe(dailyBox.y); expect(queueBox.width).toBeCloseTo(dailyBox.width, 0); }
  await page.screenshot({ path: `docs/learning/learn-03-learning-${page.viewportSize()!.width}.png`, fullPage: true });
  await page.getByRole('link', { name: 'Открыть тестирования' }).click();
  await expect(page).toHaveURL(/view=assignments&status=active&kind=assessment/);
  await expect(page.getByRole('heading', { name: 'Назначения и тестирования' })).toBeFocused();
  await page.reload();
  await expect(page.getByText('Назначения пока недоступны')).toBeVisible();
});
test('source-authorized attempt opens precisely its target without local completion', async ({ page }) => {
  await page.goto(`${fixture}${query}&view=attempt&assignment=exam&attempt=try2&case=attempt-link`);
  const link = page.getByRole('link', { name: 'Открыть в LMS' });
  await expect(link).toHaveAttribute('href', 'https://learning.example.org/attempt/try2');
  await expect(link).toHaveAttribute('target', '_blank');
  await page.route('https://learning.example.org/**', route => route.fulfill({ body: 'Attempt' }));
  const popup = page.waitForEvent('popup');
  await link.click(); await (await popup).close();
  await page.reload();
  await expect(page.getByText('Результат попытки пока недоступен')).toBeVisible();
  await expect(page.getByText('Тест пройден', { exact: true })).toHaveCount(0);
});
test('source review references keep version and reject missing material', async ({ page }) => {
  await page.goto(`${fixture}${query}&view=result&assignment=exam&result=r1&case=review`);
  await expect(page.getByRole('link', { name: 'Знание продуктов' })).toHaveAttribute('href', /view=item&assignment=exam&item=test&version=v1/);
  await expect(page.getByText('Материал недоступен')).toBeVisible();
});
test('scroll returns with list context after visiting an assignment', async ({ page }) => {
  await page.goto(`${fixture}${query}&view=assignments&status=active&kind=course`);
  await waitForStablePage(page);
  const link = page.getByRole('link', { name: 'Открыть назначение' }).last();
  await link.scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => window.scrollY);
  await link.click();
  await page.getByRole('link', { name: 'Вернуться к списку' }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeCloseTo(before, -1);
});
test('required filter shows only mandatory assignments and persists on return', async ({ page }) => {
  await page.goto(`${fixture}${query}&view=assignments&status=active&required=required`);
  await expect(page.locator('.assignment-row')).toHaveCount(2);
  await page.getByRole('link', { name: 'Открыть назначение' }).click();
  await page.getByRole('link', { name: 'Вернуться к списку' }).click();
  await expect(page).toHaveURL(/required=required/);
  await expect(page.locator('.assignment-row')).toHaveCount(2);
});

test('queue controls support keyboard selection and semantic accessibility', async ({ page }) => {
  await page.goto(`${fixture}${query}&view=assignments&status=active`);
  const state = page.getByRole('combobox', { name: /Состояние/ });
  await state.focus();
  await page.keyboard.press('Enter');
  await page.getByRole('option', { name: 'Завершённые', exact: true }).click();
  await expect(page).toHaveURL(/status=completed/);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).disableRules(['color-contrast']).analyze();
  expect(results.violations).toEqual([]);
});
