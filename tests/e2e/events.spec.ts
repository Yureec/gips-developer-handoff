import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { waitForStablePage } from './helpers';
const root = 'http://127.0.0.1:4174/tests/fixtures/events.html?role=mass&section=learning';
const detail = root + '&view=event&event=workshop';
test('shared preview, exact URL, keyboard, reload and browser history', async ({ page }) => {
  await page.goto(root);
  await expect(page.getByRole('heading', { name: 'Устаревший дубль' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Открыть событие' })).toHaveCount(3);
  const link = page.getByRole('link', { name: 'Открыть событие' }).first();
  await link.focus(); await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/event=workshop/);
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await page.reload(); await expect(page.getByRole('heading', { level: 1 })).toContainText('Практикум');
  await page.goBack(); await expect(page.getByRole('link', { name: 'Все мероприятия' })).toBeVisible();
  await page.goForward(); await expect(page.getByRole('heading', { level: 1 })).toContainText('Практикум');
  await expect(page.getByText('Посещение пока не подтверждено', { exact: true })).toBeVisible();
});
test('filters, search, pagination and explicit return preserve URL and scroll', async ({ page }) => {
  await page.goto(root + '&view=events&format=webinar&q=Вебинар&page=2');
  await expect(page.getByText('Страница 2 из 2')).toBeVisible();
  const before = page.url();
  await page.getByRole('link', { name: 'Открыть событие' }).first().click();
  await page.getByRole('link', { name: 'Вернуться к афише' }).click();
  await expect(page).toHaveURL(before);
  await page.reload(); await expect(page.getByRole('textbox', { name: 'Поиск мероприятий' })).toHaveValue('Вебинар');
  await page.getByRole('textbox', { name: 'Поиск мероприятий' }).fill('не существует');
  await page.getByRole('button', { name: 'Найти', exact: true }).click();
  await expect(page.getByText('По выбранным условиям ничего не найдено')).toBeVisible();
  await page.getByRole('link', { name: 'Сбросить фильтры' }).click();
  const format = page.getByRole('combobox', { name: 'Формат' }); await format.focus(); await page.keyboard.press('Enter'); await page.getByRole('option', { name: 'Практикумы', exact: true }).click();
  await expect(page).toHaveURL(/format=workshop/);
});
for (const [mode, text] of Object.entries({ cancelled: 'Изменение программы', moved: 'Событие перенесено.', denied: 'Нет доступа к событию', stale: 'Данные требуют обновления', unknown: 'Время уточняется', full: 'Свободных мест нет', closed: 'Регистрация закрыта', pending: 'Ожидаем подтверждение регистрации', waitlisted: 'Вы в листе ожидания', registered: 'Регистрация подтверждена', unconfirmed: 'Ожидаем подтверждение регистрации', foreign: 'Статус участия пока недоступен', 'no-recording': 'Запись пока не опубликована' })) {
  test('event state ' + mode, async ({ page }) => {
    await page.goto(detail + '&case=' + mode);
    await expect(page.getByText(text, { exact: false }).first()).toBeVisible();
    if (mode !== 'moved') await expect(page.getByRole('button', { name: 'Записаться', exact: true })).toHaveCount(0);
    if (['cancelled', 'stale', 'unknown', 'denied'].includes(mode)) await expect(page.getByRole('link', { name: /Подключиться/ })).toHaveCount(0);
    if (mode === 'denied') await expect(page.getByText('Условия организатора')).toHaveCount(0);
  });
}
test('registration retry is idempotent and confirmation is source-owned', async ({ page }) => {
  await page.goto(detail + '&case=registration-error');
  await page.getByRole('button', { name: 'Записаться', exact: true }).click();
  await expect(page.getByText(/Не удалось получить ответ/)).toBeVisible();
  await page.getByRole('button', { name: 'Повторить регистрацию' }).click();
  await expect(page.getByText('Регистрация подтверждена', { exact: true }).first()).toBeVisible();
  const result = await page.evaluate(() => (window as unknown as { eventRequests: { id: string; revision: number; requests: string[] } }).eventRequests);
  expect(result.id).toBe('workshop'); expect(result.revision).toBe(2); expect(result.requests).toHaveLength(2); expect(new Set(result.requests).size).toBe(1);
  await expect(page.getByText('Посещение пока не подтверждено', { exact: true })).toBeVisible();
  await page.reload(); await expect(page.getByRole('button', { name: 'Записаться', exact: true })).toHaveCount(0);
});
test('accepted request is not a confirmed registration; rejection stays actionable', async ({ page }) => {
  await page.goto(detail + '&case=accepted'); await page.getByRole('button', { name: 'Записаться', exact: true }).click();
  await expect(page.getByText('Ожидаем подтверждение регистрации').first()).toBeVisible();
  await expect(page.getByText('Регистрация подтверждена', { exact: true })).toHaveCount(0);
  await page.goto(detail + '&case=rejected'); await page.getByRole('button', { name: 'Записаться', exact: true }).click();
  await expect(page.getByText('Приём заявок завершён')).toBeVisible();
});
test('recording exact version, publication and no click evidence', async ({ page }) => {
  await page.goto(detail + '&case=recordings');
  await expect(page.getByRole('link', { name: /Смотреть запись/ })).toHaveAttribute('href', /workshop\/recording\/r1\?version=v2/);
  await expect(page.getByText('Старая запись')).toHaveCount(0);
  await expect(page.getByText('Просмотр записи пока не подтверждён')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Записаться', exact: true })).toHaveCount(0);
  await page.goto(detail + '&case=bad-link'); await expect(page.getByRole('link', { name: /Подключиться/ })).toHaveCount(0);
});
for (const [mode, text] of Object.entries({ loading: 'Загружаем мероприятия…', unavailable: 'Мероприятия пока недоступны', 'no-access': 'Нет доступа к мероприятиям', empty: 'В этом списке пока нет мероприятий', error: 'Не удалось загрузить мероприятия. Попробуйте ещё раз.' })) {
  test('read ' + mode, async ({ page }) => {
    await page.goto(root + '&view=events&case=' + mode); await expect(page.getByText(text, { exact: true })).toBeVisible();
    if (mode === 'error') { await page.getByRole('button', { name: 'Обновить', exact: true }).click(); await expect(page.getByText('Мероприятий: 12')).toBeVisible(); }
  });
}
test('invalid IDs, duplicate and incompatible params never open another object', async ({ page }) => {
  for (const suffix of ['&event=other', '&assignment=exam', '&role=only', '&version=v1']) { await page.goto(detail + suffix); await expect(page.getByText('Объект недоступен. Проверьте адрес события.')).toBeVisible(); await expect(page.getByRole('button', { name: 'Записаться', exact: true })).toHaveCount(0); }
  await page.goto(detail.replace('workshop', 'missing')); await expect(page.getByText('Событие не найдено')).toBeVisible();
});
test('visual evidence, accessibility and supported widths', async ({ page }, info) => {
  await page.goto(root + '&view=events');
  await expect(page.getByText('Мероприятий: 12')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).disableRules(['color-contrast']).analyze()).violations).toEqual([]);
  await page.screenshot({ path: `docs/learning/learn-04-events-${info.project.name.endsWith('1920') ? '1920' : '1366'}.png`, fullPage: true });
  await page.goto(detail + '&case=moved'); await expect(page.getByRole('link', { name: /Подключиться/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `docs/learning/learn-04-event-${info.project.name.endsWith('1920') ? '1920' : '1366'}.png`, fullPage: true });
});
test('production entry points keep queue and remove assessments from events', async ({ page }) => {
  await page.goto('/?role=mass&section=learning&view=events'); await expect(page.getByRole('link', { name: 'Открыть материал' })).toHaveCount(2); await expect(page.getByText('Тестирование по ПДС', { exact: true })).toHaveCount(0);
  await page.goto('/?role=mass&section=learning'); await expect(page.getByText('Тестирование по ПДС', { exact: true })).toHaveCount(1); await expect(page.getByRole('link', { name: 'Все назначения', exact: true })).toBeVisible(); await page.getByRole('link', { name: 'Открыть тестирования' }).click(); await expect(page).toHaveURL(/kind=assessment/);
});
test('calendar export keeps authoritative schedule and never registers', async ({ page }) => {
  await page.goto(detail + '&case=moved');
  const link = page.getByRole('link', { name: 'Добавить в календарь' });
  await expect(link).toHaveAttribute('download', 'event.ics');
  const href = await link.getAttribute('href');
  const calendar = await page.evaluate(async url => (await fetch(url!)).text(), href);
  expect(calendar).toContain('DTSTART:20261001T120000Z');
  expect(calendar).toContain('UID:workshop');
  expect(calendar).toContain('SEQUENCE:2');
  expect(await page.evaluate(() => 'eventRequests' in window)).toBe(false);
  await page.goto(detail + '&case=cancelled');
  await expect(page.getByRole('link', { name: 'Добавить в календарь' })).toHaveCount(0);
});

test('event list restores measured scroll after explicit return', async ({ page }) => {
  await page.goto(root + '&view=events&format=webinar');
  await waitForStablePage(page);
  const link = page.getByRole('link', { name: 'Открыть событие' }).last();
  await link.scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => scrollY);
  await link.click();
  await page.getByRole('link', { name: 'Вернуться к афише' }).click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(before, -1);
});
